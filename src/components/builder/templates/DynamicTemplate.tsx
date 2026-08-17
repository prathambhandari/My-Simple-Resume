"use client";

import { useResumeStore } from "@/store/useResumeStore";
import type { TemplateType } from "@/types/resume";
import { cn } from "@/lib/utils";
import { formatMonYYYY } from "@/lib/dateFormat";
import type { ResumeData } from "@/types/resume";

type WebTpl = {
  layout: "classic" | "sidebar";
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
    layout: "classic",
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
    layout: "classic",
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
    layout: "classic",
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
    layout: "classic",
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
    layout: "classic",
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
    layout: "classic",
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
  sidebar: {
    layout: "sidebar",
    pad: "px-10 pb-10 pt-10",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b border-neutral-900 pb-4",
    name: "text-[24px] font-bold leading-tight tracking-tight text-neutral-950",
    job: "mt-2 text-[14px] font-medium leading-snug text-neutral-700",
    contact: "mt-2 text-[11px] leading-relaxed text-neutral-700",
    section: "mt-6",
    sectionTitle:
      "mb-2 border-b border-neutral-300 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-900",
    itemTitle: "text-[12px] font-semibold text-neutral-950",
    dates: "text-[11px] shrink-0 text-neutral-600",
    company: "text-[11px] font-medium text-neutral-800",
    location: "text-[11px] text-neutral-600",
    desc: "mt-1.5 text-[11px] leading-[1.65] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[11px] leading-relaxed text-neutral-800",
    projectUrl: "text-[10px] break-all text-neutral-600",
    entrySpacing: "space-y-4",
  },
  timeline: {
    layout: "classic",
    pad: "px-14 pb-14 pt-12",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b-2 border-neutral-900 pb-5",
    name: "text-[28px] font-semibold leading-tight tracking-[-0.02em] text-neutral-950",
    job: "mt-1.5 text-[15px] font-medium leading-snug text-neutral-700",
    contact: "mt-4 text-[12px] leading-relaxed text-neutral-700",
    section: "mt-8",
    sectionTitle:
      "mb-4 text-xs font-bold uppercase tracking-[0.2em] text-neutral-900",
    itemTitle: "text-[13px] font-semibold text-neutral-950",
    dates: "text-[11px] shrink-0 text-neutral-600",
    company: "text-[12px] font-medium text-neutral-800",
    location: "text-[11px] text-neutral-600",
    desc: "mt-2 text-[12px] leading-[1.7] text-neutral-800 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-800",
    projectUrl: "text-[11px] break-all text-neutral-600",
    entrySpacing: "space-y-6",
  },
  creative: {
    layout: "classic",
    pad: "px-14 pb-14 pt-12",
    root: "font-sans text-neutral-900 antialiased",
    header: "border-b border-neutral-200 pb-6",
    name: "text-[30px] font-bold leading-[1.08] tracking-[-0.04em] text-neutral-950",
    job: "mt-2 text-[15px] font-medium leading-snug text-neutral-700",
    contact: "mt-4 text-[12px] leading-relaxed text-neutral-600",
    section: "mt-8",
    sectionTitle:
      "mb-3 inline-flex rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white",
    itemTitle: "text-[13px] font-semibold text-neutral-950",
    dates: "text-[11px] shrink-0 text-neutral-500",
    company: "text-[12px] font-semibold text-neutral-800",
    location: "text-[11px] text-neutral-500",
    desc: "mt-2 text-[12px] leading-[1.75] text-neutral-700 whitespace-pre-wrap",
    skills: "text-[12px] leading-relaxed text-neutral-700",
    projectUrl: "text-[11px] break-all text-neutral-500",
    entrySpacing: "space-y-5",
  },
};

function EntryBlock({
  tpl,
  title,
  dateText,
  subTitle,
  location,
  description,
  projectUrl,
  timeline = false,
}: {
  tpl: WebTpl;
  title: string;
  dateText?: string;
  subTitle?: string;
  location?: string;
  description?: string;
  projectUrl?: string;
  timeline?: boolean;
}) {
  return (
    <div
      data-resume-block
      className={cn(
        timeline &&
          "relative border-l border-neutral-300 pl-4 before:absolute before:-left-[5px] before:top-1.5 before:size-2.5 before:rounded-full before:bg-neutral-900",
      )}
    >
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className={cn(tpl.itemTitle, "min-w-0 wrap-break-word")}>{title}</h3>
        {dateText ? <span className={cn(tpl.dates, "wrap-break-word")}>{dateText}</span> : null}
        {projectUrl ? (
          <span className={cn(tpl.projectUrl, "wrap-break-word")}>{projectUrl}</span>
        ) : null}
      </div>
      {(subTitle || location) && (
        <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <span className={cn(tpl.company, "min-w-0 wrap-break-word")}>{subTitle}</span>
          <span className={cn(tpl.location, "wrap-break-word")}>{location}</span>
        </div>
      )}
      {description ? <p className={cn(tpl.desc, "wrap-break-word")}>{description}</p> : null}
    </div>
  );
}

export function DynamicTemplate({
  templateId,
  showPageBreaks = false,
  bareCanvas = false,
  paginated = false,
  data,
}: {
  templateId: TemplateType;
  showPageBreaks?: boolean;
  bareCanvas?: boolean;
  paginated?: boolean;
  data?: ResumeData;
}) {
  const tpl = WEB_BY_ID[templateId];
  const storeData = useResumeStore((s) => s.data);
  const resolvedData = data ?? storeData;
  const { personalInfo, summary, experience, education, skills, projects, customSections } = resolvedData;

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
  const isTimeline = templateId === "timeline";
  const isCreative = templateId === "creative";
  const isSidebar = tpl.layout === "sidebar";

  const summarySection =
    summary?.trim() && (
      <section className={tpl.section} data-resume-block>
        {resolvedData.summaryShowTitle ? (
          <h2 className={tpl.sectionTitle}>Professional Summary</h2>
        ) : null}
        <p
          className={cn(
            tpl.desc,
            resolvedData.summaryShowTitle ? "" : "mt-0",
            "whitespace-pre-wrap wrap-break-word",
          )}
        >
          {summary}
        </p>
      </section>
    );

  const experienceSection =
    experience.length > 0 && (
      <section className={tpl.section}>
        <h2 className={tpl.sectionTitle} data-resume-section-title>
          Professional Experience
        </h2>
        <div className={tpl.entrySpacing} data-resume-entries>
          {experience.map((exp) => (
            <EntryBlock
              key={exp.id}
              tpl={tpl}
              title={exp.jobTitle}
              dateText={`${formatMonYYYY(exp.startDate) || exp.startDate} – ${exp.current ? "Present" : formatMonYYYY(exp.endDate) || exp.endDate}`}
              subTitle={exp.company}
              location={exp.location}
              description={exp.description}
              timeline={isTimeline}
            />
          ))}
        </div>
      </section>
    );

  const educationSection =
    education.length > 0 && (
      <section className={tpl.section}>
        <h2 className={tpl.sectionTitle} data-resume-section-title>
          Education
        </h2>
        <div className={tpl.entrySpacing} data-resume-entries>
          {education.map((edu) => (
            <div key={edu.id} className={cn(isTimeline && "relative border-l border-neutral-300 pl-4 before:absolute before:-left-[5px] before:top-1.5 before:size-2.5 before:rounded-full before:bg-neutral-900")} data-resume-block>
              <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className={cn(tpl.itemTitle, "min-w-0 wrap-break-word")}>
                  {edu.degree}
                </h3>
                <span className={cn(tpl.dates, "wrap-break-word")}>
                  {formatMonYYYY(edu.startDate) || edu.startDate} –{" "}
                  {edu.current ? "Present" : formatMonYYYY(edu.endDate) || edu.endDate}
                </span>
              </div>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                <span className={cn(tpl.company, "min-w-0 wrap-break-word")}>
                  {edu.school}
                </span>
                <span className={cn(tpl.location, "wrap-break-word")}>
                  {edu.location}
                </span>
              </div>
              {edu.gpa?.trim() && (
                <p className={cn(tpl.desc, "mt-1.5 wrap-break-word")}>GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    );

  const skillsSection =
    skills.length > 0 && (
      <section className={tpl.section} data-resume-block>
        <h2 className={tpl.sectionTitle}>Skills</h2>
        {isCreative ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skills
              .map((s) => s.name.trim())
              .filter(Boolean)
              .map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-800"
                >
                  {skill}
                </span>
              ))}
          </div>
        ) : (
          <p className={cn(tpl.skills, "wrap-break-word")}>
            {skills.map((s) => s.name.trim()).filter(Boolean).join(", ")}
          </p>
        )}
      </section>
    );

  const projectsSection =
    projects.length > 0 && (
      <section className={tpl.section}>
        <h2 className={tpl.sectionTitle} data-resume-section-title>
          Projects
        </h2>
        <div className={tpl.entrySpacing} data-resume-entries>
          {projects.map((proj) => (
            <EntryBlock
              key={proj.id}
              tpl={tpl}
              title={proj.name}
              projectUrl={proj.url?.trim() ? proj.url : undefined}
              description={proj.description}
              timeline={isTimeline}
            />
          ))}
        </div>
      </section>
    );

  const customSectionsMarkup =
    customSections &&
    customSections.length > 0 &&
    customSections.map((section) => (
      <section key={section.id} className={tpl.section}>
        <h2 className={tpl.sectionTitle} data-resume-section-title>
          {section.title}
        </h2>
        <div className="space-y-3" data-resume-entries>
          {section.items.map((item) => (
            <div key={item.id} data-resume-block>
              {(!item.type || item.type === "paragraph") && (
                <>
                  <h3 className={cn(tpl.itemTitle, "wrap-break-word")}>{item.name}</h3>
                  {item.description && (
                    <p
                      className={cn(
                        tpl.desc,
                        "mt-1 whitespace-pre-wrap wrap-break-word",
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </>
              )}

              {item.type === "bullets" && (
                <>
                  <h3 className={cn(tpl.itemTitle, "wrap-break-word")}>{item.name}</h3>
                  {item.description && (
                    <ul
                      className={cn(
                        "mt-1 list-disc space-y-1 pl-5 text-[12px] leading-relaxed text-neutral-800",
                        templateId === "compact" && "text-[11px]",
                        templateId === "minimal" && "text-neutral-700",
                      )}
                    >
                      {item.description
                        .split("\n")
                        .filter(Boolean)
                        .map((bullet: string, i: number) => (
                          <li key={i} className="wrap-break-word">
                            {bullet.trim()}
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}

              {item.type === "progress" && (
                <p className={cn(tpl.desc, "mt-0 wrap-break-word")}>
                  <span className="font-semibold">{item.name}</span>
                  {typeof item.value === "number" ? `: ${item.value}%` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ));

  return (
    <div
      className={cn(
        "relative min-h-[1056px] origin-top",
        tpl.pad,
        tpl.root,
        bareCanvas
          ? cn(
              "w-[816px] shrink-0 shadow-none",
              paginated
                ? "border-0 bg-transparent"
                : "border border-border bg-white",
            )
          : "mx-auto w-full max-w-[816px] scale-[0.8] bg-white shadow-sm md:scale-100"
      )}
    >
      <header
        className={cn(
          tpl.header,
          personalInfo.photoUrl?.trim() && "flex items-start justify-between gap-4",
        )}
        data-resume-block
      >
        <div className="min-w-0 flex-1">
          <h1 className={cn(tpl.name, "wrap-break-word")}>
            {personalInfo.fullName || "Your Name"}
          </h1>
          {(personalInfo.jobTitle || "").trim().length > 0 && (
            <p className={cn(tpl.job, "wrap-break-word")}>{personalInfo.jobTitle}</p>
          )}
          {!isSidebar && primaryContactLine && (
            <p className={cn(tpl.contact, "wrap-break-word")}>{primaryContactLine}</p>
          )}
          {!isSidebar && linksLine && (
            <p className={cn(tpl.contact, "wrap-break-word")}>{linksLine}</p>
          )}
        </div>
        {personalInfo.photoUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={personalInfo.photoUrl}
            alt=""
            className="size-[72px] shrink-0 rounded object-cover"
          />
        ) : null}
      </header>

      {isSidebar ? (
        <div className="mt-6 grid grid-cols-[220px_minmax(0,1fr)] gap-7">
          <aside className="space-y-6">
            {(primaryContactLine || linksLine) && (
              <section data-resume-block>
                <h2 className={tpl.sectionTitle}>Contact</h2>
                {primaryContactLine ? (
                  <p className={cn(tpl.contact, "mt-0 whitespace-pre-wrap wrap-break-word")}>
                    {primaryContactLine}
                  </p>
                ) : null}
                {linksLine ? (
                  <p className={cn(tpl.contact, "whitespace-pre-wrap wrap-break-word")}>
                    {linksLine}
                  </p>
                ) : null}
              </section>
            )}
            {skillsSection}
            {projects.length > 0 && (
              <section className={tpl.section}>
                <h2 className={tpl.sectionTitle} data-resume-section-title>
                  Projects
                </h2>
                <div className="space-y-3" data-resume-entries>
                  {projects.map((proj) => (
                    <EntryBlock
                      key={proj.id}
                      tpl={tpl}
                      title={proj.name}
                      projectUrl={proj.url?.trim() ? proj.url : undefined}
                      description={proj.description}
                    />
                  ))}
                </div>
              </section>
            )}
          </aside>
          <div>
            {summarySection}
            {experienceSection}
            {educationSection}
            {customSectionsMarkup}
          </div>
        </div>
      ) : (
        <>
          {summarySection}
          {experienceSection}
          {educationSection}
          {skillsSection}
          {projectsSection}
          {customSectionsMarkup}
        </>
      )}

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
