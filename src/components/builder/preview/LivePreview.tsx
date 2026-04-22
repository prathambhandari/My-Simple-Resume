"use client";

import { DynamicTemplate } from "../templates/DynamicTemplate";
import { useResumeStore } from "@/store/useResumeStore";

/** US Letter–style preview width (matches template layout; no fluid stretch). */
const PREVIEW_PAGE_W = 816;

export function LivePreview() {
  const template = useResumeStore((state) => state.template);

  return (
    <div className="custom-scrollbar sticky top-24 max-h-[calc(100vh-8rem)] w-full overflow-x-auto overflow-y-auto overscroll-y-contain">
      <div
        className="ring-framer shadow-framer-float shrink-0 overflow-hidden rounded-xl bg-white"
        style={{ width: PREVIEW_PAGE_W }}
      >
        <DynamicTemplate templateId={template} showPageBreaks={true} bareCanvas />
      </div>
    </div>
  );
}
