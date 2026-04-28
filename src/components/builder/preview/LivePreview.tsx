"use client";

import { DynamicTemplate } from "../templates/DynamicTemplate";
import { useResumeStore } from "@/store/useResumeStore";

export function LivePreview() {
  const template = useResumeStore((state) => state.template);

  return (
    <div className="sticky top-24 w-full">
      <div className="ring-framer shadow-framer-float custom-scrollbar h-[calc(100dvh-6.5rem)] w-full overscroll-contain overflow-y-auto overflow-x-hidden rounded-xl bg-transparent">
        <div className="flex w-full items-start justify-center p-2">
          <div className="origin-top scale-[0.74] transition-transform duration-300">
            <div className="w-[816px] h-[1056px] bg-white">
              <DynamicTemplate
                templateId={template}
                showPageBreaks={true}
                bareCanvas
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
