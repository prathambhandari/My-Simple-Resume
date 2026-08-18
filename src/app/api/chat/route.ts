import { NextResponse } from "next/server";
import { defaultResumeData } from "@/types/resume";
import { ChatMessage } from "@/types/chat";
import { buildAttachmentMessage, buildSystemPrompt } from "@/lib/chatPrompt";
import { extractAttachmentText } from "@/lib/extractAttachment";
import { extractJsonObject, getLlmConfig, resolveLlmConfig } from "@/lib/llm";
import { userOfferedApiKey, sanitizeUserLlm } from "@/lib/userLlm";
import { isResumeEmpty, normalizeResume, parseTemplate } from "@/lib/normalizeResume";
import { isValidTemplateId, templateFromUserText } from "@/lib/resumeTemplates";
import { defaultAppUi } from "@/types/ui";
import { isAppUiRequest, mergeUi, normalizeUi, uiFromUserText } from "@/lib/normalizeUi";
import { SETUP_PATH } from "@/lib/setup";

export const runtime = "nodejs";

function providerName(baseUrl?: string) {
  if (baseUrl?.includes("groq")) return "Groq";
  if (baseUrl?.includes("openrouter")) return "OpenRouter";
  return "OpenAI";
}

function providerErrorMessage(
  status: number,
  detail: string,
  baseUrl?: string,
  usingUserKey = false,
) {
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
    if (usingUserKey) {
      return `That ${provider} key was rejected. Open the API Keys page, copy a new key, and paste it in API.\n\n${SETUP_PATH}`;
    }
    return `${provider} is not accepting the app key. Add your own free key to keep chatting — you don't need to know how to code.\n\n${SETUP_PATH}`;
  }
  if (code === "insufficient_quota" || /quota|billing/i.test(message)) {
    if (usingUserKey) {
      return provider === "Groq"
        ? "Groq hit a limit on that key. Wait a bit, or try a different key in API."
        : `${provider} is out of quota on that key. Check billing on that account.`;
    }
    return `${provider} hit a usage limit. Add your own free key to keep going — you don't need to know how to code.\n\n${SETUP_PATH}`;
  }
  if (code === "model_not_found" || /model/i.test(message)) {
    return usingUserKey
      ? "That model is not available on this API key. Change the model in API settings."
      : "That model is not available on this API key. Set AI_MODEL in .env to a model your account can use.";
  }
  if (status === 429) {
    if (usingUserKey) {
      return `${provider} rate-limited that key. Wait a few seconds and try again.`;
    }
    return `${provider} hit a usage limit. Add your own free key to keep going — you don't need to know how to code.\n\n${SETUP_PATH}`;
  }
  return message.trim() || `${provider} returned an error. Try again in a moment.`;
}

export async function GET() {
  return NextResponse.json({ configured: Boolean(getLlmConfig()) });
}

export async function POST(request: Request) {
  let incoming: ChatMessage[] = [];
  let resumeRaw: unknown;
  let templateRaw: unknown;
  let uiRaw: unknown;
  let coverLetterRaw = "";
  let userLlmRaw: unknown = null;
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
      try {
        userLlmRaw = JSON.parse(String(form.get("llm") || "null"));
      } catch {
        userLlmRaw = null;
      }
      const file = form.get("file");
      attachment = file instanceof File && file.size > 0 ? file : null;
    } else {
      const body = (await request.json()) as {
        messages?: ChatMessage[];
        resume?: unknown;
        template?: unknown;
        ui?: unknown;
        coverLetter?: unknown;
        llm?: unknown;
      };
      incoming = Array.isArray(body.messages) ? body.messages : [];
      resumeRaw = body.resume;
      templateRaw = body.template;
      uiRaw = body.ui;
      coverLetterRaw = typeof body.coverLetter === "string" ? body.coverLetter : "";
      userLlmRaw = body.llm ?? null;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (userOfferedApiKey(userLlmRaw) && !sanitizeUserLlm(userLlmRaw)) {
    return NextResponse.json(
      {
        error:
          "That custom API is not valid. Use an https URL, or http://localhost for a local model.",
      },
      { status: 400 },
    );
  }

  const { config, usingUserKey } = resolveLlmConfig(userLlmRaw);
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Add a free key to keep chatting. You don't need to know how to code.\n\n" +
          SETUP_PATH,
        code: "need_key",
        setupPath: SETUP_PATH,
      },
      { status: 503 },
    );
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

  const local =
    config.baseUrl.includes("localhost") || config.baseUrl.includes("127.0.0.1");
  const payload: {
    model: string;
    temperature: number;
    max_tokens: number;
    response_format?: { type: "json_object" };
    messages: Array<{ role: string; content: string }>;
  } = {
    model: config.model,
    temperature: attachment ? 0.1 : 0.3,
    max_tokens: attachment ? 8192 : 2048,
    messages: [
      { role: "system", content: buildSystemPrompt(resume, template, {
        importingFile: Boolean(attachment),
        ui,
        coverLetter: coverLetterRaw,
      }) },
      ...llmMessages,
    ],
  };
  if (!local) payload.response_format = { type: "json_object" };

  let completion: Response;
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    if (config.baseUrl.includes("openrouter.ai")) {
      headers["HTTP-Referer"] =
        request.headers.get("origin") || "http://localhost:3000";
      headers["X-Title"] = "My Simple Resume";
    }
    completion = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
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
    const error = providerErrorMessage(
      completion.status,
      detail,
      config.baseUrl,
      usingUserKey,
    );
    const offerSetup = error.includes(SETUP_PATH);
    return NextResponse.json(
      offerSetup
        ? { error, code: "need_key", setupPath: SETUP_PATH }
        : { error },
      { status: offerSetup ? 429 : 502 },
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
