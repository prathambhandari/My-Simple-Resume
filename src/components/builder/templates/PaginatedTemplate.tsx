"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { DynamicTemplate } from "./DynamicTemplate";

const PAGE_H = 1056;
const PAGE_GAP = 28;
const PAGE_PAD_TOP = 56;
const PAGE_PAD_BOTTOM = 56;

type Props = Omit<
  ComponentProps<typeof DynamicTemplate>,
  "showPageBreaks" | "paginated"
>;

export function PaginatedTemplate(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const repaginateFrameRef = useRef<number | null>(null);

  const repaginate = () => {
    const root = containerRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-resume-block]"),
    );
    const titles = Array.from(
      root.querySelectorAll<HTMLElement>("[data-resume-section-title]"),
    );

    [...blocks, ...titles].forEach((el) => {
      el.style.marginTop = "";
    });

    const pageStep = PAGE_H + PAGE_GAP;
    let pageIndex = 0;

    blocks.forEach((block) => {
      const top = block.offsetTop;
      const bottom = top + block.offsetHeight;
      const pageBottomY = pageIndex * pageStep + PAGE_H - PAGE_PAD_BOTTOM;

      if (bottom <= pageBottomY) return;

      const nextPageStartY = (pageIndex + 1) * pageStep + PAGE_PAD_TOP;
      const delta = Math.max(0, nextPageStartY - top);
      if (delta > 0) {
        const parent = block.parentElement;
        const isFirstInGroup =
          parent?.hasAttribute("data-resume-entries") &&
          parent.firstElementChild === block;
        const sectionTitle = isFirstInGroup
          ? (parent?.previousElementSibling as HTMLElement | null)
          : null;

        if (
          sectionTitle &&
          sectionTitle.hasAttribute("data-resume-section-title")
        ) {
          sectionTitle.style.marginTop = `${delta}px`;
        } else {
          block.style.marginTop = `${delta}px`;
        }
      }
      pageIndex += 1;
    });

    let pages = pageIndex + 1;

    const last = blocks[blocks.length - 1];
    if (last) {
      const lastBottom = last.offsetTop + last.offsetHeight + PAGE_PAD_BOTTOM;
      while (lastBottom > pages * PAGE_H + (pages - 1) * PAGE_GAP) {
        pages += 1;
      }
    }

    setPageCount(pages);
  };

  const scheduleRepaginate = () => {
    if (repaginateFrameRef.current !== null) return;
    repaginateFrameRef.current = requestAnimationFrame(() => {
      repaginateFrameRef.current = null;
      repaginate();
    });
  };

  useLayoutEffect(() => {
    scheduleRepaginate();
    return () => {
      if (repaginateFrameRef.current !== null) {
        cancelAnimationFrame(repaginateFrameRef.current);
        repaginateFrameRef.current = null;
      }
    };
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scheduleRepaginate, 32);
    });
    ro.observe(node);
    return () => {
      clearTimeout(debounceTimer);
      ro.disconnect();
    };
  }, []);

  const totalHeight =
    pageCount * PAGE_H + Math.max(0, pageCount - 1) * PAGE_GAP;

  return (
    <div
      className="relative w-[816px] shrink-0"
      style={{ height: totalHeight }}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: pageCount }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 rounded-sm border border-border bg-white shadow-none"
            style={{
              top: i * (PAGE_H + PAGE_GAP),
              height: PAGE_H,
            }}
            aria-hidden
          />
        ))}
      </div>
      <div ref={containerRef} className="relative">
        <DynamicTemplate {...props} bareCanvas paginated />
      </div>
    </div>
  );
}
