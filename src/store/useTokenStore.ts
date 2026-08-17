import { create } from "zustand";
import { persist } from "zustand/middleware";

type TokenState = {
  totalTokens: number;
  addTokens: (amount: number) => void;
};

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      totalTokens: 0,
      addTokens: (amount) =>
        set((state) => ({
          totalTokens: state.totalTokens + Math.max(0, Math.round(amount)),
        })),
    }),
    { name: "simple-resume-tokens" },
  ),
);

export function tokensFromUsage(usage: unknown) {
  if (!usage || typeof usage !== "object") return 0;
  const data = usage as {
    total_tokens?: unknown;
    prompt_tokens?: unknown;
    completion_tokens?: unknown;
  };
  const total = Number(data.total_tokens);
  if (Number.isFinite(total) && total > 0) return total;
  const prompt = Number(data.prompt_tokens) || 0;
  const completion = Number(data.completion_tokens) || 0;
  return prompt + completion;
}
