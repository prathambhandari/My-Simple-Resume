"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DONATE_EVENT,
  DONATE_INTERVAL_MS,
  DONATE_URL,
} from "@/lib/donate";

export function DonateLink() {
  return (
    <a
      href={DONATE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      aria-label="Donate"
    >
      <Heart />
      <span className="hidden md:inline">Donate</span>
    </a>
  );
}

export function DonatePrompt() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const schedule = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => setOpen(true), DONATE_INTERVAL_MS);
  };

  const dismiss = () => {
    setOpen(false);
    schedule();
  };

  useEffect(() => {
    schedule();
    const onAsk = () => {
      clearTimer();
      setOpen(true);
    };
    window.addEventListener(DONATE_EVENT, onAsk);
    return () => {
      clearTimer();
      window.removeEventListener(DONATE_EVENT, onAsk);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss is stable enough
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="screen-dim" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-title"
        className="menu-panel w-full max-w-sm rounded-2xl p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p id="donate-title" className="text-sm font-semibold">
            Support VistaWatch
          </p>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            aria-label="Close"
            onClick={dismiss}
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This resume builder is free. A small donation supports this app and
          the VistaWatch platform.
        </p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={dismiss}>
            Not now
          </Button>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
            onClick={dismiss}
          >
            <Heart />
            Donate
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}
