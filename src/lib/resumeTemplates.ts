import type { TemplateType } from "@/types/resume";

export const RESUME_TEMPLATE_OPTIONS: {
  id: TemplateType;
  name: string;
}[] = [
  { id: "standard", name: "ATS Classic" },
  { id: "modern", name: "Modern Streamline" },
  { id: "executive", name: "Executive" },
  { id: "compact", name: "Compact Pro" },
  { id: "minimal", name: "Minimal Air" },
  { id: "signature", name: "Signature" },
  { id: "sidebar", name: "Sidebar Focus" },
  { id: "timeline", name: "Career Timeline" },
  { id: "creative", name: "Creative Pulse" },
];

export const isValidTemplateId = (id: unknown): id is TemplateType =>
  RESUME_TEMPLATE_OPTIONS.some((t) => t.id === id);
