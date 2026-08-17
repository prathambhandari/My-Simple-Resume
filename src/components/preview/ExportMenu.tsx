"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/store/useResumeStore";
import { isResumeEmpty } from "@/lib/normalizeResume";
import { analyticsEvents } from "@/lib/analytics";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const itemClass =
  "block w-full rounded-md bg-transparent px-3 py-2 text-left text-xs text-foreground hover:bg-white/10 disabled:opacity-40";

export function ExportMenu() {
  const data = useResumeStore((state) => state.data);
  const template = useResumeStore((state) => state.template);
  const themeColor = useResumeStore((state) => state.themeColor);
  const coverLetter = useResumeStore((state) => state.coverLetter);
  const documents = useResumeStore((state) => state.documents);
  const importBackup = useResumeStore((state) => state.importBackup);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const empty = isResumeEmpty(data);
  const baseName = data.personalInfo.fullName.replace(/\s+/g, "_") || "Resume";

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const run = async (key: string, work: () => Promise<void>) => {
    setLoading(key);
    try {
      await work();
      setOpen(false);
    } catch {
      toast.error("Could not export that file.");
    } finally {
      setLoading(null);
    }
  };

  const pdfResume = () =>
    run("pdf", async () => {
      const [{ pdf }, { DynamicPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/builder/pdf/DynamicPDF"),
      ]);
      const blob = await pdf(
        <DynamicPDF data={data} templateId={template} themeColor={themeColor} />,
      ).toBlob();
      downloadBlob(blob, `${baseName}.pdf`);
      analyticsEvents.pdfDownloadClicked(template);
    });

  const pdfCover = () =>
    run("cover", async () => {
      if (!coverLetter.trim()) {
        toast.error("Write a cover letter in chat first.");
        return;
      }
      const [{ pdf }, { CoverLetterPDF }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/builder/pdf/CoverLetterPDF"),
      ]);
      const blob = await pdf(
        <CoverLetterPDF name={data.personalInfo.fullName} body={coverLetter} />,
      ).toBlob();
      downloadBlob(blob, `${baseName}_Cover_Letter.pdf`);
    });

  const docxResume = () =>
    run("docx", async () => {
      const { resumeToDocxBlob } = await import("@/lib/exportDocx");
      const blob = await resumeToDocxBlob(data);
      downloadBlob(blob, `${baseName}.docx`);
    });

  const backup = () => {
    const blob = new Blob([JSON.stringify({ documents }, null, 2)], {
      type: "application/json",
    });
    downloadBlob(blob, "my-simple-resume-backup.json");
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        size="sm"
        disabled={Boolean(loading)}
        onClick={() => setOpen((value) => !value)}
      >
        {loading ? <Loader2 className="animate-spin" /> : <FileDown />}
        <span className="hidden md:inline">Export</span>
        <ChevronDown className="hidden sm:block" />
      </Button>
      {open ? (
        <div className="menu-panel absolute right-0 top-[calc(100%+6px)] z-50 w-48 max-w-[calc(100vw-1.25rem)] overflow-hidden py-1">
          <button type="button" className={itemClass} disabled={empty} onClick={() => void pdfResume()}>
            Resume PDF
          </button>
          <button type="button" className={itemClass} disabled={empty} onClick={() => void docxResume()}>
            Resume Word
          </button>
          <button type="button" className={itemClass} onClick={() => void pdfCover()}>
            Cover letter PDF
          </button>
          <button type="button" className={itemClass} onClick={backup}>
            Backup JSON
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => fileRef.current?.click()}
          >
            Import backup
          </button>
        </div>
      ) : null}
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            const parsed = JSON.parse(await file.text());
            const error = importBackup(parsed);
            if (error) toast.error(error);
            else toast.success("Backup imported.");
            setOpen(false);
          } catch {
            toast.error("That file is not a valid backup.");
          }
        }}
      />
    </div>
  );
}
