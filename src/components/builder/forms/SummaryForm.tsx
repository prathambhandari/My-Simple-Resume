"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalSummarySchema, ProfessionalSummary } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { analyticsEvents } from "@/lib/analytics";

export function ProfessionalSummaryForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();

  const form = useForm<ProfessionalSummary>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: { summary: data.summary },
    mode: "onChange",
  });

  const onSubmit = (values: ProfessionalSummary) => {
    analyticsEvents.stepCompleted(2, "professional_summary");
    updateData({ summary: values.summary });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateData({ summary: value.summary || "" });
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent py-0 shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 2</span>
          <h2 className="font-heading mt-2 text-xl font-medium tracking-[-0.06em] text-foreground">
            Professional summary
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-3">
            <div>
              <p className="text-sm font-[540] tracking-[-0.02em] text-foreground">
                Show summary title
              </p>
              <p className="text-xs text-muted-foreground">
                Adds a “Professional Summary” heading in the resume.
              </p>
            </div>
            <Switch
              checked={!!data.summaryShowTitle}
              onCheckedChange={(val) =>
                updateData({ summaryShowTitle: val })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">
              Summary <span className="text-destructive font-[540]">*</span>
            </Label>
            <Textarea
              id="summary"
              placeholder="A highly motivated software engineer with 5+ years of experience in..."
              className="min-h-[200px] resize-none"
              {...form.register("summary")}
            />
            {form.formState.errors.summary && (
              <p className="text-sm text-destructive">
                {form.formState.errors.summary.message}
              </p>
            )}
          </div>

          <div className="form-footer-flat pt-4">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  analyticsEvents.stepBack(2, 1);
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
