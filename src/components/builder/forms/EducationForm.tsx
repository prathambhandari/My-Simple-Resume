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
    <Card className="glass-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-800 shadow-sm border-0">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Education</h2>
          <p className="text-slate-500 text-sm mt-1">Add your educational background, degrees, and certifications.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {fields.map((field, index) => {
            const isCurrent = form.watch(`education.${index}.current`);
            
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
                    <Label>Degree/Course <span className="text-red-500">*</span></Label>
                    <Input placeholder="B.S. Computer Science" {...form.register(`education.${index}.degree`)} />
                    {form.formState.errors.education?.[index]?.degree && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.degree?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>School/University <span className="text-red-500">*</span></Label>
                    <Input placeholder="University of Technology" {...form.register(`education.${index}.school`)} />
                    {form.formState.errors.education?.[index]?.school && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.school?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Input placeholder="Boston, MA" {...form.register(`education.${index}.location`)} />
                    {form.formState.errors.education?.[index]?.location && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.location?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date <span className="text-red-500">*</span></Label>
                    <Input placeholder="YYYY or MM/YYYY" {...form.register(`education.${index}.startDate`)} />
                    {form.formState.errors.education?.[index]?.startDate && (
                      <p className="text-sm text-destructive">{form.formState.errors.education[index]?.startDate?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input placeholder="YYYY or MM/YYYY" disabled={isCurrent} {...form.register(`education.${index}.endDate`)} />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2 my-2">
                    <Switch 
                      checked={isCurrent}
                      onCheckedChange={(val) => {
                        form.setValue(`education.${index}.current`, val, { shouldValidate: true, shouldDirty: true });
                        if (val) form.setValue(`education.${index}.endDate`, "");
                      }}
                    />
                    <Label className="cursor-pointer">I am currently studying here</Label>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>GPA / Grade</Label>
                    <Input placeholder="3.8/4.0" {...form.register(`education.${index}.gpa`)} />
                  </div>
                </div>
              </div>
            );
          })}

          {fields.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-slate-500 mb-4">No education entries added yet.</p>
              <Button type="button" variant="outline" onClick={addEducation}>
                <Plus className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </div>
          )}

          {fields.length > 0 && (
            <Button type="button" variant="outline" className="w-full border-dashed" onClick={addEducation}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Degree
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
