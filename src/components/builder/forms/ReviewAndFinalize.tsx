"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, CheckCircle, LayoutTemplate } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DynamicPDF } from "../pdf/DynamicPDF";
import { TemplateType } from "@/types/resume";
import { cn } from "@/lib/utils";

const TEMPLATES: { id: TemplateType; name: string; desc: string }[] = [
  { id: "classic", name: "Classic Pro", desc: "Traditional, clean corporate look with subtle red lines" },
  { id: "minimal", name: "Modern Minimal", desc: "Lots of white space, contemporary and sleek" },
  { id: "executive", name: "Executive Edge", desc: "Bold name header, strong dividers" },
  { id: "compact", name: "Compact Clean", desc: "Tight spacing, perfect for 1-page" },
  { id: "professional", name: "Professional Focus", desc: "Skills highlighted at top" },
  { id: "balanced", name: "Balanced Standard", desc: "Versatile layout for any industry" },
];

export function ReviewAndFinalize() {
  const { data, template, setTemplate, themeColor, prevStep } = useResumeStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // The unified dynamic engine translates the active template and hex colors exactly to the React PDF compiler natively
  const getPDFDocument = () => {
    return <DynamicPDF data={data} templateId={template} themeColor={themeColor} />;
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Choose Your Resume Style</h2>
        <p className="text-slate-500 mt-2">Pick the template that best fits your industry and professional style.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {TEMPLATES.map((tpl) => (
          <Card 
            key={tpl.id} 
            className={cn(
              "cursor-pointer transition-all border-2 overflow-hidden group",
              template === tpl.id 
                ? "border-primary shadow-lg shadow-primary/20 bg-primary/5" 
                : "border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-md glass-card bg-white/70 dark:bg-slate-900/70"
            )}
            onClick={() => setTemplate(tpl.id)}
          >
            <div className="h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4">
              {/* Thumbnail Representation */}
              <div className="w-24 h-32 bg-white shadow-sm border rounded-sm p-2 flex flex-col gap-1 transition-transform group-hover:scale-105">
                <div className="h-2 w-full bg-slate-300 rounded-full" />
                <div className="h-1 w-1/2 bg-primary rounded-full mb-2" />
                <div className="h-1 w-full bg-slate-200 rounded-full" />
                <div className="h-1 w-full bg-slate-200 rounded-full" />
                <div className="h-1 w-3/4 bg-slate-200 rounded-full" />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{tpl.name}</h3>
                {template === tpl.id && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-xs text-slate-500">{tpl.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="glass-card bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-white/40 shadow-sm flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            Ready to download?
          </h3>
        </div>
        
        <div className="flex w-full flex-col gap-3">
          <Button variant="outline" onClick={prevStep} className="w-full h-12 rounded-full">
            Back to Edit
          </Button>
          
          {isClient && (
            <PDFDownloadLink
              document={getPDFDocument()}
              fileName={`${data.personalInfo.fullName.replace(/\s+/g, "_") || "Resume"}_Resume.pdf`}
              className="w-full block"
            >
              {({ loading }) => (
                <Button className="w-full shadow-lg hover:shadow-xl transition-all h-12 text-lg rounded-full" disabled={loading}>
                  {loading ? "Generating PDF..." : (
                    <>
                      <Download className="w-5 h-5 mr-2" /> Download PDF
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
