"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { educationSchema, Education } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

const formSchema = z.object({
  education: z.array(educationSchema)
});

type FormValues = z.infer<typeof formSchema>;

export function EducationForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { education: data.education },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "education",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    updateData({ education: values.education });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.education) {
        updateData({ education: value.education as Education[] });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  const addEducation = () => {
    append({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      degree: "",
      school: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
    });
  };
  
  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 4</span>
          <h2 className="font-heading mt-2 text-2xl font-medium tracking-[-0.06em] text-foreground">Education</h2>
          <p className="text-muted-foreground text-sm mt-1 font-[330] tracking-[-0.1px] leading-relaxed">
            Add your educational background, degrees, and certifications.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`education.${index}.current`);
            
            return (
              <div key={field.id} className="relative group rounded-lg border border-white/[0.08] bg-white/[0.04] p-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="mt-2 grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Degree/Course <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="B.S. Computer Science" {...form.register(`education.${index}.degree`)} />
                    {form.formState.errors.education?.[index]?.degree && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.degree?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>School/University <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="University of Technology" {...form.register(`education.${index}.school`)} />
                    {form.formState.errors.education?.[index]?.school && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.school?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Location <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="Boston, MA" {...form.register(`education.${index}.location`)} />
                    {form.formState.errors.education?.[index]?.location && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.location?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="YYYY or MM/YYYY" {...form.register(`education.${index}.startDate`)} />
                    {form.formState.errors.education?.[index]?.startDate && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.startDate?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input placeholder="YYYY or MM/YYYY" disabled={isCurrent} {...form.register(`education.${index}.endDate`)} />
                  </div>

                  <div className="my-2 flex items-center space-x-2">
                    <Switch 
                      checked={isCurrent}
                      onCheckedChange={(val) => {
                        form.setValue(`education.${index}.current`, val, { shouldValidate: true, shouldDirty: true });
                        if (val) form.setValue(`education.${index}.endDate`, "");
                      }}
                    />
                    <Label className="cursor-pointer">I am currently studying here</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>GPA / Grade</Label>
                    <Input placeholder="3.8/4.0" {...form.register(`education.${index}.gpa`)} />
                  </div>
                </div>
              </div>
            );
          })}

          {fields.length === 0 && (
            <div className="border-none bg-transparent px-0 py-4 text-center">
              <p className="mb-4 text-sm font-[330] tracking-[-0.1px] text-muted-foreground">
                No education entries added yet.
              </p>
              <Button type="button" variant="outline" onClick={addEducation}>
                <Plus className="mr-2 h-4 w-4" /> Add Education
              </Button>
            </div>
          )}

          {fields.length > 0 && (
            <Button type="button" variant="outline" className="w-full border-border" onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Degree
            </Button>
          )}

          <div className="form-action-bleed pt-6">
            <div className="flex justify-between gap-4">
              <Button type="button" variant="outline" onClick={prevStep}>
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
