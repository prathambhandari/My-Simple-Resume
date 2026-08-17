"use client";

import { track } from "@vercel/analytics";
import type { TemplateType } from "@/types/resume";

const sendEvent = (
  name: string,
  properties?: Record<string, string | number | boolean>,
) => {
  track(name, properties);
};

export const analyticsEvents = {
  resetResume: () => sendEvent("resume_reset"),
  pdfDownloadClicked: (template: TemplateType) =>
    sendEvent("pdf_download_clicked", { template }),
};
