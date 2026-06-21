"use client";

import { track } from "@vercel/analytics";
import type { TemplateType } from "@/types/resume";

type AnalyticsProperties = Record<string, string | number | boolean>;

const sendEvent = (name: string, properties?: AnalyticsProperties) => {
  track(name, properties);
};

export const analyticsEvents = {
  resetResume: () => sendEvent("resume_reset"),
  mobilePreviewOpened: (step: number) =>
    sendEvent("mobile_preview_opened", { step }),
  stepCompleted: (step: number, stepName: string) =>
    sendEvent("builder_step_completed", { step, stepName }),
  stepBack: (fromStep: number, toStep: number) =>
    sendEvent("builder_step_back", { fromStep, toStep }),
  itemAdded: (type: string, step: number) =>
    sendEvent("builder_item_added", { type, step }),
  itemRemoved: (type: string, step: number) =>
    sendEvent("builder_item_removed", { type, step }),
  templateSelected: (template: TemplateType, source: "templates_page" | "review_step") =>
    sendEvent("template_selected", { template, source }),
  templatesContinue: (template: TemplateType) =>
    sendEvent("templates_continue_to_editor", { template }),
  pdfDownloadClicked: (template: TemplateType) =>
    sendEvent("pdf_download_clicked", { template }),
};
