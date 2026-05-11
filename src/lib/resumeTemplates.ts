import type { TemplateType } from "@/types/resume";

export const RESUME_TEMPLATE_OPTIONS: {
  id: TemplateType;
  name: string;
  description: string;
}[] = [
  {
    id: "standard",
    name: "ATS Classic",
    description:
      "Neutral typography and plain contact line—maximum compatibility with applicant tracking systems.",
  },
  {
    id: "modern",
    name: "Modern Streamline",
    description:
      "Neutral editorial style: semibold headline, airy spacing, soft gray rules—no accent bars.",
  },
  {
    id: "executive",
    name: "Executive",
    description:
      "Traditional serif tone and strong dividers suited to senior roles and conservative industries.",
  },
  {
    id: "compact",
    name: "Compact Pro",
    description:
      "Tighter spacing and smaller type to fit more on one page without tables or graphics.",
  },
  {
    id: "minimal",
    name: "Minimal Air",
    description:
      "Centered header, generous whitespace, and light weights for a calm, editorial look.",
  },
  {
    id: "signature",
    name: "Signature",
    description:
      "Bold header band with high contrast; linear content order is preserved for ATS parsing.",
  },
  {
    id: "sidebar",
    name: "Sidebar Focus",
    description:
      "Two-column design with a dedicated profile rail for contact and skills, ideal for visual scanning.",
  },
  {
    id: "timeline",
    name: "Career Timeline",
    description:
      "Vertical timeline treatment for experience and education with clear chronology and compact rhythm.",
  },
  {
    id: "creative",
    name: "Creative Pulse",
    description:
      "Design-forward look with accent section labels, pill skills, and stronger visual hierarchy.",
  },
];

export const isValidTemplateId = (id: unknown): id is TemplateType =>
  RESUME_TEMPLATE_OPTIONS.some((t) => t.id === id);
