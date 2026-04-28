"use client";

import { PaginatedTemplate } from "../templates/PaginatedTemplate";
import { useResumeStore } from "@/store/useResumeStore";

export function LivePreview() {
  const template = useResumeStore((state) => state.template);

  return (
    <div className="sticky top-24 w-full">
      <div className="ring-framer shadow-framer-float custom-scrollbar h-[calc(100dvh-6.5rem)] w-full overscroll-contain overflow-y-auto overflow-x-hidden rounded-xl bg-black/40">
        <div className="flex w-full items-start justify-center p-4">
          <div className="origin-top scale-[0.74] transition-transform duration-300">
            <PaginatedTemplate templateId={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
