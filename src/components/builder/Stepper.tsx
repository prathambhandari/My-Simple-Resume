"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { personalInfoSchema, professionalSummarySchema } from "@/types/resume";
import { toast } from "sonner";

const STEPS = [
  "Personal Info",
  "Summary",
  "Experience",
  "Education",
  "Skills & Extras",
  "Review & Finalize"
];

export function Stepper() {
  const currentStep = useResumeStore((state) => state.currentStep);
  const setStep = useResumeStore((state) => state.setStep);
  const data = useResumeStore((state) => state.data);

  const handleStepClick = (targetStep: number) => {
    if (targetStep === currentStep) return;

    // Validate sequentially up to the target step
    if (targetStep > 1) {
      const personalValid = personalInfoSchema.safeParse(data.personalInfo);
      if (!personalValid.success) {
        toast.error("Complete your Personal Info first!");
        return;
      }
    }
    
    if (targetStep > 2) {
      const summaryValid = professionalSummarySchema.shape.summary.safeParse(data.summary);
      if (!summaryValid.success && data.summary.trim() !== "") {
        // We only block if they typed invalid summary, or we should require it? 
        // Summary is heavily recommended but technically resumes can drop it. The schema says min(10).
        if (!summaryValid.success) {
           toast.error("Please enter a valid Summary (min 10 chars) or clear it entirely to skip.");
           // But wait, if they clear it entirely, our schema z.string().min(10) will still fail!
           // Let's manually bypass if empty:
           if (data.summary.trim() !== "") return;
        }
      } else if (!summaryValid.success && data.summary.trim() === "") {
         toast.error("Please provide a Professional Summary.");
         return;
      }
    }

    // Step 3, 4, 5 are arrays and can technically be empty, so no strict length boundary is required ahead of time here.
    
    setStep(targetStep);
  };

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full z-0 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
        
        {/* Steps */}
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <button 
                onClick={() => handleStepClick(stepNumber)}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 shadow-sm cursor-pointer hover:scale-110",
                  isCompleted 
                    ? "bg-primary border-primary text-white" 
                    : isCurrent
                      ? "bg-white dark:bg-slate-900 border-primary text-primary shadow-primary/30 scale-110"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/50"
                )}
                title={step}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : stepNumber}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
