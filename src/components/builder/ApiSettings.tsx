"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LLM_PRESETS, LlmProvider } from "@/lib/userLlm";
import { SETUP_PATH } from "@/lib/setup";
import { useUserLlmStore } from "@/store/useUserLlmStore";
import { cn } from "@/lib/utils";

const PROVIDERS: Array<{ id: LlmProvider; label: string }> = [
  { id: "groq", label: "Groq" },
  { id: "openai", label: "OpenAI" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "custom", label: "Custom" },
];

const KEY_PAGES: Record<
  Exclude<LlmProvider, "custom">,
  { href: string; label: string }
> = {
  groq: {
    href: "https://console.groq.com/keys",
    label: "Open Groq API Keys",
  },
  openai: {
    href: "https://platform.openai.com/api-keys",
    label: "Open OpenAI API Keys",
  },
  openrouter: {
    href: "https://openrouter.ai/settings/keys",
    label: "Open OpenRouter API Keys",
  },
};

export function ApiSettings() {
  const stored = useUserLlmStore();
  const [open, setOpen] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<LlmProvider>(stored.provider);
  const [apiKey, setApiKey] = useState(stored.apiKey);
  const [model, setModel] = useState(stored.model);
  const [baseUrl, setBaseUrl] = useState(stored.baseUrl);

  const openPanel = () => {
    setProvider(stored.provider);
    setApiKey(stored.apiKey);
    setModel(stored.model);
    setBaseUrl(stored.baseUrl);
    setShowKey(false);
    setOpen(true);
  };

  useEffect(() => {
    setOverlayRoot(document.getElementById("overlay-root"));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.classList.add("api-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("api-open");
      window.removeEventListener("keydown", onKey);
    };
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
    toast.success(apiKey.trim() ? "Saved on this device." : "Using the app default.");
  };

  const onClear = () => {
    stored.clear();
    setProvider("groq");
    setApiKey("");
    setModel(LLM_PRESETS.groq.model);
    setBaseUrl(LLM_PRESETS.groq.baseUrl);
    setOpen(false);
    toast.success("Using the app default.");
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
      {open && overlayRoot
        ? createPortal(
            <div
              className="glass-screen"
              role="dialog"
              aria-modal="true"
              aria-labelledby="api-settings-title"
            >
              <div className="relative w-full max-w-[420px]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      id="api-settings-title"
                      className="text-[17px] font-semibold tracking-tight text-white"
                    >
                      API
                    </p>
                    <p className="mt-1 text-[12px] text-white/50">
                      Stored on this device only
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-white/8 p-1.5 text-white/55 hover:bg-white/14 hover:text-white"
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="glass-track mt-8 flex rounded-full p-1">
                  {PROVIDERS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={cn(
                        "min-w-0 flex-1 rounded-full px-2 py-1.5 text-[11px] font-medium transition-colors",
                        provider === option.id
                          ? "bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                          : "text-white/45 hover:text-white/80",
                      )}
                      onClick={() => onProvider(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {provider === "custom" ? (
                  <p className="mt-4 text-[12px] leading-relaxed text-white/50">
                    Paste the key from your own API host into Key below.
                  </p>
                ) : (
                  <p className="mt-4 text-[12px] leading-relaxed text-white/50">
                    Don&apos;t have a key? You don&apos;t need to know how to
                    code. Open the API Keys page, click Create, copy the key,
                    then paste it below.{" "}
                    <a
                      href={KEY_PAGES[provider].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {KEY_PAGES[provider].label}
                    </a>
                    {provider === "groq" ? (
                      <>
                        {" "}
                        Or follow{" "}
                        <Link
                          href={SETUP_PATH}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          easy steps
                        </Link>
                        .
                      </>
                    ) : null}
                  </p>
                )}

                <div className="glass-group mt-5 overflow-hidden rounded-2xl">
                  <label className="glass-group-row grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2 px-3.5 py-2.5">
                    <span className="text-[12px] text-white/45">Key</span>
                    <div className="relative min-w-0">
                      <input
                        type={showKey ? "text" : "password"}
                        autoComplete="off"
                        spellCheck={false}
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        placeholder="paste key"
                        className="h-8 w-full bg-transparent pr-8 text-[13px] text-white outline-none placeholder:text-white/30"
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/80"
                        aria-label={showKey ? "Hide key" : "Show key"}
                        onClick={() => setShowKey((value) => !value)}
                      >
                        {showKey ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </label>
                  <label className="glass-group-row grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2 px-3.5 py-2.5">
                    <span className="text-[12px] text-white/45">Model</span>
                    <input
                      value={model}
                      onChange={(event) => setModel(event.target.value)}
                      placeholder="model id"
                      className="h-8 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
                    />
                  </label>
                  {provider === "custom" ? (
                    <label className="glass-group-row grid grid-cols-[52px_minmax(0,1fr)] items-center gap-2 px-3.5 py-2.5">
                      <span className="text-[12px] text-white/45">URL</span>
                      <input
                        value={baseUrl}
                        onChange={(event) => setBaseUrl(event.target.value)}
                        placeholder="https://host/v1"
                        className="h-8 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/30"
                      />
                    </label>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center">
                  {stored.apiKey.trim() ? (
                    <button
                      type="button"
                      className="text-[12px] text-white/40 hover:text-white"
                      onClick={onClear}
                    >
                      Use app default
                    </button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    className="ml-auto h-8 rounded-full px-5 shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
                    onClick={onSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>,
            overlayRoot,
          )
        : null}
    </>
  );
}
