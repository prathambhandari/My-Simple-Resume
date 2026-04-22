"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { PersonalInfoForm } from "@/components/builder/forms/PersonalInfoForm";
import { ProfessionalSummaryForm } from "@/components/builder/forms/SummaryForm";
import { WorkExperienceForm } from "@/components/builder/forms/WorkExperienceForm";
import { EducationForm } from "@/components/builder/forms/EducationForm";
import { SkillsAndExtrasForm } from "@/components/builder/forms/SkillsAndExtrasForm";
import { ReviewAndFinalize } from "@/components/builder/forms/ReviewAndFinalize";
import { LivePreview } from "@/components/builder/preview/LivePreview";
import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { DynamicTemplate } from "@/components/builder/templates/DynamicTemplate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TOTAL_FLOW_STEPS = 6;

export default function BuilderPage() {
  const currentStep = useResumeStore((state) => state.currentStep);
  const template = useResumeStore((state) => state.template);
  const [mounted, setMounted] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <ProfessionalSummaryForm />;
      case 3:
        return <WorkExperienceForm />;
      case 4:
        return <EducationForm />;
      case 5:
        return <SkillsAndExtrasForm />;
      case 6:
        return <ReviewAndFinalize />;
      default:
        return <PersonalInfoForm />;
    }
  };

  const flowProgressPercent = Math.min(
    100,
    Math.max(0, (currentStep / TOTAL_FLOW_STEPS) * 100)
  );

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/55">
        <div className="mx-auto flex w-full max-w-[min(1320px,calc(100vw-2rem))] flex-nowrap items-center gap-4 px-4 py-3 sm:px-6 md:h-16 md:py-0">
          <span className="font-heading min-w-0 flex-1 truncate text-xl font-medium tracking-[-0.06em] text-white sm:text-2xl">
            My Simple Resume
          </span>
        </div>
      </header>

      {/* Flow progress: gradient fills left → right like a loader */}
      <div
        className="relative h-1 w-full shrink-0 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={TOTAL_FLOW_STEPS}
        aria-label={`Resume builder progress, step ${currentStep} of ${TOTAL_FLOW_STEPS}`}
      >
        <div className="absolute inset-0 bg-white/[0.08]" aria-hidden />
        <div
          className="absolute inset-y-0 left-0 flow-progress-gradient transition-[width] duration-700 ease-out"
          style={{ width: `${flowProgressPercent}%` }}
          aria-hidden
        />
      </div>

      <main className="scrollbar-none flex min-h-0 flex-1 overflow-x-clip border-b border-black px-4 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 lg:overflow-x-auto lg:pb-6">
        <div
          className={cn(
            "mx-auto grid w-full max-w-[min(1320px,calc(100vw-2rem))] gap-x-10 gap-y-8 lg:items-start lg:justify-center",
            currentStep === 6 ? "lg:grid-cols-2" : "lg:grid-cols-[440px_minmax(816px,1fr)]"
          )}
        >
          <div
            className={cn(
              "custom-scrollbar min-w-0 self-start transition-all duration-300 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-12",
              currentStep === 6
                ? "w-full"
                : "mx-auto w-full max-w-[440px] justify-self-start lg:mx-0 lg:w-full lg:max-w-none"
            )}
          >
            {renderFormStep()}
          </div>

          <div className="hidden min-h-0 min-w-0 justify-self-start lg:block">
            <LivePreview />
          </div>
        </div>
      </main>

      {/* Floating View Preview Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <Button type="button" size="lg" onClick={() => setMobilePreviewOpen(true)} className="gap-2 shadow-none">
          <Eye className="size-5" />
          <span>Preview</span>
        </Button>
      </div>

      {/* Mobile Full-Screen Preview Overlay */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-3 pb-6 pt-24 backdrop-blur-md lg:hidden">
          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-card text-card-foreground shadow-framer-float animate-in slide-in-from-bottom-12 fade-in duration-300 ring-1 ring-[rgba(0,153,255,0.15)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] p-4">
              <h3 className="font-heading ml-2 text-lg font-medium tracking-[-0.04em]">Live Preview</h3>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="custom-scrollbar relative flex-1 overflow-y-auto overflow-x-hidden bg-black">
              {/* Absolute dead centering guarantees perfect alignment regardless of scaling overflows */}
              <div className="absolute left-[50%] top-4 -translate-x-1/2 origin-top scale-[0.42] sm:scale-[0.5] md:scale-[0.6] transition-transform duration-300">
                <div className="w-[816px] h-[1056px] shadow-2xl bg-white">
                  <DynamicTemplate templateId={template} showPageBreaks={true} bareCanvas />
                </div>
              </div>
              
              {/* Dummy bounding blocks to preserve native scrolling bounds */}
              <div className="w-full h-[480px] sm:hidden" />
              <div className="hidden sm:block md:hidden w-full h-[560px]" />
              <div className="hidden md:block w-full h-[680px]" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
