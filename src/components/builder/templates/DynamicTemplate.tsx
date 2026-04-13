"use client";

import { useResumeStore } from "@/store/useResumeStore";
import { Mail, Phone, MapPin, Globe, Link } from "lucide-react";
import { TemplateType } from "@/types/resume";

export function DynamicTemplate({ templateId, showPageBreaks = false }: { templateId: TemplateType, showPageBreaks?: boolean }) {
  const { data } = useResumeStore();
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;

  // Configuration objects for different templates
  const styles = {
    classic: {
      container: "font-sans",
      header: "border-b-2 border-primary pb-6 mb-6 text-left",
      name: "text-4xl font-bold text-slate-900 uppercase mb-1",
      sectionTitle: "text-lg font-bold text-slate-900 uppercase mb-3",
      contactIcon: "text-primary",
      jobTitle: "text-xl text-primary font-medium",
    },
    minimal: {
      container: "font-sans font-light",
      header: "pb-8 mb-8 text-center",
      name: "text-5xl font-light tracking-wide text-slate-800 mb-2",
      sectionTitle: "text-md font-medium tracking-widest text-slate-400 uppercase mb-4",
      contactIcon: "text-slate-400",
      jobTitle: "text-lg text-slate-500 font-light tracking-wider",
    },
    executive: {
      container: "font-serif",
      header: "border-b-4 border-slate-900 pb-4 mb-6 text-center bg-slate-50 p-6 rounded-sm",
      name: "text-4xl font-extrabold text-slate-900 tracking-tight mb-2",
      sectionTitle: "text-xl font-bold text-slate-900 mb-3 border-b-2 border-slate-200 pb-1",
      contactIcon: "text-slate-600",
      jobTitle: "text-xl text-slate-700 font-semibold",
    },
    compact: {
      container: "font-sans text-sm",
      header: "border-b border-primary pb-2 mb-3 text-left",
      name: "text-2xl font-bold text-slate-900 mb-1",
      sectionTitle: "text-md font-bold text-slate-800 uppercase mb-2",
      contactIcon: "text-primary",
      jobTitle: "text-md text-primary font-medium",
    },
    professional: {
      container: "font-sans",
      header: "flex justify-between items-end border-b-2 border-slate-300 pb-6 mb-6",
      name: "text-3xl font-bold text-slate-800 mb-1",
      sectionTitle: "text-lg font-bold text-primary mb-3 bg-primary/5 p-1 px-2 rounded-sm",
      contactIcon: "text-slate-400",
      jobTitle: "text-lg text-slate-600 font-medium",
    },
    balanced: {
      container: "font-sans",
      header: "bg-slate-800 text-white p-6 -mx-8 -mt-8 mb-6 rounded-b-[2rem]",
      name: "text-4xl font-bold text-white mb-1",
      sectionTitle: "text-lg font-bold text-slate-800 mb-3 flex items-center gap-2",
      contactIcon: "text-slate-300",
      jobTitle: "text-xl text-slate-200 font-medium",
    }
  }[templateId];

  // Logic to reorder sections if template requires it
  const isProfessional = templateId === "professional";

  const renderSkills = () => {
    if (skills.length === 0) return null;
    return (
      <section className="mb-6">
        <h2 className={styles.sectionTitle}>
          {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span 
              key={skill.id} 
              className={`text-sm px-2 py-1 ${templateId === "minimal" ? "border-b border-slate-200" : "bg-slate-100 rounded text-slate-700"}`}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={`relative bg-white text-slate-800 p-8 min-h-[1056px] shadow-sm w-full max-w-[816px] mx-auto scale-[0.8] origin-top md:scale-100 ${styles.container}`}>
      {/* Header */}
      <header className={styles.header}>
        <div className={templateId === "professional" ? "flex-1" : ""}>
          <h1 className={styles.name}>{personalInfo.fullName || "Your Name"}</h1>
          <p className={styles.jobTitle}>{personalInfo.jobTitle || "Your Job Title"}</p>
        </div>
        
        <div className={`flex flex-wrap gap-x-4 gap-y-2 text-sm max-w-lg ${templateId === "balanced" ? "text-slate-200 mt-4" : "text-slate-600"} ${templateId === "minimal" || templateId === "executive" ? "justify-center mt-3" : "mt-2"}`}>
          {personalInfo.email && (
             <div className="flex items-center gap-1">
               <Mail className={`w-4 h-4 ${styles.contactIcon}`} />
               <span>{personalInfo.email}</span>
             </div>
          )}
          {personalInfo.phone && (
             <div className="flex items-center gap-1">
               <Phone className={`w-4 h-4 ${styles.contactIcon}`} />
               <span>{personalInfo.phone}</span>
             </div>
          )}
          {personalInfo.location && (
             <div className="flex items-center gap-1">
               <MapPin className={`w-4 h-4 ${styles.contactIcon}`} />
               <span>{personalInfo.location}</span>
             </div>
          )}
          {personalInfo.website && (
             <div className="flex items-center gap-1">
               <Globe className={`w-4 h-4 ${styles.contactIcon}`} />
               <span>{personalInfo.website}</span>
             </div>
          )}
          {personalInfo.linkedin && (
             <div className="flex items-center gap-1">
               <Link className={`w-4 h-4 ${styles.contactIcon}`} />
               <span>{personalInfo.linkedin}</span>
             </div>
          )}
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className={styles.sectionTitle}>
            {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
            Professional Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </section>
      )}

      {/* Skills at Top for Professional */}
      {isProfessional && renderSkills()}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className={styles.sectionTitle}>
            {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className={templateId === "minimal" ? "border-l-2 border-slate-200 pl-4 py-1" : ""}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800">{exp.jobTitle}</h3>
                  <span className={`text-sm font-medium ${templateId === "minimal" ? "text-slate-400" : "text-primary"}`}>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className={`text-sm font-semibold ${templateId === "executive" ? "text-slate-900" : "text-slate-700"}`}>
                    {exp.company}
                  </span>
                  <span className="text-sm text-slate-500">{exp.location}</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className={styles.sectionTitle}>
            {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className={templateId === "minimal" ? "border-l-2 border-slate-200 pl-4 py-1" : ""}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800">{edu.degree}</h3>
                  <span className={`text-sm font-medium ${templateId === "minimal" ? "text-slate-400" : "text-primary"}`}>
                    {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className={`text-sm font-semibold ${templateId === "executive" ? "text-slate-900" : "text-slate-700"}`}>
                    {edu.school}
                  </span>
                  <span className="text-sm text-slate-500">{edu.location}</span>
                </div>
                {edu.gpa && <p className="text-sm text-slate-600 mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className={styles.sectionTitle}>
            {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id} className={templateId === "minimal" ? "border-l-2 border-slate-200 pl-4 py-1" : ""}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-800">{proj.name}</h3>
                  {proj.url && <span className="text-sm text-slate-500">{proj.url}</span>}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {customSections && customSections.length > 0 && customSections.map((section) => (
        <section key={section.id} className="mb-6">
          <h2 className={styles.sectionTitle}>
            {templateId === "balanced" && <div className="w-2 h-6 bg-primary rounded-sm" />}
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.items.map((item: any) => (
              <div key={item.id} className={templateId === "minimal" ? "border-l-2 border-slate-200 pl-4 py-1" : ""}>
                {(!item.type || item.type === "paragraph") && (
                  <>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
                    )}
                  </>
                )}
                
                {item.type === "bullets" && (
                  <>
                    <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
                    {item.description && (
                      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                        {item.description.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                          <li key={i} className="pl-1 leading-relaxed">
                            <span className="-ml-1">{bullet.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}

                {item.type === "progress" && (
                  <div className="flex flex-col gap-1 w-full mt-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-slate-600 font-medium">{item.value || 0}%</span>
                    </div>
                    <div className="h-1.5 w-full max-w-sm bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${item.value || 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Skills Output for other templates */}
      {!isProfessional && renderSkills()}

      {/* Suggested Page Breaks Overlay */}
      {showPageBreaks && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full z-50 rounded-b-sm">
           {[...Array(5)].map((_, i) => i > 0 && (
               <div 
                 key={i} 
                 className="absolute w-[816px] border-t-[1.5px] border-dashed border-slate-300 left-0 flex justify-center opacity-80"
                 style={{ top: `${i * 1056}px` }}
               >
                 <span className="bg-white text-slate-400 text-[10px] font-bold px-3 py-1 rounded-b shadow-sm uppercase tracking-widest border border-t-0 border-slate-200 pointer-events-auto">
                   Suggested Page {i + 1}
                 </span>
               </div>
           ))}
        </div>
      )}
    </div>
  );
}
