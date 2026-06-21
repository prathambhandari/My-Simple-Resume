import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResumeData, defaultResumeData, TemplateType } from "@/types/resume";
import { isValidTemplateId } from "@/lib/resumeTemplates";

interface ResumeState {
  data: ResumeData;
  currentStep: number;
  template: TemplateType;
  themeColor: string;
  updateData: (partialData: Partial<ResumeData>) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTemplate: (template: TemplateType) => void;
  setThemeColor: (color: string) => void;
  resetStore: () => void;
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      data: defaultResumeData,
      currentStep: 1,
      template: "standard",
      themeColor: "#111111",

      updateData: (partialData) =>
        set((state) => ({
          data: { ...state.data, ...partialData },
        })),

      setStep: (step) => set({ currentStep: step }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 6),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      setTemplate: (template) => set({ template }),

      setThemeColor: (color) => set({ themeColor: color }),

      resetStore: () =>
        set({
          data: defaultResumeData,
          currentStep: 1,
          template: "standard",
          themeColor: "#111111",
        }),
    }),
    {
      name: "glassforge-resume-storage", // key in local storage
      onRehydrateStorage: () => (state) => {
        if (state && !isValidTemplateId(state.template)) {
          state.template = "standard";
        }
      },
    },
  ),
);
