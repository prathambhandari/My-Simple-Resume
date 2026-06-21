"use client";

import { useEffect, useState } from "react";
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
import {
  ArrowSquareOut as ExternalLink,
  PencilSimple as Pencil,
  Plus,
  TrashSimple as Trash2,
  X,
} from "@phosphor-icons/react";
import { analyticsEvents } from "@/lib/analytics";
import { clickableCardProps, stopCardActionBubble } from "@/lib/clickableCard";

const formSchema = z.object({
  skills: z.array(skillSchema),
  projects: z.array(projectSchema),
  customSections: z.array(z.any()).optional(), // Any array for dynamic form state mapping securely
});

type FormValues = z.infer<typeof formSchema>;

export function SkillsAndExtrasForm() {
  const { data, updateData, nextStep, prevStep } = useResumeStore();
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(
    null,
  );
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { skills: data.skills, projects: data.projects },
    mode: "onChange",
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    name: "skills",
    control: form.control,
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    name: "projects",
    control: form.control,
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    name: "customSections",
    control: form.control,
  });

  const onSubmit = (values: FormValues) => {
    analyticsEvents.stepCompleted(5, "skills_and_extras");
    updateData({
      skills: values.skills,
      projects: values.projects,
      customSections: values.customSections,
    });
    nextStep();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.skills || value.projects || value.customSections) {
        updateData({
          skills: (value.skills || []) as Skill[],
          projects: (value.projects || []) as Project[],
          customSections: value.customSections || [],
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  const addSkill = () => {
    analyticsEvents.itemAdded("skill", 5);
    appendSkill({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name: "",
    });
  };

  const addProject = () => {
    analyticsEvents.itemAdded("project", 5);
    appendProject({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      name: "",
      description: "",
      url: "",
    });
    setEditingProjectIndex(projectFields.length);
  };
  const addSection = () => {
    analyticsEvents.itemAdded("custom_section", 5);
    appendSection({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      title: "",
      items: [],
    });
    setEditingSectionIndex(sectionFields.length);
  };

  const handleRemoveSection = (index: number) => {
    analyticsEvents.itemRemoved("custom_section", 5);
    removeSection(index);
    if (editingSectionIndex === index) {
      setEditingSectionIndex(null);
    } else if (editingSectionIndex !== null && editingSectionIndex > index) {
      setEditingSectionIndex(editingSectionIndex - 1);
    }
  };

  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent py-0 shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 5</span>
          <h2 className="font-heading mt-2 text-xl font-medium tracking-[-0.06em] text-foreground">
            Skills &amp; extras
          </h2>
          <p className="text-muted-foreground text-sm mt-1 font-[330] tracking-[-0.1px] leading-relaxed">
            Highlight your top skills and any notable projects or
            certifications.
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* SKILLS SECTION */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-medium tracking-[-0.04em] text-foreground">
              Key skills
            </h3>

            <div className="flex flex-wrap gap-3">
              {skillFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 rounded-lg bg-transparent p-0"
                >
                  <Input
                    placeholder="React.js"
                    className="h-9 w-40 border-transparent bg-white/3 text-sm focus-visible:border-ring/40"
                    {...form.register(`skills.${index}.name`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      analyticsEvents.itemRemoved("skill", 5);
                      removeSkill(index);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-12"
                onClick={addSkill}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Skill
              </Button>
            </div>
            {form.formState.errors.skills && (
              <p className="text-sm text-destructive">
                {form.formState.errors.skills.message}
              </p>
            )}
          </div>

          {/* PROJECTS SECTION */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-medium tracking-[-0.04em] text-foreground">
              Projects / certifications
            </h3>

            {projectFields.map((field, index) => {
              const isEditing = editingProjectIndex === index;
              const project = form.getValues(`projects.${index}`);

              if (!isEditing) {
                const title = project?.name?.trim() || "Untitled project";
                const url = project?.url?.trim() || "";
                const desc = project?.description?.trim() || "";

                return (
                  <div
                    key={field.id}
                    {...clickableCardProps(() => setEditingProjectIndex(index))}
                    className="group relative rounded-lg border border-white/8 bg-white/3 p-4 transition-colors hover:border-ring/40 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-[540] tracking-[-0.02em] text-foreground">
                          {title}
                        </p>
                        {url ? (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {url}
                          </p>
                        ) : (
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            Add a link (optional)
                          </p>
                        )}
                        {desc ? (
                          <p className="mt-2 line-clamp-2 text-sm font-[330] leading-relaxed tracking-[-0.05px] text-muted-foreground/90">
                            {desc}
                          </p>
                        ) : null}
                      </div>

                      <div
                        className="flex shrink-0 items-center gap-1"
                        onClick={stopCardActionBubble}
                        onKeyDown={stopCardActionBubble}
                      >
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                            aria-label="Open project link"
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingProjectIndex(index)}
                          aria-label="Edit project"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            analyticsEvents.itemRemoved("project", 5);
                            removeProject(index);
                            if (editingProjectIndex === index) {
                              setEditingProjectIndex(null);
                            } else if (
                              editingProjectIndex !== null &&
                              editingProjectIndex > index
                            ) {
                              setEditingProjectIndex(editingProjectIndex - 1);
                            }
                          }}
                          aria-label="Delete project"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={field.id}
                  className="relative rounded-lg border border-ring/40 bg-white/4 p-4 ring-1 ring-cal-brand-glow"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      analyticsEvents.itemRemoved("project", 5);
                      removeProject(index);
                      setEditingProjectIndex(null);
                    }}
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="mt-2 grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label>
                        Project Name{" "}
                        <span className="text-destructive font-[540]">*</span>
                      </Label>
                      <Input
                        placeholder="E-commerce Platform"
                        {...form.register(`projects.${index}.name`)}
                      />
                      {form.formState.errors.projects?.[index]?.name && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.projects[index]?.name?.message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>URL / Link</Label>
                      <Input
                        placeholder="https://github.com/..."
                        {...form.register(`projects.${index}.url`)}
                      />
                      {form.formState.errors.projects?.[index]?.url && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.projects[index]?.url?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Description{" "}
                        <span className="text-destructive font-[540]">*</span>
                      </Label>
                      <Textarea
                        placeholder="Built a full-stack e-commerce app using Next.js and Stripe..."
                        className="min-h-[100px]"
                        {...form.register(`projects.${index}.description`)}
                      />
                      {form.formState.errors.projects?.[index]?.description && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.projects[index]?.description
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProjectIndex(null)}
                    >
                      Done editing
                    </Button>
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              className="w-full border-border"
              onClick={addProject}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          {/* CUSTOM SECTIONS */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-medium tracking-[-0.04em] text-foreground">
              Custom sections
            </h3>
            <p className="text-sm text-muted-foreground -mt-2 font-[330] tracking-[-0.1px]">
              Need a specialized section for awards, languages, or
              certifications? Add it here.
            </p>

            {sectionFields.map((section, sectionIndex) => (
              (() => {
                const isEditing = editingSectionIndex === sectionIndex;
                const sectionData = form.getValues(
                  `customSections.${sectionIndex}`,
                ) as any;
                const sectionTitle =
                  sectionData?.title?.trim() || "Untitled section";
                const itemCount = sectionData?.items?.length ?? 0;
                const itemPreview = (sectionData?.items ?? [])
                  .map((item: any) => item?.name?.trim())
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(", ");

                if (!isEditing) {
                  return (
                    <div
                      key={section.id}
                      {...clickableCardProps(() =>
                        setEditingSectionIndex(sectionIndex),
                      )}
                      className="group relative rounded-lg border border-white/8 bg-white/3 p-4 transition-colors hover:border-ring/40 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-[540] tracking-[-0.02em] text-foreground">
                            {sectionTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </p>
                          {itemPreview ? (
                            <p className="mt-2 line-clamp-2 text-sm font-[330] leading-relaxed tracking-[-0.05px] text-muted-foreground/90">
                              {itemPreview}
                            </p>
                          ) : null}
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
                            onClick={() => setEditingSectionIndex(sectionIndex)}
                            aria-label="Edit custom section"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveSection(sectionIndex)}
                            aria-label="Delete custom section"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={section.id}
                    className="relative space-y-4 rounded-lg border border-resume-accent/25 bg-resume-accent/6 p-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveSection(sectionIndex)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="space-y-2 pr-8">
                      <Label>
                        Section Title{" "}
                        <span className="text-destructive font-[540]">*</span>
                      </Label>
                      <Input
                        placeholder="Languages"
                        className="font-[540] border-resume-accent/25"
                        {...form.register(`customSections.${sectionIndex}.title`)}
                      />
                    </div>

                    <CustomSectionItems form={form} sectionIndex={sectionIndex} />

                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSectionIndex(null)}
                      >
                        Done editing
                      </Button>
                    </div>
                  </div>
                );
              })()
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border border-resume-accent/40 text-resume-accent hover:bg-resume-accent/10"
              onClick={addSection}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Custom Section
            </Button>
          </div>

          <div className="form-footer-flat pt-6">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  analyticsEvents.stepBack(5, 4);
                  prevStep();
                }}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="min-w-[160px] px-8 transition-opacity hover:opacity-95"
              >
                Review & Finalize
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function CustomSectionItems({
  form,
  sectionIndex,
}: {
  form: any;
  sectionIndex: number;
}) {
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
    <div className="mt-4 space-y-3 pt-4">
      <Label className="text-muted-foreground">Items in this section</Label>
      {fields.map((item: any, itemIndex) => (
        <div
          key={item.id}
          className="group/item relative animate-in rounded-lg border border-white/[0.08] bg-card p-3 fade-in duration-300"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100"
            onClick={() => remove(itemIndex)}
          >
            <X className="w-3 h-3" />
          </Button>

          {(!item.type || item.type === "paragraph") && (
            <div className="space-y-3 mt-1 pr-6">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Title / Label
                </Label>
                <Input
                  placeholder="Publications"
                  className="h-8 text-sm max-w-[300px]"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.name`,
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  placeholder="Published paper on..."
                  className="min-h-[80px] text-sm"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.description`,
                  )}
                />
              </div>
            </div>
          )}

          {item.type === "bullets" && (
            <div className="space-y-3 mt-1 pr-6">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Title / Label
                </Label>
                <Input
                  placeholder="Core Competencies"
                  className="h-8 text-sm max-w-[300px]"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.name`,
                  )}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Multiple Points (One per line)
                </Label>
                <Textarea
                  placeholder="Leadership&#10;Mentoring&#10;Agile Development"
                  className="min-h-[100px] text-sm leading-relaxed"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.description`,
                  )}
                />
              </div>
            </div>
          )}

          {item.type === "progress" && (
            <div className="space-y-3 mt-1 pr-6">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Skill / Metric Name
                </Label>
                <Input
                  placeholder="JavaScript"
                  className="h-8 text-sm max-w-[300px]"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.name`,
                  )}
                />
              </div>
              <div className="space-y-1 pt-2">
                <Label className="text-xs flex justify-between max-w-[300px]">
                  <span className="text-muted-foreground">
                    Proficiency Percentage
                  </span>
                  <span className="text-resume-accent font-[540]">
                    {form.watch(
                      `customSections.${sectionIndex}.items.${itemIndex}.value`,
                    ) || 0}
                    %
                  </span>
                </Label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="max-w-[300px] mt-2 cursor-pointer accent-resume-accent"
                  {...form.register(
                    `customSections.${sectionIndex}.items.${itemIndex}.value`,
                    { valueAsNumber: true },
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2 -ml-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-fit text-resume-accent hover:bg-resume-accent/10"
          onClick={() => addItem("paragraph")}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Paragraph
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-fit text-resume-accent hover:bg-resume-accent/10"
          onClick={() => addItem("bullets")}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Multiple Points
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-fit text-resume-accent hover:bg-resume-accent/10"
          onClick={() => addItem("progress")}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Percentage Bar
        </Button>
      </div>
    </div>
  );
}
