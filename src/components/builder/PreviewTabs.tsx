"use client";

import { PreviewMode } from "@/types/document";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";

const MODES: Array<{ id: PreviewMode; label: string; short: string }> = [
  { id: "resume", label: "Resume", short: "Resume" },
  { id: "cover", label: "Cover letter", short: "Cover" },
];

type MobilePane = "preview" | "chat";

export function PreviewTabs({
  mobilePane,
  onMobilePaneChange,
}: {
  mobilePane: MobilePane;
  onMobilePaneChange: (pane: MobilePane) => void;
}) {
  const previewMode = useResumeStore((state) => state.previewMode);
  const setPreviewMode = useResumeStore((state) => state.setPreviewMode);

  return (
    <div className="flex w-full items-center gap-1 lg:w-auto">
      {MODES.map((mode) => {
        const desktopOn = previewMode === mode.id;
        const mobileOn = mobilePane === "preview" && previewMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            className={cn(
              "min-w-0 flex-1 rounded-lg px-2 py-1.5 text-xs sm:px-3 lg:flex-none",
              "text-muted-foreground hover:bg-white/8",
              mobileOn && "max-lg:bg-white/14 max-lg:text-foreground",
              desktopOn && "lg:bg-white/14 lg:text-foreground",
            )}
            onClick={() => {
              setPreviewMode(mode.id);
              onMobilePaneChange("preview");
            }}
          >
            <span className="sm:hidden">{mode.short}</span>
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
      <button
        type="button"
        className={cn(
          "min-w-0 flex-1 rounded-lg px-2 py-1.5 text-xs sm:px-3 lg:hidden",
          mobilePane === "chat"
            ? "bg-white/14 text-foreground"
            : "text-muted-foreground hover:bg-white/8",
        )}
        onClick={() => onMobilePaneChange("chat")}
      >
        Chat
      </button>
    </div>
  );
}
