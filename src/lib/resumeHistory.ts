import { ResumeData, TemplateType } from "@/types/resume";

export type ResumeVersion = {
  id: string;
  at: number;
  label: string;
  data: ResumeData;
  template: TemplateType;
};

export const MAX_RESUME_VERSIONS = 20;

export function cloneResume(data: ResumeData): ResumeData {
  return JSON.parse(JSON.stringify(data)) as ResumeData;
}

export function resumesEqual(a: ResumeData, b: ResumeData) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatVersionTime(at: number) {
  const delta = Date.now() - at;
  if (delta < 15_000) return "Just now";
  if (delta < 60_000) return `${Math.floor(delta / 1000)}s ago`;
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m ago`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h ago`;
  return new Date(at).toLocaleString();
}
