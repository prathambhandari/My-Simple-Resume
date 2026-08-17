"use client";

import { useEffect, useRef, useState } from "react";
import { History, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVersionTime } from "@/lib/resumeHistory";
import { useResumeStore } from "@/store/useResumeStore";

export function VersionControls() {
  const past = useResumeStore((state) => state.past);
  const future = useResumeStore((state) => state.future);
  const undo = useResumeStore((state) => state.undo);
  const redo = useResumeStore((state) => state.redo);
  const restoreVersion = useResumeStore((state) => state.restoreVersion);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "INPUT" ||
        target?.isContentEditable;
      if (typing) return;
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        (key === "y" || (key === "z" && event.shiftKey))
      ) {
        event.preventDefault();
        redo();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [undo, redo]);

  const versions = [...past].reverse();

  return (
    <div ref={menuRef} className="relative flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={past.length === 0}
        onClick={() => undo()}
      >
        <Undo2 />
        <span className="hidden md:inline">Undo</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        disabled={future.length === 0}
        onClick={() => redo()}
      >
        <Redo2 />
        <span className="hidden md:inline">Redo</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
        disabled={versions.length === 0}
        onClick={() => setOpen((value) => !value)}
      >
        <History />
        <span className="hidden md:inline">History</span>
      </Button>
      {open && versions.length > 0 ? (
        <div className="menu-panel absolute right-0 top-[calc(100%+6px)] z-50 w-64 max-w-[min(16rem,calc(100vw-1.25rem))] overflow-hidden py-1">
          <p className="px-2 py-1.5 text-[11px] text-muted-foreground">
            Resume versions on this device
          </p>
          <div className="scroll-area max-h-64 overflow-y-auto">
            {versions.map((version) => (
              <button
                key={version.id}
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/10"
                onClick={() => {
                  restoreVersion(version.id);
                  setOpen(false);
                }}
              >
                <span className="truncate">{version.label}</span>
                <span className="shrink-0 text-muted-foreground">
                  {formatVersionTime(version.at)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
