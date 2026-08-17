export type ResumeLink = {
  id: string;
  title: string;
  url: string;
};

export type PersonalInfo = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  linkDisplay: "title" | "url" | "both";
  links: ResumeLink[];
  photoUrl: string;
};

export type WorkExperience = {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
};

export type Skill = {
  id: string;
  name: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  url?: string;
};

export type CustomItem = {
  id: string;
  type: "paragraph" | "bullets" | "progress";
  name: string;
  description?: string;
  value?: number;
};

export type CustomSection = {
  id: string;
  title: string;
  items: CustomItem[];
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  summaryShowTitle?: boolean;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  customSections?: CustomSection[];
};

/** Resume layout variants (preview + PDF). All stay single-column with plain-text contact for ATS safety. */
export type TemplateType =
  | "standard"
  | "modern"
  | "executive"
  | "compact"
  | "minimal"
  | "signature"
  | "sidebar"
  | "timeline"
  | "creative";

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
