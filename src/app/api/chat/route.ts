import { NextResponse } from "next/server";
import { defaultResumeData } from "@/types/resume";
import { ChatMessage } from "@/types/chat";
import { buildAttachmentMessage, buildSystemPrompt } from "@/lib/chatPrompt";
import { extractAttachmentText } from "@/lib/extractAttachment";
import { extractJsonObject, getLlmConfig } from "@/lib/llm";
import { isResumeEmpty, normalizeResume, parseTemplate } from "@/lib/normalizeResume";
import { isValidTemplateId, templateFromUserText } from "@/lib/resumeTemplates";
import { defaultAppUi } from "@/types/ui";
import { isAppUiRequest, mergeUi, normalizeUi, uiFromUserText } from "@/lib/normalizeUi";

export const runtime = "nodejs";

function providerName(baseUrl?: string) {
  if (baseUrl?.includes("groq")) return "Groq";
  if (baseUrl?.includes("openrouter")) return "OpenRouter";
  return "OpenAI";
}

function providerErrorMessage(status: number, detail: string, baseUrl?: string) {
  let code = "";
  let message = "";
  try {
    const parsed = JSON.parse(detail) as {
      error?: { code?: string; message?: string; type?: string };
    };
    code = parsed.error?.code || parsed.error?.type || "";
    message = parsed.error?.message || "";
  } catch {
    // ignore non-JSON bodies
  }

  const provider = providerName(baseUrl);

  if (status === 401 || status === 403) {
    return `The ${provider} API key was rejected. Check .env and restart the server.`;
  }
  if (code === "insufficient_quota" || /quota|billing/i.test(message)) {
    if (provider === "Groq") {
      return "Groq hit a limit. Wait a few seconds and try again.";
    }
    return `${provider} is out of quota. Try GROQ_API_KEY in .env and restart the server.`;
  }
  if (code === "model_not_found" || /model/i.test(message)) {
    return "That model is not available on this API key. Set AI_MODEL in .env to a model your account can use.";
  }
  if (status === 429) {
    return `${provider} rate-limited the request. Wait a few seconds and try again.`;
  }
  return message.trim() || `${provider} returned an error. Try again in a moment.`;
}

export async function GET() {
  return NextResponse.json({ configured: Boolean(getLlmConfig()) });
}

export async function POST(request: Request) {
  const config = getLlmConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Add an API key in .env.local to enable chat. Use OPENAI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY, then restart the dev server.",
      },
      { status: 503 },
    );
  }

  let incoming: ChatMessage[] = [];
  let resumeRaw: unknown;
  let templateRaw: unknown;
  let uiRaw: unknown;
  let coverLetterRaw = "";
  let attachment: File | null = null;

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      incoming = JSON.parse(String(form.get("messages") || "[]")) as ChatMessage[];
      resumeRaw = JSON.parse(String(form.get("resume") || "null"));
      templateRaw = form.get("template");
      try {
        uiRaw = JSON.parse(String(form.get("ui") || "null"));
      } catch {
        uiRaw = null;
      }
      coverLetterRaw = String(form.get("coverLetter") || "");
      const file = form.get("file");
      attachment = file instanceof File && file.size > 0 ? file : null;
    } else {
      const body = (await request.json()) as {
        messages?: ChatMessage[];
        resume?: unknown;
        template?: unknown;
        ui?: unknown;
        coverLetter?: unknown;
      };
      incoming = Array.isArray(body.messages) ? body.messages : [];
      resumeRaw = body.resume;
      templateRaw = body.template;
      uiRaw = body.ui;
      coverLetterRaw = typeof body.coverLetter === "string" ? body.coverLetter : "";
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userMessages = incoming
    .filter(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-16);

  if (userMessages.length === 0 && !attachment) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const resume = normalizeResume(resumeRaw, defaultResumeData);
  const template = isValidTemplateId(templateRaw) ? templateRaw : "standard";
  const ui = normalizeUi(uiRaw, defaultAppUi);

  const llmMessages = userMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  if (attachment) {
    try {
      const extracted = await extractAttachmentText(attachment);
      const lastUser = [...userMessages].reverse().find((m) => m.role === "user");
      const combined = buildAttachmentMessage(
        attachment.name,
        extracted,
        lastUser?.content || "",
      );
      if (llmMessages.length > 0 && llmMessages[llmMessages.length - 1].role === "user") {
        llmMessages[llmMessages.length - 1] = {
          role: "user",
          content: combined,
        };
      } else {
        llmMessages.push({ role: "user", content: combined });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read that file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (llmMessages.length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const payload = {
    model: config.model,
    temperature: attachment ? 0.1 : 0.3,
    max_tokens: attachment ? 8192 : 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: buildSystemPrompt(resume, template, {
        importingFile: Boolean(attachment),
        ui,
        coverLetter: coverLetterRaw,
      }) },
      ...llmMessages,
    ],
  };

  let completion: Response;
  try {
    completion = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the AI provider. Check your network and try again." },
      { status: 502 },
    );
  }

  if (!completion.ok) {
    const detail = await completion.text();
    return NextResponse.json(
      { error: providerErrorMessage(completion.status, detail, config.baseUrl) },
      { status: 502 },
    );
  }

  const json = (await completion.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: unknown;
  };
  const content = json.choices?.[0]?.message?.content;
  const usage = json.usage;
  if (!content) {
    return NextResponse.json(
      { error: "The model returned an empty response." },
      { status: 502 },
    );
  }

  try {
    const parsed = extractJsonObject(content) as {
      reply?: unknown;
      resume?: unknown;
      template?: unknown;
      ui?: unknown;
      coverLetter?: unknown;
    };
    let nextResume = normalizeResume(
      parsed.resume,
      attachment ? defaultResumeData : resume,
    );
    if (!attachment && !isResumeEmpty(resume) && isResumeEmpty(nextResume)) {
      nextResume = resume;
    }

    const lastUserText =
      [...userMessages].reverse().find((m) => m.role === "user")?.content || "";
    const uiRequest = isAppUiRequest(lastUserText);
    const nextTemplate =
      parseTemplate(parsed.template) ??
      (uiRequest ? undefined : templateFromUserText(lastUserText)) ??
      template;
    const inferredUi = uiFromUserText(lastUserText, ui);
    const nextUi = mergeUi(ui, parsed.ui ?? inferredUi);

    let reply =
      typeof parsed.reply === "string" && parsed.reply.trim()
        ? parsed.reply.trim()
        : "Updated your resume. What should we add or change next?";

    if (
      !isResumeEmpty(resume) &&
      /upload|attach|re-send|send (me )?(the )?pdf/i.test(reply)
    ) {
      reply = nextTemplate !== template
        ? `Switched to the ${nextTemplate} layout. Your resume content is unchanged.`
        : "Your resume is already loaded. Tell me what to change.";
    }

    const nextCoverLetter =
      typeof parsed.coverLetter === "string" ? parsed.coverLetter : undefined;

    return NextResponse.json({
      reply,
      resume: nextResume,
      template: nextTemplate,
      ui: nextUi,
      coverLetter: nextCoverLetter,
      usage,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not parse the model response. Please try again." },
      { status: 502 },
    );
  }
}
