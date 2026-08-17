"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { useTokenStore } from "@/store/useTokenStore";
import { PdfPreview } from "@/components/preview/PdfPreview";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PhotoPicker } from "@/components/builder/PhotoPicker";
import { VersionControls } from "@/components/builder/VersionControls";
import { ResumeSwitcher } from "@/components/builder/ResumeSwitcher";
import { PreviewTabs } from "@/components/builder/PreviewTabs";
import { ExportMenu } from "@/components/preview/ExportMenu";
import { DonateLink, DonatePrompt } from "@/components/builder/DonatePrompt";
import { ApiSettings } from "@/components/builder/ApiSettings";
import { Button } from "@/components/ui/button";
import { analyticsEvents } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const resetStore = useResumeStore((state) => state.resetStore);
  const ui = useResumeStore((state) => state.ui);
  const totalTokens = useTokenStore((state) => state.totalTokens);
  const [mobilePane, setMobilePane] = useState<"preview" | "chat">("chat");

  const handleReset = () => {
    if (window.confirm("Clear the resume and chat?")) {
      analyticsEvents.resetResume();
      resetStore();
    }
  };

  const chatWidth = ui.chatWidthPercent;
  const resumeWidth = 100 - chatWidth;

  return (
    <div
      className="app-shell flex h-dvh max-h-dvh flex-col gap-2 overflow-hidden p-[max(0.5rem,env(safe-area-inset-top))_max(0.5rem,env(safe-area-inset-right))_max(0.5rem,env(safe-area-inset-bottom))_max(0.5rem,env(safe-area-inset-left))] sm:gap-3 lg:gap-4 lg:p-[max(1rem,env(safe-area-inset-top))_max(1rem,env(safe-area-inset-right))_max(1rem,env(safe-area-inset-bottom))_max(1rem,env(safe-area-inset-left))]"
      style={
        {
          "--primary": ui.accent,
          "--ring": ui.accent,
          "--glass-opacity": String(ui.glassOpacity),
          "--app-radius": `${ui.radiusPx}px`,
          "--resume-fr": `${resumeWidth}fr`,
          "--chat-fr": `${chatWidth}fr`,
        } as CSSProperties
      }
    >
      <header className="relative z-40 flex shrink-0 flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-3">
        <div className="flex min-w-0 items-center justify-between gap-2 lg:contents">
          <div className="flex min-w-0 items-center gap-2">
            <div className="hidden px-2 py-2.5 text-sm font-semibold tracking-tight xl:block">
              My Simple Resume
            </div>
            <div className="min-w-0">
              <ResumeSwitcher />
            </div>
            <div
              className="hidden px-2 py-2.5 text-xs tabular-nums text-muted-foreground md:block"
              title="Tokens used on this device only"
            >
              {totalTokens.toLocaleString()} tokens
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end lg:col-start-3">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <VersionControls />
              <PhotoPicker />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Reset"
                onClick={handleReset}
              >
                <RotateCcw />
                <span className="hidden md:inline">Reset</span>
              </Button>
              <DonateLink />
              <ApiSettings />
              <ExportMenu />
            </div>
          </div>
        </div>
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <PreviewTabs
            mobilePane={mobilePane}
            onMobilePaneChange={setMobilePane}
          />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[var(--resume-fr)_var(--chat-fr)] lg:gap-4">
        <section
          className={cn(
            "flex min-h-0 flex-col overflow-hidden",
            mobilePane !== "preview" && "max-lg:hidden",
          )}
          aria-label="Resume preview"
        >
          <PdfPreview />
        </section>
        <section
          className={cn(
            "flex min-h-0 flex-col lg:pl-3",
            mobilePane !== "chat" && "max-lg:hidden",
          )}
          aria-label="Resume chat"
        >
          <ChatPanel />
        </section>
      </main>
      <DonatePrompt />
    </div>
  );
}
