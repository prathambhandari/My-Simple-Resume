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

export function templateFromUserText(text: string): TemplateType | undefined {
  const lower = text.toLowerCase();
  const aliases: Array<[RegExp, TemplateType]> = [
    [/\bminimal\b/, "minimal"],
    [/\bmodern\b/, "modern"],
    [/\bexecutive\b/, "executive"],
    [/\bcompact\b/, "compact"],
    [/\bsignature\b/, "signature"],
    [/\bsidebar\b/, "sidebar"],
    [/\btimeline\b/, "timeline"],
    [/\bcreative\b/, "creative"],
    [/\bclassic\b|\bstandard\b|\bats\b/, "standard"],
  ];
  for (const [pattern, id] of aliases) {
    if (pattern.test(lower)) return id;
  }
  return undefined;
}
