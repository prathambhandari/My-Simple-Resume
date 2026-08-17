import { ChatMessage } from "@/types/chat";
import { ResumeData, TemplateType } from "@/types/resume";
import { ResumeVersion } from "@/lib/resumeHistory";

export type PreviewMode = "resume" | "cover";

export type ResumeDocument = {
  id: string;
  name: string;
  data: ResumeData;
  template: TemplateType;
  themeColor: string;
  messages: ChatMessage[];
  past: ResumeVersion[];
  future: ResumeVersion[];
  coverLetter: string;
  updatedAt: number;
};

export const MAX_DOCUMENTS = 8;
