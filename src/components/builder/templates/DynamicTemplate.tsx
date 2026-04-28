"use client";

import { useResumeStore } from "@/store/useResumeStore";
import type { TemplateType } from "@/types/resume";
import { cn } from "@/lib/utils";
import { formatMonYYYY } from "@/lib/dateFormat";

type WebTpl = {
  pad: string;
  root: string;
  header: string;
  name: string;
  job: string;
  contact: string;
  section: string;
  sectionTitle: string;
  itemTitle: string;
  dates: string;
  company: string;
  location: string;
  desc: string;
  skills: string;
  projectUrl: string;
  entrySpacing: string;
};

const WEB_BY_ID: Record<TemplateType, WebTpl> = {
  standard: {
    pad: "px-14 pb-14 pt-12",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b border-neutral-900 pb-5",
    name: "text-[28px] font-bold leading-tight tracking-tight text-neutral-950",
    job: "mt-1.5 text-[15px] font-normal leading-snug text-neutral-800",
    contact: "mt-4 text-[13px] leading-relaxed text-neutral-700",
    section: "mt-7",
    sectionTitle:
      "mb-3 border-b border-neutral-300 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-900",
    itemTitle: "text-[13px] font-bold text-neutral-950",
    dates: "text-[12px] shrink-0 text-neutral-600",
    company: "text-[12px] font-semibold text-neutral-800",
    location: "text-[12px] text-neutral-600",
    desc: "mt-2 text-[12px] leading-[1.65] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-800",
    projectUrl: "text-[11px] break-all text-neutral-600",
    entrySpacing: "space-y-5",
  },
  modern: {
    pad: "px-14 pb-14 pt-12",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b border-neutral-200 pb-7",
    name: "text-[30px] font-semibold leading-[1.15] tracking-[-0.035em] text-neutral-900",
    job: "mt-3 text-[15px] font-medium leading-snug text-neutral-500",
    contact: "mt-6 text-[13px] leading-relaxed text-neutral-600",
    section: "mt-9",
    sectionTitle:
      "mb-3 border-b border-neutral-200 pb-2 text-sm font-semibold tracking-tight text-neutral-800 uppercase",
    itemTitle: "text-[13px] font-semibold text-neutral-950",
    dates: "text-[12px] shrink-0 text-neutral-500",
    company: "text-[12px] font-medium text-neutral-800",
    location: "text-[12px] text-neutral-500",
    desc: "mt-2.5 text-[12px] leading-[1.7] text-neutral-700 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-700",
    projectUrl: "text-[11px] break-all text-neutral-500",
    entrySpacing: "space-y-6",
  },
  executive: {
    pad: "px-14 pb-14 pt-12",
    root: "font-serif text-neutral-900 antialiased",
    header: "border-b-4 border-neutral-900 pb-5",
    name: "text-[26px] font-bold leading-tight tracking-tight text-neutral-950",
    job: "mt-2 text-[15px] font-semibold leading-snug text-neutral-800",
    contact: "mt-4 text-[13px] leading-relaxed text-neutral-700",
    section: "mt-7",
    sectionTitle:
      "mb-3 border-b border-neutral-400 pb-1.5 text-sm font-bold uppercase tracking-[0.08em] text-neutral-900",
    itemTitle: "text-[13px] font-bold text-neutral-950",
    dates: "text-[12px] shrink-0 text-neutral-600",
    company: "text-[12px] font-semibold text-neutral-800",
    location: "text-[12px] text-neutral-600",
    desc: "mt-2 text-[12px] leading-[1.65] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-800",
    projectUrl: "text-[11px] break-all text-neutral-600",
    entrySpacing: "space-y-5",
  },
  compact: {
    pad: "px-10 pb-10 pt-9",
    root: "font-sans text-[11px] text-neutral-900 antialiased leading-snug",
    header: "border-b border-neutral-900 pb-3",
    name: "text-[20px] font-bold leading-tight text-neutral-950",
    job: "mt-1 text-[12px] font-semibold text-neutral-800",
    contact: "mt-2 text-[10px] leading-relaxed text-neutral-700",
    section: "mt-5",
    sectionTitle:
      "mb-2 border-b border-neutral-300 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-900",
    itemTitle: "text-[11px] font-bold text-neutral-950",
    dates: "text-[10px] shrink-0 text-neutral-600",
    company: "text-[11px] font-semibold text-neutral-800",
    location: "text-[10px] text-neutral-600",
    desc: "mt-1.5 text-[11px] leading-[1.55] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[11px] leading-relaxed text-neutral-800",
    projectUrl: "text-[10px] break-all text-neutral-600",
    entrySpacing: "space-y-3.5",
  },
  minimal: {
    pad: "px-14 pb-16 pt-14",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b border-neutral-200 pb-10 text-center",
    name: "text-4xl font-light tracking-[0.02em] text-neutral-900",
    job: "mt-4 text-base font-normal text-neutral-600",
    contact: "mt-8 text-[13px] leading-relaxed text-neutral-500",
    section: "mt-12",
    sectionTitle:
      "mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400",
    itemTitle: "text-[13px] font-semibold text-neutral-950",
    dates: "text-[12px] shrink-0 text-neutral-500",
    company: "text-[12px] font-medium text-neutral-700",
    location: "text-[12px] text-neutral-500",
    desc: "mt-2 text-[12px] leading-[1.75] text-neutral-700 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-700",
    projectUrl: "text-[11px] break-all text-neutral-500",
    entrySpacing: "space-y-6",
  },
  signature: {
    pad: "px-14 pb-14 pt-12",
    root: "font-sans text-neutral-900 antialiased",
    header:
      "rounded-sm bg-neutral-950 px-6 py-5 text-white shadow-sm",
    name: "text-[26px] font-bold tracking-tight text-white",
    job: "mt-2 text-[15px] font-normal text-neutral-300",
    contact: "mt-4 text-[13px] leading-relaxed text-neutral-400",
    section: "mt-8",
    sectionTitle:
      "mb-3 border-b border-neutral-900 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-900",
    itemTitle: "text-[13px] font-bold text-neutral-950",
    dates: "text-[12px] shrink-0 text-neutral-600",
    company: "text-[12px] font-semibold text-neutral-800",
    location: "text-[12px] text-neutral-600",
    desc: "mt-2 text-[12px] leading-[1.65] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-800",
    projectUrl: "text-[11px] break-all text-neutral-600",
    entrySpacing: "space-y-5",
  },
};

export function DynamicTemplate({
  templateId,
  showPageBreaks = false,
  bareCanvas = false,
}: {
  templateId: TemplateType;
  showPageBreaks?: boolean;
  bareCanvas?: boolean;
}) {
  const tpl = WEB_BY_ID[templateId];
  const { data } = useResumeStore();
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;

  const derivedLinks = [
    ...(personalInfo.links ?? []),
    personalInfo.website?.trim()
      ? { id: "website", title: "Website", url: personalInfo.website.trim() }
      : null,
    personalInfo.linkedin?.trim()
      ? { id: "linkedin", title: "LinkedIn", url: personalInfo.linkedin.trim() }
      : null,
    personalInfo.github?.trim()
      ? { id: "github", title: "GitHub", url: personalInfo.github.trim() }
      : null,
  ].filter(Boolean) as Array<{ id: string; title: string; url: string }>;

  const linkDisplay = personalInfo.linkDisplay ?? "both";
  const renderedLinks = derivedLinks.map((l) => {
    if (linkDisplay === "title") return l.title;
    if (linkDisplay === "url") return l.url;
    return `${l.title}: ${l.url}`;
  });

  const primaryContactLine = [
    (personalInfo.dateOfBirth || "").trim() ? `DOB: ${personalInfo.dateOfBirth}` : "",
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ]
    .filter(Boolean)
    .join(" · ");

  const linksLine = renderedLinks.filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "relative min-h-[1056px] origin-top",
        tpl.pad,
        tpl.root,
        bareCanvas
          ? "w-[816px] shrink-0 border border-border bg-transparent shadow-none"
          : "mx-auto w-full max-w-[816px] scale-[0.8] bg-white shadow-sm md:scale-100"
      )}
    >
      <header className={tpl.header}>
        <h1 className={tpl.name}>{personalInfo.fullName || "Your Name"}</h1>
        {(personalInfo.jobTitle || "").trim().length > 0 && (
          <p className={tpl.job}>{personalInfo.jobTitle}</p>
        )}
        {primaryContactLine && <p className={tpl.contact}>{primaryContactLine}</p>}
        {linksLine && <p className={tpl.contact}>{linksLine}</p>}
      </header>

      {summary?.trim() && (
        <section className={tpl.section}>
          {data.summaryShowTitle ? (
            <h2 className={tpl.sectionTitle}>Professional Summary</h2>
          ) : null}
          <p className={cn(tpl.desc, data.summaryShowTitle ? "" : "mt-0", "whitespace-pre-wrap")}>
            {summary}
          </p>
        </section>
      )}

      {experience.length > 0 && (
        <section className={tpl.section}>
          <h2 className={tpl.sectionTitle}>Professional Experience</h2>
          <div className={tpl.entrySpacing}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className={tpl.itemTitle}>{exp.jobTitle}</h3>
                  <span className={tpl.dates}>
                    {formatMonYYYY(exp.startDate) || exp.startDate} –{" "}
                    {exp.current ? "Present" : formatMonYYYY(exp.endDate) || exp.endDate}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <span className={tpl.company}>{exp.company}</span>
                  <span className={tpl.location}>{exp.location}</span>
                </div>
                <p className={tpl.desc}>{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className={tpl.section}>
          <h2 className={tpl.sectionTitle}>Education</h2>
          <div className={tpl.entrySpacing}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className={tpl.itemTitle}>{edu.degree}</h3>
                  <span className={tpl.dates}>
                    {formatMonYYYY(edu.startDate) || edu.startDate} –{" "}
                    {edu.current ? "Present" : formatMonYYYY(edu.endDate) || edu.endDate}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <span className={tpl.company}>{edu.school}</span>
                  <span className={tpl.location}>{edu.location}</span>
                </div>
                {edu.gpa?.trim() && (
                  <p className={cn(tpl.desc, "mt-1.5")}>GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className={tpl.section}>
          <h2 className={tpl.sectionTitle}>Skills</h2>
          <p className={tpl.skills}>
            {skills.map((s) => s.name.trim()).filter(Boolean).join(", ")}
          </p>
        </section>
      )}

      {projects.length > 0 && (
        <section className={tpl.section}>
          <h2 className={tpl.sectionTitle}>Projects</h2>
          <div className={tpl.entrySpacing}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className={tpl.itemTitle}>{proj.name}</h3>
                  {proj.url?.trim() && (
                    <span className={tpl.projectUrl}>{proj.url}</span>
                  )}
                </div>
                <p className={tpl.desc}>{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {customSections &&
        customSections.length > 0 &&
        customSections.map((section) => (
          <section key={section.id} className={tpl.section}>
            <h2 className={tpl.sectionTitle}>{section.title}</h2>
            <div className="space-y-3">
              {section.items.map((item: any) => (
                <div key={item.id}>
                  {(!item.type || item.type === "paragraph") && (
                    <>
                      <h3 className={tpl.itemTitle}>{item.name}</h3>
                      {item.description && (
                        <p className={cn(tpl.desc, "mt-1 whitespace-pre-wrap")}>{item.description}</p>
                      )}
                    </>
                  )}

                  {item.type === "bullets" && (
                    <>
                      <h3 className={tpl.itemTitle}>{item.name}</h3>
                      {item.description && (
                        <ul
                          className={cn(
                            "mt-1 list-disc space-y-1 pl-5 text-[12px] leading-relaxed text-neutral-800",
                            templateId === "compact" && "text-[11px]",
                            templateId === "minimal" && "text-neutral-700"
                          )}
                        >
                          {item.description
                            .split("\n")
                            .filter(Boolean)
                            .map((bullet: string, i: number) => (
                              <li key={i}>{bullet.trim()}</li>
                            ))}
                        </ul>
                      )}
                    </>
                  )}

                  {item.type === "progress" && (
                    <p className={cn(tpl.desc, "mt-0")}>
                      <span className="font-semibold">{item.name}</span>
                      {typeof item.value === "number" ? `: ${item.value}%` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

      {showPageBreaks && (
        <div className="pointer-events-none absolute inset-0 z-50 h-full overflow-hidden rounded-b-sm">
          {[...Array(5)].map(
            (_, i) =>
              i > 0 && (
                <div
                  key={i}
                  className="absolute left-0 flex w-[816px] justify-center border-t-[1.5px] border-dashed border-neutral-300 opacity-80"
                  style={{ top: `${i * 1056}px` }}
                >
                  <span className="pointer-events-auto rounded-b border border-t-0 border-neutral-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 shadow-sm">
                    Suggested Page {i + 1}
                  </span>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}
