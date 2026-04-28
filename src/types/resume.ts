import { z } from "zod";

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  jobTitle: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address (e.g. you@example.com)"),
  phone: z
    .string()
    .regex(
      /^\+\d{1,4}\s\d{6,15}$/,
      "Enter a valid phone number (6-15 digits)",
    )
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date")
    .optional()
    .or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  linkDisplay: z.enum(["title", "url", "both"]).optional().default("both"),
  links: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Link title is required").max(40),
        url: z.string().url("Enter a valid URL (https://...)").max(300),
      }),
    )
    .optional()
    .default([]),
  photoUrl: z.string().optional(),
});

export const professionalSummarySchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
});

export const workExperienceSchema = z.object({
  id: z.string(),
  jobTitle: z.string().min(2, "Job title is required"),
  company: z.string().min(2, "Company is required"),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(10, "Description is required"),
});

export const educationSchema = z.object({
  id: z.string(),
  degree: z.string().min(2, "Degree is required"),
  school: z.string().min(2, "School name is required"),
  location: z.string().min(2, "Location is required"),
  startDate: z.string().min(2, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  gpa: z.string().optional(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(10, "Description is required"),
  url: z.string().url().optional().or(z.literal("")),
});

export const customItemSchema = z.object({
  id: z.string(),
  type: z.enum(["paragraph", "bullets", "progress"]).default("paragraph"),
  name: z.string().min(1, "Title/Label is required"),
  description: z.string().optional(),
  value: z.coerce.number().min(0).max(100).optional(),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Section title is required"),
  items: z.array(customItemSchema),
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  summary: professionalSummarySchema.shape.summary,
  summaryShowTitle: z.boolean().optional().default(false),
  experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
  projects: z.array(projectSchema),
  customSections: z.array(customSectionSchema).optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type ProfessionalSummary = z.infer<typeof professionalSummarySchema>;
export type WorkExperience = z.infer<typeof workExperienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type CustomItem = z.infer<typeof customItemSchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;

/** Resume layout variants (preview + PDF). All stay single-column with plain-text contact for ATS safety. */
export type TemplateType =
  | "standard"
  | "modern"
  | "executive"
  | "compact"
  | "minimal"
  | "signature";

export const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    linkDisplay: "both",
    links: [],
    photoUrl: "",
  },
  summary: "",
  summaryShowTitle: false,
  experience: [],
  education: [],
  skills: [],
  projects: [],
  customSections: [],
};
