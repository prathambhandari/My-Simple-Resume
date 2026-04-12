"use client";

import { DynamicTemplate } from "../templates/DynamicTemplate";
import { useResumeStore } from "@/store/useResumeStore";

export function LivePreview() {
  const template = useResumeStore((state) => state.template);
  const themeColor = useResumeStore((state) => state.themeColor);

  return (
    <div 
      className="sticky top-24 w-full h-[calc(100vh-8rem)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-3xl p-4 md:p-8 flex items-start justify-center overflow-y-auto custom-scrollbar shadow-inner"
    >
      <div className="w-full h-auto bg-white shadow-xl max-w-[816px] origin-top md:transform min-h-[1056px]">
        <DynamicTemplate templateId={template} />
      </div>
    </div>
  );
}
