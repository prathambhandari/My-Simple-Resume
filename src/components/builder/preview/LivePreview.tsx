"use client";

import { DynamicTemplate } from "../templates/DynamicTemplate";
import { useResumeStore } from "@/store/useResumeStore";

export function LivePreview() {
  const template = useResumeStore((state) => state.template);

  return (
    <div className="sticky top-24 w-full">
      <div className="ring-framer shadow-framer-float aspect-square w-full overflow-hidden rounded-xl bg-transparent">
        <div className="flex h-full w-full items-start justify-center">
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
