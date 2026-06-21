"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { workExperienceSchema, WorkExperience } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase,
  Check,
  PencilSimple as Pencil,
  Plus,
  TrashSimple as Trash2,
} from "@phosphor-icons/react";
import { DatePickerDialog } from "@/components/builder/forms/DatePickerDialog";
import { analyticsEvents } from "@/lib/analytics";
import { clickableCardProps, stopCardActionBubble } from "@/lib/clickableCard";

const formSchema = z.object({
  experience: z.array(workExperienceSchema),
});

type FormValues = z.infer<typeof formSchema>;

const formatDateRange = (entry?: Partial<WorkExperience>) => {
  if (!entry) return "";
  const start = entry.startDate?.trim() ?? "";
  const end = entry.current ? "Present" : (entry.endDate?.trim() ?? "");
  if (!start && !end) return "";
  if (!end) return start;
  if (!start) return end;
  return `${start} – ${end}`;
};

export function WorkExperienceForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const form = useForm<FormValues>({
    defaultValues: { experience: data.experience },
  });

  const { fields, append, remove } = useFieldArray({
    name: "experience",
    control: form.control,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.experience) {
        updateData({ experience: value.experience as WorkExperience[] });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  const collapseEditor = () => {
    setEditingIndex(null);
  };

  const onSubmit = (values: FormValues) => {
    analyticsEvents.stepCompleted(3, "work_experience");
    collapseEditor();
    updateData({ experience: values.experience });
    nextStep();
  };

  const addExperience = () => {
    analyticsEvents.itemAdded("experience", 3);
    collapseEditor();
    append({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setEditingIndex(fields.length);
  };

  const startEdit = (index: number) => {
    if (editingIndex === index) return;
    setEditingIndex(index);
  };

  const handleRemove = (index: number) => {
    analyticsEvents.itemRemoved("experience", 3);
    remove(index);
    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent py-0 shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 3</span>
          <h2 className="font-heading mt-2 text-xl font-medium tracking-[-0.06em] text-foreground">
            Work experience
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {fields.map((field, index) => {
            if (editingIndex !== index) {
              const entry = form.getValues(`experience.${index}`);
              const subtitle = [entry?.company, entry?.location]
                .filter((value) => value && value.trim())
                .join(" · ");
              const dateRange = formatDateRange(entry);

              return (
                <div
                  key={field.id}
                  {...clickableCardProps(() => startEdit(index))}
                  className="group relative rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-ring/40 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-foreground">
                      <Briefcase className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading truncate text-base font-medium tracking-[-0.03em] text-foreground">
                        {entry?.jobTitle?.trim() || "Untitled role"}
                      </h3>
                      <p className="mt-0.5 truncate text-sm font-[330] tracking-[-0.05px] text-muted-foreground">
                        {subtitle || "Add company & location"}
                      </p>
                      {dateRange && (
                        <p className="mt-0.5 text-xs font-[330] tracking-[-0.05px] text-muted-foreground">
                          {dateRange}
                        </p>
                      )}
                      {entry?.description?.trim() && (
                        <p className="mt-2 line-clamp-2 text-sm font-[330] leading-relaxed tracking-[-0.05px] text-muted-foreground/90">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="flex shrink-0 items-center gap-1"
                      onClick={stopCardActionBubble}
                      onKeyDown={stopCardActionBubble}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(index)}
                        aria-label="Edit experience"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(index)}
                        aria-label="Delete experience"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            const isCurrent = form.watch(`experience.${index}.current`);

            return (
              <div
                key={field.id}
                className="relative rounded-lg border border-ring/40 bg-white/[0.04] p-4 ring-1 ring-cal-brand-glow"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 size-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(index)}
                  aria-label="Delete experience"
                >
                  <Trash2 className="size-4" />
                </Button>

                <div className="mt-2 grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      placeholder="Software Engineer"
                      {...form.register(`experience.${index}.jobTitle`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      placeholder="Acme Corp"
                      {...form.register(`experience.${index}.company`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      placeholder="San Francisco, CA"
                      {...form.register(`experience.${index}.location`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePickerDialog
                      value={form.watch(`experience.${index}.startDate`) ?? ""}
                      onChange={(iso) =>
                        form.setValue(`experience.${index}.startDate`, iso, {
                          shouldDirty: true,
                        })
                      }
                      label="Start date"
                      placeholder="Pick a date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePickerDialog
                      value={form.watch(`experience.${index}.endDate`) ?? ""}
                      onChange={(iso) =>
                        form.setValue(`experience.${index}.endDate`, iso, {
                          shouldDirty: true,
                        })
                      }
                      disabled={isCurrent}
                      label="End date"
                      placeholder={isCurrent ? "Present" : "Pick a date"}
                    />
                  </div>

                  <div className="my-2 flex items-center space-x-2">
                    <Switch
                      checked={isCurrent}
                      onCheckedChange={(val) => {
                        form.setValue(`experience.${index}.current`, val, {
                          shouldDirty: true,
                        });
                        if (val)
                          form.setValue(`experience.${index}.endDate`, "");
                      }}
                    />
                    <Label className="cursor-pointer">
                      I currently work here
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your achievements and responsibilities..."
                      className="min-h-[120px]"
                      {...form.register(`experience.${index}.description`)}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={collapseEditor}
                  >
                    <Check className="size-4" /> Done editing
                  </Button>
                </div>
              </div>
            );
          })}

          {fields.length === 0 && (
            <div className="border-none bg-transparent px-0 py-4 text-center">
              <p className="mb-4 text-sm font-[330] tracking-[-0.1px] text-muted-foreground">
                No experience entries added yet.
              </p>
              <Button type="button" variant="outline" onClick={addExperience}>
                <Plus className="mr-2 h-4 w-4" /> Add Experience
              </Button>
            </div>
          )}

          {fields.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={addExperience}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Experience
            </Button>
          )}

          <div className="form-footer-flat pt-6">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  analyticsEvents.stepBack(3, 2);
                  prevStep();
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="min-w-[160px] px-8 transition-opacity hover:opacity-95"
              >
                Save & Next Step
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
