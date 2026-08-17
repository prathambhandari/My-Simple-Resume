export type LlmProvider = "groq" | "openai" | "openrouter" | "custom";
export type UserLlmPayload = {
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
};

export const LLM_PRESETS: Record<
  Exclude<LlmProvider, "custom">,
  { label: string; baseUrl: string; model: string }
> = {
  groq: {
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "openai/gpt-oss-20b",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openai/gpt-4o-mini",
  },
};

const PROVIDERS: LlmProvider[] = ["groq", "openai", "openrouter", "custom"];

export function isLlmProvider(value: unknown): value is LlmProvider {
  return typeof value === "string" && PROVIDERS.includes(value as LlmProvider);
}

export function isAllowedLlmBaseUrl(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  if (host === "169.254.169.254" || host.endsWith(".internal")) return false;
  if (parsed.protocol === "https:") return true;
  return (
    parsed.protocol === "http:" &&
    (host === "localhost" || host === "127.0.0.1")
  );
}

function inferBaseUrl(apiKey: string) {
  if (apiKey.startsWith("gsk_")) return LLM_PRESETS.groq.baseUrl;
  if (apiKey.startsWith("sk-or-")) return LLM_PRESETS.openrouter.baseUrl;
  return LLM_PRESETS.openai.baseUrl;
}

function inferModel(baseUrl: string) {
  if (baseUrl.includes("groq.com")) return LLM_PRESETS.groq.model;
  if (baseUrl.includes("openrouter.ai")) return LLM_PRESETS.openrouter.model;
  return LLM_PRESETS.openai.model;
}

export function userOfferedApiKey(raw: unknown) {
  if (!raw || typeof raw !== "object") return false;
  const key = (raw as { apiKey?: unknown }).apiKey;
  return typeof key === "string" && key.trim().length > 0;
}

export function sanitizeUserLlm(raw: unknown): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const apiKey = typeof data.apiKey === "string" ? data.apiKey.trim() : "";
  if (!apiKey || apiKey.length > 512) return null;

  const provider = isLlmProvider(data.provider) ? data.provider : null;
  let baseUrl =
    typeof data.baseUrl === "string" ? data.baseUrl.trim().replace(/\/+$/, "") : "";
  let model = typeof data.model === "string" ? data.model.trim() : "";

  if (provider && provider !== "custom") {
    const preset = LLM_PRESETS[provider];
    if (!baseUrl) baseUrl = preset.baseUrl;
    if (!model) model = preset.model;
  }

  if (!baseUrl) baseUrl = inferBaseUrl(apiKey);
  if (!isAllowedLlmBaseUrl(baseUrl)) return null;
  if (!model) model = inferModel(baseUrl);
  if (model.length > 120) return null;

  return { apiKey, baseUrl, model };
}

export function userLlmPayload(settings: {
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}): UserLlmPayload | null {
  const apiKey = settings.apiKey.trim();
  if (!apiKey) return null;
  return {
    provider: settings.provider,
    apiKey,
    model: settings.model.trim(),
    baseUrl: settings.baseUrl.trim(),
  };
}
