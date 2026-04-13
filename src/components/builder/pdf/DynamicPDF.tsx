import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData, TemplateType } from "@/types/resume";

export function DynamicPDF({ data, templateId, themeColor }: { data: ResumeData; templateId: TemplateType; themeColor: string }) {
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;

  // Base styles that are shared across all templates
  const base = StyleSheet.create({
    page: { padding: 30, lineHeight: 1.5, color: "#1e293b", fontFamily: "Helvetica" },
    contactRow: { flexDirection: "row", flexWrap: "wrap", fontSize: 10, color: "#475569" },
    section: { marginBottom: 15 },
    itemTitleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
    itemSubRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    itemTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#1e293b" },
    itemDates: { fontSize: 10, fontFamily: "Helvetica-Bold" },
    itemSubtitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#334155" },
    itemLocation: { fontSize: 10, color: "#64748b" },
    description: { fontSize: 10, color: "#334155", marginBottom: 8 },
    skillsArray: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
    skillPill: { fontSize: 10, padding: "2 6", backgroundColor: "#f1f5f9", color: "#334155", borderRadius: 4 },
  });

  // Template-specific style overrides
  const templates = {
    classic: StyleSheet.create({
      page: { fontFamily: "Helvetica" },
      header: { marginBottom: 20, borderBottomWidth: 2, paddingBottom: 10, borderBottomColor: themeColor },
      name: { fontSize: 24, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 4, color: "#0f172a" },
      jobTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 8, color: themeColor },
      contactRow: { gap: 10 },
      sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#0f172a", marginBottom: 5 },
    }),
    minimal: StyleSheet.create({
      page: { padding: 40, fontFamily: "Helvetica" }, // Helvetica is close enough to font-light if standard
      header: { marginBottom: 25, textAlign: "center" },
      name: { fontSize: 28, color: "#1e293b", marginBottom: 6 },
      jobTitle: { fontSize: 13, color: "#64748b", marginBottom: 12 },
      contactRow: { justifyContent: "center", gap: 12 },
      sectionTitle: { fontSize: 11, textTransform: "uppercase", color: "#94a3b8", marginBottom: 8, textAlign: "center" },
    }),
    executive: StyleSheet.create({
      page: { fontFamily: "Times-Roman" },
      header: { backgroundColor: "#f8fafc", padding: 20, marginBottom: 20, textAlign: "center", borderTopWidth: 4, borderBottomWidth: 1, borderColor: "#0f172a" },
      name: { fontSize: 26, fontFamily: "Times-Bold", color: "#0f172a", marginBottom: 4 },
      jobTitle: { fontSize: 14, fontFamily: "Times-Bold", color: "#334155", marginBottom: 8 },
      contactRow: { justifyContent: "center", gap: 10 },
      sectionTitle: { fontSize: 14, fontFamily: "Times-Bold", color: "#0f172a", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 2 },
    }),
    compact: StyleSheet.create({
      page: { padding: 20, fontSize: 10, lineHeight: 1.3 },
      header: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: themeColor, paddingBottom: 6 },
      name: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 2 },
      jobTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: themeColor, marginBottom: 4 },
      contactRow: { gap: 8, fontSize: 9 },
      section: { marginBottom: 10 },
      sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#0f172a", marginBottom: 4 },
      itemTitle: { fontSize: 10 },
      description: { fontSize: 9, marginBottom: 6 },
    }),
    professional: StyleSheet.create({
      page: { paddingTop: 35 },
      header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, borderBottomWidth: 2, borderBottomColor: "#cbd5e1", paddingBottom: 15 },
      headerLeft: { flex: 1 },
      headerRight: { flex: 1, alignItems: "flex-end" },
      name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#1e293b", marginBottom: 4 },
      jobTitle: { fontSize: 14, color: "#475569" },
      contactRow: { flexDirection: "column", alignItems: "flex-end", gap: 2 },
      sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: themeColor, marginBottom: 6, backgroundColor: themeColor + "15", padding: "4" },
    }),
    balanced: StyleSheet.create({
      page: { padding: 30 },
      header: { backgroundColor: "#1e293b", padding: "30 30 20 30", margin: "-30 -30 20 -30", color: "#ffffff" },
      name: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#ffffff", marginBottom: 6 },
      jobTitle: { fontSize: 14, color: "#cbd5e1", marginBottom: 12 },
      contactRow: { gap: 10, color: "#cbd5e1" },
      sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
      sectionTitleBlock: { width: 6, height: 14, backgroundColor: themeColor, marginRight: 6 },
      sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1e293b" },
    }),
  };

  const tplStyles = templates[templateId] as any;

  const isProfessional = templateId === "professional";
  const isBalanced = templateId === "balanced";

  const renderSectionTitle = (title: string) => {
    if (isBalanced) {
      return (
        <View style={tplStyles.sectionTitleRow}>
          <View style={tplStyles.sectionTitleBlock} />
          <Text style={tplStyles.sectionTitle}>{title}</Text>
        </View>
      );
    }
    return <Text style={tplStyles.sectionTitle}>{title}</Text>;
  };

  const renderSkills = () => {
    if (skills.length === 0) return null;
    return (
      <View style={tplStyles.section || base.section}>
        {renderSectionTitle("Skills")}
        <View style={base.skillsArray}>
          {skills.map((skill) => (
            <Text key={skill.id} style={templateId === "minimal" ? { fontSize: 10, padding: 2, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" } : base.skillPill}>
              {skill.name}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={[base.page, tplStyles.page]}>
        
        {/* Header section variations */}
        {isProfessional ? (
          <View style={tplStyles.header}>
            <View style={tplStyles.headerLeft}>
              <Text style={tplStyles.name}>{personalInfo.fullName || "Your Name"}</Text>
              <Text style={tplStyles.jobTitle}>{personalInfo.jobTitle || "Your Job Title"}</Text>
            </View>
            <View style={tplStyles.headerRight}>
               {personalInfo.email && <Text style={base.contactRow}>{personalInfo.email}</Text>}
               {personalInfo.phone && <Text style={base.contactRow}>{personalInfo.phone}</Text>}
               {personalInfo.location && <Text style={base.contactRow}>{personalInfo.location}</Text>}
               {personalInfo.website && <Text style={base.contactRow}>{personalInfo.website}</Text>}
               {personalInfo.linkedin && <Text style={base.contactRow}>{personalInfo.linkedin}</Text>}
            </View>
          </View>
        ) : (
          <View style={tplStyles.header}>
            <Text style={tplStyles.name}>{personalInfo.fullName || "Your Name"}</Text>
            <Text style={tplStyles.jobTitle}>{personalInfo.jobTitle || "Your Job Title"}</Text>
            <View style={[base.contactRow, tplStyles.contactRow]}>
              {personalInfo.email && <Text>{personalInfo.email}</Text>}
              {personalInfo.phone && <Text>{personalInfo.phone}</Text>}
              {personalInfo.location && <Text>{personalInfo.location}</Text>}
              {personalInfo.website && <Text>{personalInfo.website}</Text>}
              {personalInfo.linkedin && <Text>{personalInfo.linkedin}</Text>}
            </View>
          </View>
        )}

        {/* Summary */}
        {summary && (
          <View style={tplStyles.section || base.section}>
            {renderSectionTitle("Professional Summary")}
            <Text style={[base.description, tplStyles.description]}>{summary}</Text>
          </View>
        )}

        {/* Skills explicitly bumped for professional */}
        {isProfessional && renderSkills()}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={tplStyles.section || base.section}>
            {renderSectionTitle("Experience")}
            {experience.map((exp) => (
              <View key={exp.id} style={templateId === "minimal" ? { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#e2e8f0", marginBottom: 8 } : { marginBottom: 8 }}>
                <View style={base.itemTitleRow}>
                  <Text style={[base.itemTitle, tplStyles.itemTitle]}>{exp.jobTitle}</Text>
                  <Text style={[base.itemDates, { color: templateId === "minimal" ? "#94a3b8" : themeColor }]}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</Text>
                </View>
                <View style={base.itemSubRow}>
                  <Text style={base.itemSubtitle}>{exp.company}</Text>
                  <Text style={base.itemLocation}>{exp.location}</Text>
                </View>
                <Text style={[base.description, tplStyles.description]}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={tplStyles.section || base.section}>
            {renderSectionTitle("Education")}
            {education.map((edu) => (
              <View key={edu.id} style={templateId === "minimal" ? { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#e2e8f0", marginBottom: 8 } : { marginBottom: 8 }}>
                <View style={base.itemTitleRow}>
                  <Text style={[base.itemTitle, tplStyles.itemTitle]}>{edu.degree}</Text>
                  <Text style={[base.itemDates, { color: templateId === "minimal" ? "#94a3b8" : themeColor }]}>{edu.startDate} - {edu.current ? "Present" : edu.endDate}</Text>
                </View>
                <View style={base.itemSubRow}>
                  <Text style={base.itemSubtitle}>{edu.school}</Text>
                  <Text style={base.itemLocation}>{edu.location}</Text>
                </View>
                {edu.gpa && <Text style={[base.description, tplStyles.description]}>GPA: {edu.gpa}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={tplStyles.section || base.section}>
            {renderSectionTitle("Projects")}
            {projects.map((proj) => (
              <View key={proj.id} style={templateId === "minimal" ? { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#e2e8f0", marginBottom: 8 } : { marginBottom: 8 }}>
                <View style={base.itemTitleRow}>
                  <Text style={[base.itemTitle, tplStyles.itemTitle]}>{proj.name}</Text>
                  {proj.url && <Text style={base.itemLocation}>{proj.url}</Text>}
                </View>
                <Text style={[base.description, tplStyles.description]}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Custom User-Defined Sections */}
        {customSections && customSections.length > 0 && customSections.map((section) => (
          <View key={section.id} style={tplStyles.section || base.section}>
            {renderSectionTitle(section.title)}
            {section.items.map((item: any) => (
              <View key={item.id} style={templateId === "minimal" ? { paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#e2e8f0", marginBottom: 6 } : { marginBottom: 6 }}>
                
                {(!item.type || item.type === "paragraph") && (
                  <>
                    <Text style={[base.itemTitle, tplStyles.itemTitle, { marginBottom: item.description ? 2 : 0 }]}>{item.name}</Text>
                    {item.description && (
                      <Text style={[base.description, tplStyles.description]}>{item.description}</Text>
                    )}
                  </>
                )}

                {item.type === "bullets" && (
                  <>
                    <Text style={[base.itemTitle, tplStyles.itemTitle, { marginBottom: 2 }]}>{item.name}</Text>
                    {item.description && (
                      <View style={{ marginBottom: 4 }}>
                        {item.description.split('\n').filter(Boolean).map((bullet: string, i: number) => (
                          <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
                            <Text style={{ fontSize: 10, color: "#334155", width: 10, textAlign: 'center' }}>•</Text>
                            <Text style={[base.description, tplStyles.description, { flex: 1, marginBottom: 0 }]}>{bullet.trim()}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {item.type === "progress" && (
                  <View style={{ marginTop: 2, marginBottom: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3, width: "60%" }}>
                      <Text style={[base.itemTitle, tplStyles.itemTitle]}>{item.name}</Text>
                      <Text style={{ fontSize: 9, color: "#64748b", fontFamily: "Helvetica-Bold" }}>{item.value || 0}%</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, width: "60%", overflow: "hidden" }}>
                      <View style={{ height: "100%", backgroundColor: themeColor, borderRadius: 3, width: `${item.value || 0}%` }}></View>
                    </View>
                  </View>
                )}

              </View>
            ))}
          </View>
        ))}

        {/* Skills for all other templates */}
        {!isProfessional && renderSkills()}

      </Page>
    </Document>
  );
}
