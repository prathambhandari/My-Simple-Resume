"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";
import { useResumeStore } from "@/store/useResumeStore";
import { DynamicTemplate } from "@/components/builder/templates/DynamicTemplate";
import { RESUME_TEMPLATE_OPTIONS } from "@/lib/resumeTemplates";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsEvents } from "@/lib/analytics";
import { useHasHydrated } from "@/lib/useHasHydrated";
import type { TemplateType } from "@/types/resume";
import type { ResumeData } from "@/types/resume";

const TEMPLATE_PREVIEW_DATA: ResumeData = {
  personalInfo: {
    fullName: "Aarav Sharma",
    jobTitle: "Frontend Developer",
    email: "aarav.sharma@email.com",
    phone: "+91 9876543210",
    dateOfBirth: "",
    location: "Bengaluru, India",
    website: "",
    linkedin: "",
    github: "",
    linkDisplay: "both",
    links: [
      { id: "lnk-1", title: "Portfolio", url: "https://aarav.dev" },
      { id: "lnk-2", title: "LinkedIn", url: "https://linkedin.com/in/aaravsharma" },
      { id: "lnk-3", title: "GitHub", url: "https://github.com/aaravsharma" },
    ],
    photoUrl: "",
  },
  summaryShowTitle: false,
  summary:
    "Frontend developer focused on clean UI, performance, and accessibility. Built and shipped responsive Next.js apps, design systems, and data-heavy dashboards with reliable UX and pixel-perfect execution.",
  experience: [
    {
      id: "exp-1",
      jobTitle: "Frontend Developer",
      company: "NovaLabs",
      location: "Remote",
      startDate: "2024-01-01",
      endDate: "2026-02-01",
      current: false,
      description:
        "• Built reusable React components and form flows with strong validation.\n• Improved Lighthouse performance by optimizing rendering and bundle splits.\n• Worked closely with design to deliver a consistent, accessible UI system.",
    },
    {
      id: "exp-2",
      jobTitle: "Software Engineer Intern",
      company: "Orbit Systems",
      location: "Mumbai, India",
      startDate: "2023-05-01",
      endDate: "2023-12-01",
      current: false,
      description:
        "• Implemented responsive pages and internal tools in React.\n• Added analytics instrumentation and improved key user flows.\n• Wrote maintainable UI code with clear patterns and strong types.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.Tech, Computer Science",
      school: "ABC Institute of Technology",
      location: "Pune, India",
      startDate: "2019-08-01",
      endDate: "2023-05-01",
      current: false,
      gpa: "8.7/10",
    },
  ],
  skills: [
    { id: "sk-1", name: "React" },
    { id: "sk-2", name: "Next.js" },
    { id: "sk-3", name: "TypeScript" },
    { id: "sk-4", name: "Tailwind CSS" },
    { id: "sk-5", name: "React Hook Form" },
    { id: "sk-6", name: "Zod" },
    { id: "sk-7", name: "Accessibility" },
  ],
  projects: [
    {
      id: "pr-1",
      name: "Resume Builder",
      description:
        "Built a fast resume builder with live preview and ATS-friendly PDF export. Added dynamic links, date pickers, and template switching.",
      url: "https://example.com",
    },
  ],
  customSections: [
    {
      id: "cs-1",
      title: "Achievements",
      items: [
        {
          id: "ach-1",
          type: "bullets",
          name: "Highlights",
          description:
            "Won 1st place in a UI hackathon\nShipped a component library used across 5+ products",
          value: undefined,
        },
      ],
    },
  ],
};

export default function TemplatesPage() {
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);
  const router = useRouter();
  const hydrated = useHasHydrated();

  const handleSelectTemplate = (id: TemplateType) => {
    analyticsEvents.templateSelected(id, "templates_page");
    setTemplate(id);
  };

  const handleContinueToEditor = () => {
    analyticsEvents.templatesContinue(template);
    router.push("/");
  };

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-[min(1320px,calc(100vw-2rem))] flex-nowrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 md:h-16 md:py-0">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[15px] tracking-[-0.02em] text-white",
            )}
            aria-label="Back to builder"
          >
            <ArrowLeft className="size-4 sm:mr-1" aria-hidden />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <span className="font-heading min-w-0 flex-1 truncate text-lg font-medium tracking-[-0.06em] text-white sm:text-xl">
            My Simple Resume
          </span>
          <Button onClick={handleContinueToEditor} size="sm" className="shrink-0">
            Continue to editor
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[min(1320px,calc(100vw-2rem))] flex-1 px-4 pt-10 pb-10 sm:px-6">
        <div className="mb-10">
          <span className="text-mono-label text-muted-foreground">
            Templates
          </span>
          <h1 className="font-heading mt-3 text-3xl font-medium leading-[1.05] tracking-[-0.06em] text-foreground sm:text-4xl">
            Pick a resume design
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESUME_TEMPLATE_OPTIONS.map((tpl) => {
            const isActive = hydrated && template === tpl.id;
              return (
                <div key={tpl.id} className="group flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    aria-label={`Select ${tpl.name} template`}
                    aria-pressed={isActive}
                    className={cn(
                      "relative w-full cursor-pointer overflow-hidden rounded-md bg-white p-0 text-left transition-transform duration-300 hover:-translate-y-1",
                      "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <div
                      className="relative aspect-816/1056 w-full overflow-hidden bg-white"
                      style={{ containerType: "inline-size" }}
                    >
                      <div
                        className="absolute left-0 top-0 origin-top-left"
                        style={{
                          width: "816px",
                          height: "1056px",
                          transform: "scale(calc(100cqi / 816px))",
                        }}
                      >
                        <DynamicTemplate
                          templateId={tpl.id}
                          data={TEMPLATE_PREVIEW_DATA}
                        />
                      </div>

                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                          isActive && "opacity-100",
                        )}
                      >
                        <span className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium tracking-[-0.02em] text-primary-foreground shadow-lg">
                          {isActive ? "Selected" : "Select template"}
                        </span>
                      </div>

                      {isActive && (
                        <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-green-600 text-white shadow-md">
                          <Check className="h-4 w-4 text-white" weight="bold" />
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex items-baseline justify-between gap-3 px-1">
                    <h2 className="font-heading text-lg font-medium tracking-[-0.04em] text-foreground">
                      {tpl.name}
                    </h2>
                    {isActive && (
                      <span className="text-mono-label text-foreground">
                        In use
                      </span>
                    )}
                  </div>
                </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
