"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMonYYYY } from "@/lib/dateFormat";

type Props = {
  value: string;
  onChange: (iso: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

const toIso = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const parseIso = (iso: string) => {
  const trimmed = iso.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return new Date(`${trimmed}-01T00:00:00`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return new Date(`${trimmed}T00:00:00`);
  return undefined;
};

export function DatePickerDialog({
  value,
  onChange,
  disabled,
  label = "Pick a date",
  placeholder = "Select date",
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseIso(value), [value]);
  const pretty = formatMonYYYY(value);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="w-full justify-start border-input bg-card px-3 font-normal text-[15px] tracking-[-0.02em] text-foreground hover:bg-card/90"
        onClick={() => setOpen(true)}
      >
        {pretty || <span className="text-white/40">{placeholder}</span>}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected</Label>
              <Input value={value} readOnly />
            </div>
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(d) => {
                if (!d) return;
                onChange(toIso(d));
              }}
            />
          </div>

          <DialogFooter className="border-t-0 bg-transparent">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Done
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

