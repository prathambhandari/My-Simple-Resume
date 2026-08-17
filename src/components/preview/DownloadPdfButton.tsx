"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import { isResumeEmpty } from "@/lib/normalizeResume";
import { analyticsEvents } from "@/lib/analytics";
import { toast } from "sonner";

export function DownloadPdfButton() {
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);
  const themeColor = useResumeStore((state) => state.themeColor);
  const [loading, setLoading] = useState(false);

  const onDownload = async () => {
    if (isResumeEmpty(data) || loading) return;
    setLoading(true);
    try {
      const [{ pdf }, { DynamicPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/builder/pdf/DynamicPDF"),
      ]);
      const blob = await pdf(
        <DynamicPDF data={data} templateId={template} themeColor={themeColor} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = data.personalInfo.fullName.replace(/\s+/g, "_") || "Resume";
      link.href = url;
      link.download = `${name}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      analyticsEvents.pdfDownloadClicked(template);
    } catch {
      toast.error("Could not generate the PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      onClick={onDownload}
      disabled={loading || isResumeEmpty(data)}
    >
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Download />
      )}
      Download
    </Button>
  );
}
