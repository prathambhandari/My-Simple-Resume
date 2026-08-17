"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PaginatedTemplate } from "@/components/builder/templates/PaginatedTemplate";
import { useResumeStore } from "@/store/useResumeStore";
import { isResumeEmpty } from "@/lib/normalizeResume";

const PAGE_WIDTH = 816;

export function PdfPreview() {
  const template = useResumeStore((state) => state.template);
  const data = useResumeStore((state) => state.data);
  const coverLetter = useResumeStore((state) => state.coverLetter);
  const previewMode = useResumeStore((state) => state.previewMode);
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.55);
  const [pageHeight, setPageHeight] = useState(1056);
  const empty = isResumeEmpty(data);
  const showResume = previewMode === "resume";
  const showCover = previewMode === "cover";

  useEffect(() => {
    const node = frameRef.current;
    if (!node || !showResume || empty) return;

    const updateScale = () => {
      const width = Math.max(0, node.clientWidth - 16);
      setScale(Math.min(1, Math.max(0.18, width / PAGE_WIDTH)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    return () => observer.disconnect();
  }, [empty, showResume]);

  useLayoutEffect(() => {
    const node = pageRef.current;
    if (!node || !showResume) return;
    const updateHeight = () => setPageHeight(node.offsetHeight);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [empty, data, template, showResume]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showCover ? (
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto min-h-[min(500px,100%)] max-w-[720px] rounded-lg bg-white p-5 text-neutral-900 shadow-[0_10px_28px_rgba(0,0,0,0.4)] sm:p-10">
            <p className="mb-6 text-lg font-semibold">
              {data.personalInfo.fullName || "Cover letter"}
            </p>
            <div className="whitespace-pre-wrap text-[15px] leading-7">
              {coverLetter.trim() ||
                "Ask chat to write a cover letter."}
            </div>
          </div>
        </div>
      ) : empty ? (
        <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-8">
          <p className="text-sm text-muted-foreground">No resume yet.</p>
        </div>
      ) : (
        <div
          ref={frameRef}
          className="scroll-area scroll-area-left min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="flex justify-center p-3 sm:p-6">
            <div
              className="relative"
              style={{
                width: PAGE_WIDTH * scale,
                height: pageHeight * scale,
              }}
            >
              <div
                ref={pageRef}
                className="absolute left-0 top-0 origin-top-left"
                style={{
                  width: PAGE_WIDTH,
                  transform: `scale(${scale})`,
                }}
              >
                <PaginatedTemplate templateId={template} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
