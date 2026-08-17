"use client";

import { useEffect, useState } from "react";
import { KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LLM_PRESETS, LlmProvider } from "@/lib/userLlm";
import { useUserLlmStore } from "@/store/useUserLlmStore";

const fieldClass =
  "h-9 w-full rounded-lg bg-white/8 px-3 text-sm outline-none placeholder:text-muted-foreground";

const PROVIDER_OPTIONS: Array<{ id: LlmProvider; label: string }> = [
  { id: "groq", label: "Groq" },
  { id: "openai", label: "OpenAI" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "custom", label: "Custom" },
];

export function ApiSettings() {
  const stored = useUserLlmStore();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<LlmProvider>(stored.provider);
  const [apiKey, setApiKey] = useState(stored.apiKey);
  const [model, setModel] = useState(stored.model);
  const [baseUrl, setBaseUrl] = useState(stored.baseUrl);

  const openPanel = () => {
    setProvider(stored.provider);
    setApiKey(stored.apiKey);
    setModel(stored.model);
    setBaseUrl(stored.baseUrl);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onProvider = (next: LlmProvider) => {
    setProvider(next);
    if (next === "custom") return;
    setBaseUrl(LLM_PRESETS[next].baseUrl);
    setModel(LLM_PRESETS[next].model);
  };

  const onSave = () => {
    stored.setSettings({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim(),
      baseUrl: baseUrl.trim().replace(/\/+$/, ""),
    });
    setOpen(false);
    toast.success(
      apiKey.trim()
        ? "Saved. Chat will use your API on this device."
        : "Cleared. Chat will use the app default if it has one.",
    );
  };

  const onClear = () => {
    stored.clear();
    setProvider("groq");
    setApiKey("");
    setModel(LLM_PRESETS.groq.model);
    setBaseUrl(LLM_PRESETS.groq.baseUrl);
    toast.success("Removed your API key from this device.");
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="API settings"
        onClick={openPanel}
      >
        <KeyRound />
        <span className="hidden md:inline">API</span>
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-settings-title"
            className="menu-panel w-full max-w-md rounded-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <p id="api-settings-title" className="text-sm font-semibold">
                Your API
              </p>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Optional. The key stays on this device and is sent only to call
              your provider. OpenAI-compatible APIs work, including local ones
              on localhost.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Provider</span>
                <select
                  value={provider}
                  className={fieldClass}
                  onChange={(event) => onProvider(event.target.value as LlmProvider)}
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id} className="bg-neutral-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">API key</span>
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="sk-… or gsk_…"
                  className={fieldClass}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Model</span>
                <input
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder="gpt-4o-mini"
                  className={fieldClass}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Base URL</span>
                <input
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  disabled={provider !== "custom"}
                  placeholder="https://api.openai.com/v1"
                  className={`${fieldClass} disabled:opacity-50`}
                />
              </label>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Remove
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={onSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
