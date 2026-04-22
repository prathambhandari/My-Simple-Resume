"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfo } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PersonalInfoForm() {
  const { data, updateData, nextStep } = useResumeStore();
  
  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data.personalInfo,
    mode: "onChange",
  });

  const onSubmit = (values: PersonalInfo) => {
    updateData({ personalInfo: values });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateData({ personalInfo: value as PersonalInfo });
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);
  
  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 1</span>
          <h2 className="font-heading mt-2 text-2xl font-medium tracking-[-0.06em] text-foreground">
            Personal information
          </h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name <span className="text-destructive font-[540]">*</span></Label>
              <Input id="fullName" placeholder="Raj" {...form.register("fullName")} />
              {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" placeholder="Frontend Developer" {...form.register("jobTitle")} />
              {form.formState.errors.jobTitle && <p className="text-sm text-destructive">{form.formState.errors.jobTitle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="raj@example.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+91 9876543210" {...form.register("phone")} />
              {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="City, State, Country" {...form.register("location")} />
              {form.formState.errors.location && <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" placeholder="https://linkedin.com/in/raj" {...form.register("linkedin")} />
              {form.formState.errors.linkedin && <p className="text-sm text-destructive">{form.formState.errors.linkedin.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input id="github" placeholder="https://github.com/raj" {...form.register("github")} />
              {form.formState.errors.github && <p className="text-sm text-destructive">{form.formState.errors.github.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Personal Website</Label>
              <Input id="website" placeholder="https://yourwebsite.com" {...form.register("website")} />
              {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
            </div>
          </div>

          <div className="form-action-bleed pt-4">
            <div className="flex justify-end">
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
