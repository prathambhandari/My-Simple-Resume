"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { workExperienceSchema, WorkExperience } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

// Wrapper schema for field array
const formSchema = z.object({
  experience: z.array(workExperienceSchema)
});

type FormValues = z.infer<typeof formSchema>;

export function WorkExperienceForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { experience: data.experience },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "experience",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    updateData({ experience: values.experience });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.experience) {
        updateData({ experience: value.experience as WorkExperience[] });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  const addExperience = () => {
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
  };
  
  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 3</span>
          <h2 className="font-heading mt-2 text-2xl font-medium tracking-[-0.06em] text-foreground">Work experience</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`experience.${index}.current`);
            
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
                    <Label>Job Title <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="Software Engineer" {...form.register(`experience.${index}.jobTitle`)} />
                    {form.formState.errors.experience?.[index]?.jobTitle && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.jobTitle?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="Acme Corp" {...form.register(`experience.${index}.company`)} />
                    {form.formState.errors.experience?.[index]?.company && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.company?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Location <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="San Francisco, CA" {...form.register(`experience.${index}.location`)} />
                    {form.formState.errors.experience?.[index]?.location && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.location?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date <span className="text-destructive font-[540]">*</span></Label>
                    <Input placeholder="MM/YYYY" {...form.register(`experience.${index}.startDate`)} />
                    {form.formState.errors.experience?.[index]?.startDate && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.startDate?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input placeholder="MM/YYYY" disabled={isCurrent} {...form.register(`experience.${index}.endDate`)} />
                  </div>

                  <div className="my-2 flex items-center space-x-2">
                    <Switch 
                      checked={isCurrent}
                      onCheckedChange={(val) => {
                        form.setValue(`experience.${index}.current`, val, { shouldValidate: true, shouldDirty: true });
                        if (val) form.setValue(`experience.${index}.endDate`, "");
                      }}
                    />
                    <Label className="cursor-pointer">I currently work here</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Description <span className="text-destructive font-[540]">*</span></Label>
                    <Textarea 
                      placeholder="Describe your achievements and responsibilities..." 
                      className="min-h-[120px]"
                      {...form.register(`experience.${index}.description`)} 
                    />
                    {form.formState.errors.experience?.[index]?.description && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.description?.message}</p>
                    )}
                  </div>
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
            <Button type="button" variant="outline" className="w-full border-border" onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Experience
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
