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
const PAGE_GAP = 16;
const PAGE_PAD_TOP = 56;
const PAGE_PAD_BOTTOM = 56;

type Props = Omit<
  ComponentProps<typeof DynamicTemplate>,
  "showPageBreaks" | "paginated"
>;

function sectionTitleFor(block: HTMLElement) {
  const parent = block.parentElement;
  const isFirstInGroup =
    parent?.hasAttribute("data-resume-entries") &&
    parent.firstElementChild === block;
  if (!isFirstInGroup) return null;
  const previous = parent?.previousElementSibling as HTMLElement | null;
  if (previous?.hasAttribute("data-resume-section-title")) return previous;
  return null;
}

function inPageGap(y: number, pageIndex: number) {
  const pageStart = pageIndex * (PAGE_H + PAGE_GAP);
  const pageEnd = pageStart + PAGE_H;
  const nextPageStart = pageStart + PAGE_H + PAGE_GAP;
  return y >= pageEnd - 8 && y < nextPageStart + PAGE_PAD_TOP;
}

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
    const sections = titles
      .map((title) => title.parentElement)
      .filter((el): el is HTMLElement => Boolean(el));

    [...blocks, ...titles, ...sections].forEach((el) => {
      el.style.marginTop = "";
      el.style.paddingTop = "";
    });

    const pageStep = PAGE_H + PAGE_GAP;
    let pageIndex = 0;

    const pushToPage = (
      page: number,
      title: HTMLElement | null,
      block: HTMLElement,
    ) => {
      const nextStart = page * pageStep + PAGE_PAD_TOP;
      const anchor = title ?? block;
      const delta = nextStart - anchor.offsetTop;
      if (delta <= 0) return;

      const section =
        title?.parentElement ??
        (block.tagName === "SECTION" ? block : null);

      if (section) {
        const current = Number.parseFloat(section.style.paddingTop) || 0;
        section.style.paddingTop = `${current + delta}px`;
        return;
      }

      const current =
        Number.parseFloat(getComputedStyle(block).marginTop) || 0;
      block.style.marginTop = `${current + delta}px`;
    };

    blocks.forEach((block) => {
      const title = sectionTitleFor(block);
      const anchorTop = title ? title.offsetTop : block.offsetTop;
      const bottom = block.offsetTop + block.offsetHeight;
      const pageBottomY = pageIndex * pageStep + PAGE_H - PAGE_PAD_BOTTOM;

      const fitsOnPage =
        bottom <= pageBottomY && !inPageGap(anchorTop, pageIndex);

      if (fitsOnPage) return;

      pageIndex += 1;
      pushToPage(pageIndex, title, block);
    });

    let pages = Math.max(1, pageIndex + 1);
    const last = blocks[blocks.length - 1];
    if (last) {
      const lastBottom = last.offsetTop + last.offsetHeight + PAGE_PAD_BOTTOM;
      while (lastBottom > pages * pageStep - PAGE_GAP) {
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
            className="absolute left-0 right-0 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
            style={{
              top: i * (PAGE_H + PAGE_GAP),
              height: PAGE_H,
              borderRadius: 8,
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
