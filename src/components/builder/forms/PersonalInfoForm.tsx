"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema, PersonalInfo } from "@/types/resume";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneInput } from "@/components/builder/forms/PhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowSquareOut as ExternalLink,
  Plus,
  TrashSimple as Trash2,
} from "@phosphor-icons/react";
import { analyticsEvents } from "@/lib/analytics";

type LinkDraft = { title: string; url: string };

export function PersonalInfoForm() {
  const { data, updateData, nextStep } = useResumeStore();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [draft, setDraft] = useState<LinkDraft>({ title: "", url: "" });

  const form = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema) as Resolver<PersonalInfo>,
    defaultValues: {
      ...data.personalInfo,
      links: data.personalInfo.links ?? [],
      linkDisplay: data.personalInfo.linkDisplay ?? "both",
    },
    mode: "onChange",
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } =
    useFieldArray({
      control: form.control,
      name: "links",
    });

  const canAddLink = useMemo(() => {
    return draft.title.trim().length > 0 && draft.url.trim().length > 0;
  }, [draft]);

  const onSubmit = (values: PersonalInfo) => {
    analyticsEvents.stepCompleted(1, "personal_info");
    updateData({ personalInfo: values });
    nextStep();
  };

  const onInvalid = () => {
    requestAnimationFrame(() => {
      document
        .querySelector("[aria-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      updateData({ personalInfo: value as PersonalInfo });
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateData]);

  return (
    <Card className="overflow-visible rounded-none border-none bg-transparent py-0 shadow-none ring-0">
      <CardContent className="p-5 md:p-6">
        <div className="mb-6">
          <span className="text-mono-label text-muted-foreground">Step 1</span>
          <h2 className="font-heading mt-2 text-xl font-medium tracking-[-0.06em] text-foreground">
            Personal information
          </h2>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive font-[540]">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="Raj"
                aria-invalid={!!form.formState.errors.fullName}
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                aria-invalid={!!form.formState.errors.dateOfBirth}
                {...form.register("dateOfBirth")}
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Frontend Developer"
                {...form.register("jobTitle")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive font-[540]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="raj@example.com"
                required
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <PhoneInput
                    id="phone"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={!!form.formState.errors.phone}
                  />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, Country"
                {...form.register("location")}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Links</Label>
                <div className="flex items-center gap-2">
                  <Controller
                    control={form.control}
                    name="linkDisplay"
                    render={({ field }) => (
                      <Select
                        value={(field.value ?? "both") as string}
                        onValueChange={(val) => field.onChange(val as any)}
                      >
                        <SelectTrigger size="sm" className="w-[160px]">
                          <SelectValue placeholder="Display" />
                        </SelectTrigger>
                        <SelectContent align="end" alignItemWithTrigger={false}>
                          <SelectItem value="title">Hyperlink</SelectItem>
                          <SelectItem value="url">URL only</SelectItem>
                          <SelectItem value="both">Title + URL</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                    onClick={() => {
                      analyticsEvents.itemAdded("link_dialog_opened", 1);
                      setDraft({ title: "", url: "" });
                      setLinkDialogOpen(true);
                    }}
                  >
                    <Plus className="size-4" />
                    Add link
                  </Button>
                </div>
              </div>

              {linkFields.length === 0 ? (
                <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-3 text-sm text-muted-foreground">
                  Add your portfolio, LinkedIn, GitHub, etc.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkFields.map((link, idx) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/3 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-[540] tracking-[-0.02em] text-foreground">
                          {(link as any).title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {(link as any).url}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <a
                          href={(link as any).url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                          aria-label="Open link"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            analyticsEvents.itemRemoved("link", 1);
                            removeLink(idx);
                          }}
                          aria-label="Remove link"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-footer-flat pt-4">
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

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add link</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Add a title (e.g. LinkedIn) and the full URL.
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-title">Title</Label>
                <Input
                  id="link-title"
                  placeholder="LinkedIn"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, title: e.target.value }))
                  }
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={draft.url}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, url: e.target.value }))
                  }
                  maxLength={300}
                />
              </div>
            </div>

            <DialogFooter className="border-t-0 bg-transparent">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canAddLink}
                onClick={() => {
                  analyticsEvents.itemAdded("link", 1);
                  appendLink({
                    id:
                      Date.now().toString(36) +
                      Math.random().toString(36).slice(2),
                    title: draft.title.trim(),
                    url: draft.url.trim(),
                  } as any);
                  setLinkDialogOpen(false);
                }}
              >
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
