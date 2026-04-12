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

export function ProfessionalSummaryForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  
  const form = useForm<ProfessionalSummary>({
    resolver: zodResolver(professionalSummarySchema),
    defaultValues: { summary: data.summary },
    mode: "onChange",
  });

  const onSubmit = (values: ProfessionalSummary) => {
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
    <Card className="glass-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-800 shadow-sm border-0">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Professional Summary</h2>
          <p className="text-slate-500 text-sm mt-1">Write a short, engaging pitch highlighting your expertise and career goals.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="summary">Summary <span className="text-primary">*</span></Label>
            <Textarea 
              id="summary" 
              placeholder="A highly motivated software engineer with 5+ years of experience in..." 
              className="min-h-[200px] resize-none"
              {...form.register("summary")} 
            />
            {form.formState.errors.summary && <p className="text-sm text-destructive">{form.formState.errors.summary.message}</p>}
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button 
              type="submit" 
              className="px-8 shadow-md hover:shadow-lg transition-all"
            >
              Save & Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
