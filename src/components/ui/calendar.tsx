"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label:
          "text-sm font-[540] tracking-[-0.02em] text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button:
          "inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day: "inline-flex size-9 items-center justify-center rounded-md text-sm font-normal text-foreground hover:bg-white/10 aria-selected:bg-cal-brand aria-selected:text-primary-foreground",
        day_selected:
          "bg-cal-brand text-primary-foreground hover:bg-cal-brand/90",
        day_today:
          "border border-cal-brand/50",
        day_outside:
          "text-muted-foreground opacity-40",
        day_disabled: "text-muted-foreground opacity-30",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") return <CaretLeft className="size-4" />;
          if (orientation === "right") return <CaretRight className="size-4" />;
          return <span className="size-4" />;
        },
      }}
      {...props}
    />
  );
}

