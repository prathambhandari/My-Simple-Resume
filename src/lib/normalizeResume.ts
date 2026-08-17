import {
  ResumeData,
  defaultResumeData,
  TemplateType,
} from "@/types/resume";
import { isValidTemplateId } from "@/lib/resumeTemplates";

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const asBool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const asId = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : crypto.randomUUID();

const asNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

function normalizeLinks(raw: unknown) {
  if (!Array.isArray(raw)) return defaultResumeData.personalInfo.links ?? [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const link = item as Record<string, unknown>;
      const title = asString(link.title).trim();
      const url = asString(link.url).trim();
      if (!title && !url) return null;
      return { id: asId(link.id), title: title || "Link", url };
    })
    .filter(Boolean) as NonNullable<ResumeData["personalInfo"]["links"]>;
}

function normalizeExperience(raw: unknown): ResumeData["experience"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const exp = item as Record<string, unknown>;
      const jobTitle = asString(exp.jobTitle).trim();
      const company = asString(exp.company).trim();
      if (!jobTitle && !company) return null;
      return {
        id: asId(exp.id),
        jobTitle,
        company,
        location: asString(exp.location),
        startDate: asString(exp.startDate),
        endDate: asString(exp.endDate),
        current: asBool(exp.current),
        description: asString(exp.description),
      };
    })
    .filter(Boolean) as ResumeData["experience"];
}

function normalizeEducation(raw: unknown): ResumeData["education"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const edu = item as Record<string, unknown>;
      const degree = asString(edu.degree).trim();
      const school = asString(edu.school).trim();
      if (!degree && !school) return null;
      return {
        id: asId(edu.id),
        degree,
        school,
        location: asString(edu.location),
        startDate: asString(edu.startDate),
        endDate: asString(edu.endDate),
        current: asBool(edu.current),
        gpa: asString(edu.gpa),
      };
    })
    .filter(Boolean) as ResumeData["education"];
}

function normalizeSkills(raw: unknown): ResumeData["skills"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") {
        const name = item.trim();
        return name ? { id: crypto.randomUUID(), name } : null;
      }
      if (!item || typeof item !== "object") return null;
      const skill = item as Record<string, unknown>;
      const name = asString(skill.name).trim();
      if (!name) return null;
      return { id: asId(skill.id), name };
    })
    .filter(Boolean) as ResumeData["skills"];
}

function normalizeProjects(raw: unknown): ResumeData["projects"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const project = item as Record<string, unknown>;
      const name = asString(project.name).trim();
      if (!name) return null;
      return {
        id: asId(project.id),
        name,
        description: asString(project.description),
        url: asString(project.url),
      };
    })
    .filter(Boolean) as ResumeData["projects"];
}

function normalizeCustomSections(raw: unknown): ResumeData["customSections"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const section = item as Record<string, unknown>;
      const title = asString(section.title).trim();
      if (!title) return null;
      const items = Array.isArray(section.items)
        ? section.items
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null;
              const custom = entry as Record<string, unknown>;
              const name = asString(custom.name).trim();
              if (!name) return null;
              const type =
                custom.type === "bullets" || custom.type === "progress"
                  ? custom.type
                  : "paragraph";
              return {
                id: asId(custom.id),
                type,
                name,
                description: asString(custom.description),
                value: asNumber(custom.value),
              };
            })
            .filter(Boolean)
        : [];
      return {
        id: asId(section.id),
        title,
        items: items as NonNullable<ResumeData["customSections"]>[number]["items"],
      };
    })
    .filter(Boolean) as ResumeData["customSections"];
}

export function normalizeResume(
  raw: unknown,
  fallback: ResumeData = defaultResumeData,
): ResumeData {
  if (!raw || typeof raw !== "object") return fallback;
  const input = raw as Record<string, unknown>;
  const personal =
    input.personalInfo && typeof input.personalInfo === "object"
      ? (input.personalInfo as Record<string, unknown>)
      : {};
  const fallbackPersonal = fallback.personalInfo;

  const linkDisplay =
    personal.linkDisplay === "title" ||
    personal.linkDisplay === "url" ||
    personal.linkDisplay === "both"
      ? personal.linkDisplay
      : (fallbackPersonal.linkDisplay ?? "both");

  return {
    personalInfo: {
      fullName: asString(personal.fullName, fallbackPersonal.fullName),
      jobTitle: asString(personal.jobTitle, fallbackPersonal.jobTitle),
      email: asString(personal.email, fallbackPersonal.email),
      phone: asString(personal.phone, fallbackPersonal.phone),
      dateOfBirth: asString(personal.dateOfBirth, fallbackPersonal.dateOfBirth),
      location: asString(personal.location, fallbackPersonal.location),
      website: asString(personal.website, fallbackPersonal.website),
      linkedin: asString(personal.linkedin, fallbackPersonal.linkedin),
      github: asString(personal.github, fallbackPersonal.github),
      linkDisplay,
      links: normalizeLinks(personal.links ?? fallbackPersonal.links),
      photoUrl: asString(personal.photoUrl, fallbackPersonal.photoUrl),
    },
    summary: asString(input.summary, fallback.summary),
    summaryShowTitle: asBool(input.summaryShowTitle, fallback.summaryShowTitle),
    experience: normalizeExperience(input.experience ?? fallback.experience),
    education: normalizeEducation(input.education ?? fallback.education),
    skills: normalizeSkills(input.skills ?? fallback.skills),
    projects: normalizeProjects(input.projects ?? fallback.projects),
    customSections: normalizeCustomSections(
      input.customSections ?? fallback.customSections,
    ),
  };
}

export function parseTemplate(value: unknown): TemplateType | undefined {
  return typeof value === "string" && isValidTemplateId(value)
    ? value
    : undefined;
}

export function isResumeEmpty(data: ResumeData) {
  return (
    !data.personalInfo.fullName.trim() &&
    !data.personalInfo.email.trim() &&
    !data.summary.trim() &&
    data.experience.length === 0 &&
    data.education.length === 0 &&
    data.skills.length === 0 &&
    data.projects.length === 0
  );
}
