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
    <Card className="glass-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-800 shadow-sm border-0">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Work Experience</h2>
          <p className="text-slate-500 text-sm mt-1">List your relevant experience, starting with the most recent.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`experience.${index}.current`);
            
            return (
              <div key={field.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 relative group">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label>Job Title <span className="text-primary">*</span></Label>
                    <Input placeholder="Software Engineer" {...form.register(`experience.${index}.jobTitle`)} />
                    {form.formState.errors.experience?.[index]?.jobTitle && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.jobTitle?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Company <span className="text-primary">*</span></Label>
                    <Input placeholder="Acme Corp" {...form.register(`experience.${index}.company`)} />
                    {form.formState.errors.experience?.[index]?.company && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.company?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Location <span className="text-primary">*</span></Label>
                    <Input placeholder="San Francisco, CA" {...form.register(`experience.${index}.location`)} />
                    {form.formState.errors.experience?.[index]?.location && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.location?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date <span className="text-primary">*</span></Label>
                    <Input placeholder="MM/YYYY" {...form.register(`experience.${index}.startDate`)} />
                    {form.formState.errors.experience?.[index]?.startDate && (
                      <p className="text-sm text-destructive">{form.formState.errors.experience[index]?.startDate?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input placeholder="MM/YYYY" disabled={isCurrent} {...form.register(`experience.${index}.endDate`)} />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2 my-2">
                    <Switch 
                      checked={isCurrent}
                      onCheckedChange={(val) => {
                        form.setValue(`experience.${index}.current`, val, { shouldValidate: true, shouldDirty: true });
                        if (val) form.setValue(`experience.${index}.endDate`, "");
                      }}
                    />
                    <Label className="cursor-pointer">I currently work here</Label>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description <span className="text-primary">*</span></Label>
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
            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-slate-500 mb-4">No experience entries added yet.</p>
              <Button type="button" variant="outline" onClick={addExperience}>
                <Plus className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </div>
          )}

          {fields.length > 0 && (
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={addExperience}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Experience
            </Button>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
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
