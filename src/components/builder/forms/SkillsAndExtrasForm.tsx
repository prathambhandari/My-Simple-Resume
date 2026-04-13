"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { skillSchema, projectSchema, Skill, Project } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  skills: z.array(skillSchema),
  projects: z.array(projectSchema),
  customSections: z.array(z.any()).optional(), // Any array for dynamic form state mapping securely
});

type FormValues = z.infer<typeof formSchema>;

export function SkillsAndExtrasForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { skills: data.skills, projects: data.projects },
    mode: "onChange",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    name: "skills",
    control: form.control,
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    name: "projects",
    control: form.control,
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    name: "customSections",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    updateData({ skills: values.skills, projects: values.projects, customSections: values.customSections });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.skills || value.projects || value.customSections) {
        updateData({ 
          skills: (value.skills || []) as Skill[], 
          projects: (value.projects || []) as Project[],
          customSections: value.customSections || []
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  const addSkill = () => {
    appendSkill({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name: "",
    });
  };

  const addProject = () => {
    appendProject({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name: "",
      description: "",
      url: "",
    });
  };
  const addSection = () => {
    appendSection({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      title: "",
      items: [],
    });
  };
  
  return (
    <Card className="glass-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/40 dark:border-slate-800 shadow-sm border-0">
      <CardContent className="p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Skills & Extras</h2>
          <p className="text-slate-500 text-sm mt-1">Highlight your top skills and any notable projects or certifications.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {/* SKILLS SECTION */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Key Skills</h3>
            
            <div className="flex flex-wrap gap-3">
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                  <Input 
                    placeholder="E.g. React.js" 
                    className="w-40 h-8 text-sm"
                    {...form.register(`skills.${index}.name`)} 
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-destructive"
                    onClick={() => removeSkill(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="h-12 border-dashed" onClick={addSkill}>
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>
            {form.formState.errors.skills && (
              <p className="text-sm text-destructive">{form.formState.errors.skills.message}</p>
            )}
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* PROJECTS SECTION */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Projects / Certifications</h3>
            
            {projectFields.map((field, index) => (
              <div key={field.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 relative group">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label>Project Name <span className="text-primary">*</span></Label>
                    <Input placeholder="E-commerce Platform" {...form.register(`projects.${index}.name`)} />
                    {form.formState.errors.projects?.[index]?.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.projects[index]?.name?.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL / Link</Label>
                    <Input placeholder="https://github.com/..." {...form.register(`projects.${index}.url`)} />
                    {form.formState.errors.projects?.[index]?.url && (
                      <p className="text-sm text-destructive">{form.formState.errors.projects[index]?.url?.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description <span className="text-primary">*</span></Label>
                    <Textarea 
                      placeholder="Built a full-stack e-commerce app using Next.js and Stripe..." 
                      className="min-h-[100px]"
                      {...form.register(`projects.${index}.description`)} 
                    />
                    {form.formState.errors.projects?.[index]?.description && (
                      <p className="text-sm text-destructive">{form.formState.errors.projects[index]?.description?.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full border-dashed" onClick={addProject}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* CUSTOM SECTIONS */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Custom Sections</h3>
            <p className="text-sm text-slate-500 -mt-2">Need a specialized section for Awards, Languages, or Certifications? Add it here.</p>
            
            {sectionFields.map((section, sectionIndex) => (
              <div key={section.id} className="p-4 rounded-xl border border-primary/20 dark:border-primary/20 bg-primary/5 relative group space-y-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSection(sectionIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <div className="space-y-2 pr-8">
                  <Label>Section Title <span className="text-primary">*</span></Label>
                  <Input placeholder="E.g. Languages" className="font-bold border-primary/30" {...form.register(`customSections.${sectionIndex}.title`)} />
                </div>

                <CustomSectionItems form={form} sectionIndex={sectionIndex} />
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" /> Add Custom Section
            </Button>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
            <Button 
              type="submit" 
              className="px-8 shadow-md hover:shadow-lg transition-all"
            >
              Review & Finalize
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CustomSectionItems({ form, sectionIndex }: { form: any, sectionIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    name: `customSections.${sectionIndex}.items`,
    control: form.control,
  });

  const addItem = (type: "paragraph" | "bullets" | "progress") => {
    append({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      type,
      name: "",
      description: "",
      ...(type === "progress" ? { value: 50 } : {}),
    });
  };

  return (
    <div className="space-y-3 mt-4 border-t border-primary/20 pt-4">
      <Label className="text-primary/80">Items in this section</Label>
      {fields.map((item: any, itemIndex) => (
        <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-lg relative group/item border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-300">
           <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-slate-400 hover:text-destructive opacity-0 group-hover/item:opacity-100" onClick={() => remove(itemIndex)}>
              <X className="w-3 h-3" />
           </Button>
           
           {(!item.type || item.type === "paragraph") && (
             <div className="space-y-3 mt-1 pr-6">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Title / Label</Label>
                  <Input placeholder="E.g. Publications" className="h-8 text-sm max-w-[300px]" {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.name`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Description</Label>
                  <Textarea placeholder="Published paper on..." className="min-h-[80px] text-sm" {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.description`)} />
                </div>
             </div>
           )}

           {item.type === "bullets" && (
             <div className="space-y-3 mt-1 pr-6">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Title / Label</Label>
                  <Input placeholder="E.g. Core Competencies" className="h-8 text-sm max-w-[300px]" {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.name`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Multiple Points (One per line)</Label>
                  <Textarea placeholder="Leadership&#10;Mentoring&#10;Agile Development" className="min-h-[100px] text-sm leading-relaxed" {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.description`)} />
                </div>
             </div>
           )}

           {item.type === "progress" && (
             <div className="space-y-3 mt-1 pr-6">
                <div className="space-y-1">
                   <Label className="text-xs text-slate-500">Skill / Metric Name</Label>
                   <Input placeholder="E.g. JavaScript" className="h-8 text-sm max-w-[300px]" {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.name`)} />
                </div>
                <div className="space-y-1 pt-2">
                   <Label className="text-xs flex justify-between max-w-[300px]">
                      <span className="text-slate-500">Proficiency Percentage</span>
                      <span className="text-primary font-bold">{form.watch(`customSections.${sectionIndex}.items.${itemIndex}.value`) || 0}%</span>
                   </Label>
                   <Input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="5"
                      className="max-w-[300px] mt-2 cursor-pointer accent-primary" 
                      {...form.register(`customSections.${sectionIndex}.items.${itemIndex}.value`, { valueAsNumber: true })} 
                   />
                </div>
             </div>
           )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 -ml-2 pt-2">
         <Button type="button" variant="ghost" size="sm" className="h-8 w-fit text-primary hover:bg-primary/10" onClick={() => addItem("paragraph")}>
           <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Paragraph
         </Button>
         <Button type="button" variant="ghost" size="sm" className="h-8 w-fit text-primary hover:bg-primary/10" onClick={() => addItem("bullets")}>
           <Plus className="w-3.5 h-3.5 mr-1.5" /> Multiple Points
         </Button>
         <Button type="button" variant="ghost" size="sm" className="h-8 w-fit text-primary hover:bg-primary/10" onClick={() => addItem("progress")}>
           <Plus className="w-3.5 h-3.5 mr-1.5" /> Percentage Bar
         </Button>
      </div>
    </div>
  );
}
