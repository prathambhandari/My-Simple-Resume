import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LLM_PRESETS, LlmProvider } from "@/lib/userLlm";

type UserLlmState = {
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  setSettings: (patch: Partial<Pick<UserLlmState, "provider" | "apiKey" | "model" | "baseUrl">>) => void;
  clear: () => void;
};

const defaults = {
  provider: "groq" as LlmProvider,
  apiKey: "",
  model: LLM_PRESETS.groq.model,
  baseUrl: LLM_PRESETS.groq.baseUrl,
};

export const useUserLlmStore = create<UserLlmState>()(
  persist(
    (set) => ({
      ...defaults,
      setSettings: (patch) => set(patch),
      clear: () => set(defaults),
    }),
    { name: "simple-resume-user-llm" },
  ),
);
