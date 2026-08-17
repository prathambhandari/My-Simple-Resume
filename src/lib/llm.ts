import { sanitizeUserLlm } from "@/lib/userLlm";

export type LlmConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmConfig(): LlmConfig | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      apiKey: groqKey,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.AI_MODEL?.trim() || "openai/gpt-oss-20b",
    };
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openRouterKey) {
    return {
      apiKey: openRouterKey,
      baseUrl: "https://openrouter.ai/api/v1",
      model: process.env.AI_MODEL?.trim() || "openai/gpt-4o-mini",
    };
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    return {
      apiKey: openAiKey,
      baseUrl:
        process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
    };
  }

  return null;
}

export function resolveLlmConfig(userRaw: unknown): {
  config: LlmConfig | null;
  usingUserKey: boolean;
} {
  const user = sanitizeUserLlm(userRaw);
  if (user) return { config: user, usingUserKey: true };
  return { config: getLlmConfig(), usingUserKey: false };
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw new Error("Model did not return JSON");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}
