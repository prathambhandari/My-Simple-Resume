"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useResumeStore } from "@/store/useResumeStore";
import { DynamicTemplate } from "@/components/builder/templates/DynamicTemplate";
import { RESUME_TEMPLATE_OPTIONS } from "@/lib/resumeTemplates";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TemplateType } from "@/types/resume";

function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => useResumeStore.persist.onFinishHydration(cb),
    () => useResumeStore.persist.hasHydrated(),
    () => false,
  );
}

export default function TemplatesPage() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const router = useRouter();
  const hydrated = useHasHydrated();

  const handleSelectTemplate = (id: TemplateType) => {
    setTemplate(id);
  };

  const handleContinueToEditor = () => {
    router.push("/");
  };

  const selectedTemplateName =
    RESUME_TEMPLATE_OPTIONS.find((t) => t.id === template)?.name ?? "Template";

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/55">
        <div className="mx-auto flex w-full max-w-[min(1320px,calc(100vw-2rem))] flex-nowrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 md:h-16 md:py-0">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[15px] tracking-[-0.02em] text-white",
            )}
            aria-label="Back to builder"
          >
            <ArrowLeft className="size-4 sm:mr-1" aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="font-heading min-w-0 flex-1 truncate text-xl font-medium tracking-[-0.06em] text-white sm:text-2xl">
            My Simple Resume
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[min(1320px,calc(100vw-2rem))] flex-1 px-4 pt-10 pb-32 sm:px-6">
        <div className="mb-10">
          <span className="text-mono-label text-muted-foreground">
            Templates
          </span>
          <h1 className="font-heading mt-3 text-4xl font-medium leading-[1.05] tracking-[-0.06em] text-foreground sm:text-5xl">
            Pick a resume design
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            Single-column, ATS-friendly layouts. Hover to preview, click to use.
            Your content stays the same — only the styling changes.
          </p>
        </div>

        {hydrated && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {RESUME_TEMPLATE_OPTIONS.map((tpl) => {
              const isActive = template === tpl.id;
              return (
                <div key={tpl.id} className="group flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    aria-label={`Select ${tpl.name} template`}
                    className={cn(
                      "relative w-full cursor-pointer overflow-hidden rounded-md bg-white p-0 text-left transition-transform duration-300 hover:-translate-y-1",
                      "outline-none focus-visible:ring-2 focus-visible:ring-framer-blue focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <div
                      className="relative aspect-816/1056 w-full overflow-hidden bg-white"
                      style={{ containerType: "inline-size" }}
                    >
                      <div
                        className="absolute left-0 top-0 origin-top-left"
                        style={{
                          width: "816px",
                          height: "1056px",
                          transform: "scale(calc(100cqi / 816px))",
                        }}
                      >
                        <DynamicTemplate templateId={tpl.id} />
                      </div>

                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                          isActive && "opacity-100",
                        )}
                      >
                        <span className="rounded-full bg-framer-blue px-4 py-2 text-[13px] font-medium tracking-[-0.02em] text-white shadow-lg">
                          {isActive ? "Selected" : "Select template"}
                        </span>
                      </div>

                      {isActive && (
                        <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-framer-blue text-white shadow-md">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-baseline justify-between gap-3 px-1">
                    <h2 className="font-heading text-lg font-medium tracking-[-0.04em] text-foreground">
                      {tpl.name}
                    </h2>
                    {isActive && (
                      <span className="text-mono-label text-framer-blue">
                        In use
                      </span>
                    )}
                  </div>
                  <p className="px-1 text-[13px] leading-relaxed text-muted-foreground">
                    {tpl.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {hydrated && (
        <div
          className="sticky bottom-0 z-40 w-full border-t border-white/[0.08] bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60"
          role="region"
          aria-label="Selected template actions"
        >
          <div className="mx-auto flex w-full max-w-[min(1320px,calc(100vw-2rem))] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-framer-blue text-white shadow-md">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p className="text-mono-label text-muted-foreground">
                  Selected
                </p>
                <p className="font-heading truncate text-base font-medium tracking-[-0.04em] text-foreground">
                  {selectedTemplateName}
                </p>
              </div>
            </div>
            <Button onClick={handleContinueToEditor} className="shrink-0">
              Continue to editor
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
