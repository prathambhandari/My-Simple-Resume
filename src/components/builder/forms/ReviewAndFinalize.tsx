"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Check, DownloadSimple as Download } from "@phosphor-icons/react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DynamicPDF } from "../pdf/DynamicPDF";
import { DynamicTemplate } from "../templates/DynamicTemplate";
import { RESUME_TEMPLATE_OPTIONS } from "@/lib/resumeTemplates";
import { analyticsEvents } from "@/lib/analytics";

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
        <h2 className="font-heading mt-2 text-2xl font-medium tracking-[-0.06em] text-foreground">
          Choose resume design
        </h2>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-6">
        {RESUME_TEMPLATE_OPTIONS.map((tpl) => (
          <button
            type="button"
            key={tpl.id}
            className="group relative w-full cursor-pointer overflow-hidden rounded-md bg-transparent p-0 text-left transition-all"
            onClick={() => {
              analyticsEvents.templateSelected(tpl.id, "review_step");
              setTemplate(tpl.id);
            }}
            aria-label={`Select ${tpl.name} template`}
          >
            <div
              className="relative aspect-816/1056 w-full overflow-hidden rounded-md bg-white"
              style={{ containerType: "inline-size" }}
            >
              <div
                className="absolute left-0 top-0 origin-top-left transition-transform duration-300"
                style={{
                  width: "816px",
                  height: "1056px",
                  transform: "scale(calc(100cqi / 816px))",
                }}
              >
                <DynamicTemplate templateId={tpl.id} />
              </div>
              {template === tpl.id && (
                <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-green-600 text-white shadow-md">
                  <Check className="h-4 w-4 text-white" weight="bold" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 border-none bg-transparent p-0">
        <div className="text-center">
          <h3 className="font-heading flex items-center justify-center gap-2 text-xl font-medium tracking-[-0.04em] text-foreground">
            Ready to download?
          </h3>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              analyticsEvents.stepBack(6, 5);
              prevStep();
            }}
            className="h-11 w-full"
          >
            Back to Edit
          </Button>

          {isClient && (
            <PDFDownloadLink
              document={getPDFDocument()}
              fileName={`${data.personalInfo.fullName.replace(/\s+/g, "_") || "Resume"}_Resume.pdf`}
              className="block w-full"
            >
              {({ loading }) => (
                <Button
                  className="h-11 w-full text-base"
                  disabled={loading}
                  onClick={() => analyticsEvents.pdfDownloadClicked(template)}
                >
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
