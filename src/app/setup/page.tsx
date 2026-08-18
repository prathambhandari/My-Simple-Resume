"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LLM_PRESETS } from "@/lib/userLlm";
import { useUserLlmStore } from "@/store/useUserLlmStore";

const GROQ_KEYS = "https://console.groq.com/keys";

export default function SetupPage() {
  const router = useRouter();
  const stored = useUserLlmStore();
  const [apiKey, setApiKey] = useState(stored.apiKey);
  const [showKey, setShowKey] = useState(false);

  const onSave = () => {
    const key = apiKey.trim();
    if (!key) {
      toast.error("Paste the key first.");
      return;
    }
    stored.setSettings({
      provider: "groq",
      apiKey: key,
      model: LLM_PRESETS.groq.model,
      baseUrl: LLM_PRESETS.groq.baseUrl,
    });
    toast.success("Saved. You can keep chatting.");
    router.push("/");
  };

  return (
    <div className="h-dvh overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col px-5 py-8 sm:py-12">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          My Simple Resume
        </Link>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Keep chatting with a free key
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">
          This app can use a free Groq key from you. It takes about two
          minutes. You do not need to know how to code.
        </p>

        <ol className="mt-8 space-y-5 text-[15px] leading-relaxed">
          <li>
            <span className="font-medium text-white">1. Make a free Groq account</span>
            <p className="mt-1 text-white/60">
              Open{" "}
              <a
                href="https://console.groq.com/login"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                console.groq.com
              </a>{" "}
              and sign up with email or Google.
            </p>
          </li>
          <li>
            <span className="font-medium text-white">2. Copy your key</span>
            <p className="mt-1 text-white/60">
              Go to{" "}
              <a
                href={GROQ_KEYS}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                API Keys
              </a>
              , click <span className="text-white/85">Create API Key</span>,
              then copy it. It looks like a long password starting with{" "}
              <span className="text-white/85">gsk_</span>.
            </p>
          </li>
          <li>
            <span className="font-medium text-white">3. Paste it here and save</span>
            <p className="mt-1 text-white/60">
              It stays on this computer. Then you can go back to your resume.
            </p>
          </li>
        </ol>

        <label className="glass mt-8 flex items-center gap-2 rounded-2xl px-3.5 py-3">
          <span className="shrink-0 text-[13px] text-white/45">Key</span>
          <input
            type={showKey ? "text" : "password"}
            autoComplete="off"
            spellCheck={false}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste your Groq key"
            className="h-8 min-w-0 flex-1 bg-transparent text-[14px] text-white outline-none placeholder:text-white/30"
          />
          <button
            type="button"
            className="shrink-0 text-white/40 hover:text-white"
            aria-label={showKey ? "Hide key" : "Show key"}
            onClick={() => setShowKey((value) => !value)}
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </label>

        <div className="mt-5 flex items-center gap-3">
          <Button type="button" onClick={onSave}>
            Save and go back
          </Button>
          <Link
            href="/"
            className="text-[13px] text-white/45 hover:text-white"
          >
            Back without saving
          </Link>
        </div>
      </div>
    </div>
  );
}
