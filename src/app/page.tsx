"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { Stepper } from "@/components/builder/Stepper";
import { PersonalInfoForm } from "@/components/builder/forms/PersonalInfoForm";
import { ProfessionalSummaryForm } from "@/components/builder/forms/SummaryForm";
import { WorkExperienceForm } from "@/components/builder/forms/WorkExperienceForm";
import { EducationForm } from "@/components/builder/forms/EducationForm";
import { SkillsAndExtrasForm } from "@/components/builder/forms/SkillsAndExtrasForm";
import { ReviewAndFinalize } from "@/components/builder/forms/ReviewAndFinalize";
import { LivePreview } from "@/components/builder/preview/LivePreview";
import { useEffect, useState } from "react";
import { FileText, Eye, X, RotateCcw } from "lucide-react";
import { DynamicTemplate } from "@/components/builder/templates/DynamicTemplate";

export default function BuilderPage() {
  const currentStep = useResumeStore((state) => state.currentStep);
  const themeColor = useResumeStore((state) => state.themeColor);
  const setThemeColor = useResumeStore((state) => state.setThemeColor);
  const template = useResumeStore((state) => state.template);
  const resetStore = useResumeStore((state) => state.resetStore);
  const [mounted, setMounted] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

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

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300"
      style={{ '--primary': themeColor } as React.CSSProperties}
    >
      {/* Navbar specific to Builder */}
      <header className="sticky top-0 z-50 w-full glass-nav bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 py-3 md:py-0 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3">
          <div className="flex items-center text-primary font-bold md:w-1/4 order-1 md:order-1">
            <span>My Simple Resume</span>
          </div>
          
          <div className="w-full md:w-auto md:flex-1 flex justify-center order-3 md:order-2 mt-2 md:mt-0">
            <Stepper />
          </div>
          
          <div className="md:w-1/4 flex justify-end items-center gap-2 sm:gap-3 order-2 md:order-3">
            <button 
              onClick={() => setResetConfirmOpen(true)}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Reset Resume Data"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 sm:mx-0" />
            <span className="text-xs font-medium text-slate-500 hidden sm:block">Theme</span>
            <div className="relative w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm hover:scale-110 transition-transform">
              <input 
                type="color" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="absolute inset-0 w-16 h-16 -top-2 -left-2 cursor-pointer"
                title="Change Theme Color"
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="w-full">
          
          <div className="flex flex-col lg:flex-row items-start gap-8 mt-4 relative">
            {/* Left Column: Form Controls */}
            <div className="w-full lg:w-[40%] transition-all duration-300 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:custom-scrollbar lg:pb-12 lg:pr-2">
              {renderFormStep()}
            </div>

            {/* Right Column: Live Preview (Always visible on desktop) */}
            <div className="w-full lg:w-[60%] hidden lg:block">
              <LivePreview />
            </div>
          </div>

          {/* Remove the inline mobile Live Preview block that caused extreme length */}
        </div>
      </main>

      {/* Floating View Preview Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden z-40">
        <button 
          onClick={() => setMobilePreviewOpen(true)}
          className="bg-slate-900 text-white dark:bg-primary shadow-2xl rounded-full h-14 px-6 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Eye className="w-5 h-5" /> 
          <span className="font-semibold">Preview</span>
        </button>
      </div>

      {/* Mobile Full-Screen Preview Overlay */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center px-3 pb-6 pt-24 lg:hidden">
          <div className="bg-white dark:bg-slate-900 w-full h-full rounded-[2rem] rounded-b-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-12 fade-in duration-300">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 ml-2">Live Preview</h3>
              <button 
                onClick={() => setMobilePreviewOpen(false)}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden bg-slate-800">
              {/* Absolute dead centering guarantees perfect alignment regardless of scaling overflows */}
              <div className="absolute left-[50%] top-4 -translate-x-1/2 origin-top scale-[0.42] sm:scale-[0.5] md:scale-[0.6] transition-transform duration-300">
                <div className="w-[816px] h-[1056px] shadow-2xl bg-white">
                  <DynamicTemplate templateId={template} />
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

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-8 text-center ring-1 ring-red-500/20">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 border-4 border-white dark:border-slate-800 shadow-sm">
               <RotateCcw className="w-10 h-10" />
            </div>
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-slate-100 mb-3">Clear Everything?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">This will permanently delete all your inputted data, skills, and experience returning you to a completely blank slate. <strong className="text-red-500 font-medium">This cannot be undone.</strong></p>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
               <button 
                 onClick={() => setResetConfirmOpen(false)}
                 className="flex-1 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={() => {
                   resetStore();
                   setResetConfirmOpen(false);
                 }}
                 className="flex-1 px-4 py-3.5 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
               >
                 Yes, Reset
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
