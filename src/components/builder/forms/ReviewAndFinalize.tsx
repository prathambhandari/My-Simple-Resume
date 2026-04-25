"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Check } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DynamicPDF } from "../pdf/DynamicPDF";
import { DynamicTemplate } from "../templates/DynamicTemplate";
import { RESUME_TEMPLATE_OPTIONS } from "@/lib/resumeTemplates";
import { cn } from "@/lib/utils";

export function ReviewAndFinalize() {
  const { data, template, setTemplate, themeColor, prevStep } =
    useResumeStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getPDFDocument = () => {
    return (
      <DynamicPDF data={data} templateId={template} themeColor={themeColor} />
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <span className="text-mono-label text-muted-foreground">Step 6</span>
        <h2 className="font-heading mt-2 text-3xl font-medium tracking-[-0.06em] text-foreground">
          Choose resume design
        </h2>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {RESUME_TEMPLATE_OPTIONS.map((tpl) => (
          <Card
            key={tpl.id}
            className={cn(
              "group cursor-pointer overflow-hidden rounded-xl border-2 bg-card transition-all",
              template === tpl.id
                ? "border-[#0099ff] shadow-framer-float ring-2 ring-[rgba(0,153,255,0.25)]"
                : "border-white/[0.08] hover:border-[#0099ff]/40 hover:shadow-framer-float",
            )}
            onClick={() => setTemplate(tpl.id)}
          >
            <div className="relative flex h-40 items-start justify-center overflow-hidden bg-muted p-0 pt-4 pointer-events-none select-none after:absolute after:inset-0 after:bg-linear-to-b after:from-transparent after:via-transparent after:to-muted">
              <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="origin-top scale-[0.18] w-[816px] drop-shadow-md">
                  <DynamicTemplate templateId={tpl.id} />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-heading font-medium tracking-[-0.04em] text-foreground">
                  {tpl.name}
                </h3>
                {template === tpl.id && (
                  <div className="flex size-6 shrink-0 animate-in zoom-in duration-300 items-center justify-center border border-border bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" strokeWidth={4} />
                  </div>
                )}
              </div>
              <p className="text-xs font-[330] leading-snug tracking-[-0.05px] text-muted-foreground">
                {tpl.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 border-none bg-transparent p-0">
        <div className="text-center">
          <h3 className="font-heading flex items-center justify-center gap-2 text-xl font-medium tracking-[-0.04em] text-foreground">
            Ready to download?
          </h3>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button variant="outline" onClick={prevStep} className="h-11 w-full">
            Back to Edit
          </Button>

          {isClient && (
            <PDFDownloadLink
              document={getPDFDocument()}
              fileName={`${data.personalInfo.fullName.replace(/\s+/g, "_") || "Resume"}_Resume.pdf`}
              className="block w-full"
            >
              {({ loading }) => (
                <Button className="h-11 w-full text-base" disabled={loading}>
                  {loading ? (
                    "Generating PDF..."
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" /> Download PDF
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>
    </div>
  );
}
