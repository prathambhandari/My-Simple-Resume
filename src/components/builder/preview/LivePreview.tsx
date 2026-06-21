"use client";

import { PaginatedTemplate } from "../templates/PaginatedTemplate";
import { useResumeStore } from "@/store/useResumeStore";

export function LivePreview() {
  const template = useResumeStore((state) => state.template);

  return (
    <div className="sticky top-0 flex h-full min-h-0 w-full flex-col">
      <div className="custom-scrollbar min-h-0 flex-1 overscroll-contain overflow-y-auto overflow-x-hidden bg-background">
        <div className="flex w-full items-start justify-center p-4">
          <div className="origin-top scale-[0.74] transition-transform duration-300">
            <PaginatedTemplate templateId={template} />
          </div>
        </div>
      </div>
    </div>
  );
}
