import { Document, Page, Text, View, StyleSheet, Link, Image } from "@react-pdf/renderer";
import { ResumeData, TemplateType } from "@/types/resume";
import { formatMonYYYY } from "@/lib/dateFormat";

/** PDF variants: single-column, LETTER, Helvetica/Times—aligned with preview templates. */
export function DynamicPDF({
  data,
  templateId,
  themeColor,
}: {
  data: ResumeData;
  templateId: TemplateType;
  themeColor: string;
}) {
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;

  const accent = themeColor?.trim() && /^#/i.test(themeColor.trim()) ? themeColor.trim() : "#171717";

  const styles = buildPdfStyles(templateId, accent);

  const derivedLinks = [
    ...(personalInfo.links ?? []),
    personalInfo.website?.trim()
      ? { id: "website", title: "Website", url: personalInfo.website.trim() }
      : null,
    personalInfo.linkedin?.trim()
      ? { id: "linkedin", title: "LinkedIn", url: personalInfo.linkedin.trim() }
      : null,
    personalInfo.github?.trim()
      ? { id: "github", title: "GitHub", url: personalInfo.github.trim() }
      : null,
  ].filter(Boolean) as Array<{ id: string; title: string; url: string }>;

  const linkDisplay = personalInfo.linkDisplay ?? "both";
  const renderedLinkText = (l: { title: string; url: string }) => {
    if (linkDisplay === "title") return l.title;
    if (linkDisplay === "url") return l.url;
    return `${l.title}: ${l.url}`;
  };

  const contactTextParts = [
    personalInfo.dateOfBirth?.trim() ? `DOB: ${personalInfo.dateOfBirth}` : "",
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
  ].filter(Boolean) as string[];

  const contactInline =
    contactTextParts.length > 0 || derivedLinks.length > 0 ? (
      <View>
        {contactTextParts.length > 0 && (
          <Text
            style={[
              styles.contact,
              templateId === "minimal" ? { textAlign: "center" as const } : {},
            ]}
          >
            {contactTextParts.join(" · ")}
          </Text>
        )}
        {derivedLinks.length > 0 && (
          <Text
            style={[
              styles.contact,
              templateId === "minimal" ? { textAlign: "center" as const } : {},
            ]}
          >
            {derivedLinks.map((l, idx) => (
              <Text key={l.id}>
                {idx === 0 ? "" : " · "}
                <Link src={l.url} style={{ textDecoration: "underline" }}>
                  {renderedLinkText(l)}
                </Link>
              </Text>
            ))}
          </Text>
        )}
      </View>
    ) : null;

  const skillsStr = skills.map((s) => s.name.trim()).filter(Boolean).join(", ");

  const photo = personalInfo.photoUrl?.trim();
  const photoNode =
    photo && (photo.startsWith("data:image/") || photo.startsWith("http")) ? (
      <Image src={photo} style={styles.photo} />
    ) : null;

  const headerInner =
    templateId === "signature" ? (
      <View style={styles.headerBand}>
        <Text style={styles.name}>{personalInfo.fullName || "Your Name"}</Text>
        {!!personalInfo.jobTitle?.trim() && <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>}
        {contactInline}
      </View>
    ) : (
      <View style={styles.headerRule}>
        <Text style={[styles.name, templateId === "minimal" ? { textAlign: "center" as const } : {}]}>
          {personalInfo.fullName || "Your Name"}
        </Text>
        {!!personalInfo.jobTitle?.trim() && (
          <Text style={[styles.jobTitle, templateId === "minimal" ? { textAlign: "center" as const } : {}]}>
            {personalInfo.jobTitle}
          </Text>
        )}
        {contactInline}
      </View>
    );

  const headerBlock = photoNode ? (
    <View style={styles.headerRow}>
      <View style={styles.headerText}>{headerInner}</View>
      {photoNode}
    </View>
  ) : (
    headerInner
  );

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {headerBlock}

        {summary?.trim() && (
          <View style={styles.section}>
            {data.summaryShowTitle ? (
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            ) : null}
            <Text style={styles.body}>{summary}</Text>
          </View>
        )}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id}>
                <View style={styles.rowTitle}>
                  <Text style={styles.itemMain}>{exp.jobTitle}</Text>
                  <Text style={styles.itemDates}>
                    {formatMonYYYY(exp.startDate) || exp.startDate} –{" "}
                    {exp.current
                      ? "Present"
                      : formatMonYYYY(exp.endDate) || exp.endDate}
                  </Text>
                </View>
                <View style={styles.rowSub}>
                  <Text style={styles.itemCo}>{exp.company}</Text>
                  <Text style={styles.itemLoc}>{exp.location}</Text>
                </View>
                <Text style={styles.desc}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id}>
                <View style={styles.rowTitle}>
                  <Text style={styles.itemMain}>{edu.degree}</Text>
                  <Text style={styles.itemDates}>
                    {formatMonYYYY(edu.startDate) || edu.startDate} –{" "}
                    {edu.current
                      ? "Present"
                      : formatMonYYYY(edu.endDate) || edu.endDate}
                  </Text>
                </View>
                <View style={styles.rowSub}>
                  <Text style={styles.itemCo}>{edu.school}</Text>
                  <Text style={styles.itemLoc}>{edu.location}</Text>
                </View>
                {edu.gpa?.trim() && (
                  <Text style={[styles.desc, { marginTop: 2, marginBottom: 6 }]}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {skillsStr.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillsLine}>{skillsStr}</Text>
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id}>
                <View style={styles.rowTitle}>
                  <Text style={styles.itemMain}>{proj.name}</Text>
                  {proj.url?.trim() ? <Text style={styles.itemDates}>{proj.url}</Text> : null}
                </View>
                <Text style={styles.desc}>{proj.description}</Text>
              </View>
            ))}
          </View>
        )}

        {customSections &&
          customSections.length > 0 &&
          customSections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.id}>
                  {(!item.type || item.type === "paragraph") && (
                    <>
                      <Text style={[styles.itemMain, { marginBottom: item.description ? 2 : 6 }]}>{item.name}</Text>
                      {item.description && <Text style={styles.desc}>{item.description}</Text>}
                    </>
                  )}

                  {item.type === "bullets" && (
                    <>
                      <Text style={[styles.itemMain, { marginBottom: 2 }]}>{item.name}</Text>
                      {item.description &&
                        item.description
                          .split("\n")
                          .filter(Boolean)
                          .map((line: string, i: number) => (
                            <View key={i} style={styles.bulletRow}>
                              <Text style={styles.bullet}>•</Text>
                              <Text style={styles.bulletText}>{line.trim()}</Text>
                            </View>
                          ))}
                    </>
                  )}

                  {item.type === "progress" && (
                    <Text style={[styles.body, { marginBottom: 6 }]}>
                      {item.name}
                      {typeof item.value === "number" ? `: ${item.value}%` : ""}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}
      </Page>
    </Document>
  );
}

type PdfStyle = ReturnType<typeof StyleSheet.create>;

function buildPdfStyles(templateId: TemplateType, accent: string): PdfStyle {
  const base = {
    rowTitle: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 2,
    },
    rowSub: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      marginBottom: 6,
    },
    bulletRow: { flexDirection: "row" as const, marginBottom: 2 },
    bullet: { width: 10, fontSize: 10 as number },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.45, color: "#262626" },
    headerRow: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
    },
    headerText: { flexGrow: 1, flexShrink: 1, paddingRight: 12 },
    photo: { width: 64, height: 64, borderRadius: 4, objectFit: "cover" as const },
  };

  if (templateId === "standard") {
    return StyleSheet.create({
      page: {
        padding: 40,
        paddingBottom: 48,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.5,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#0a0a0a",
        paddingBottom: 12,
      },
      headerBand: {},
      name: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        marginBottom: 4,
      },
      jobTitle: { fontSize: 11, color: "#262626", marginBottom: 0 },
      contact: { marginTop: 10, fontSize: 10, color: "#404040", lineHeight: 1.45 },
      section: { marginTop: 16 },
      sectionTitle: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: "#0a0a0a",
        borderBottomWidth: 1,
        borderBottomColor: "#d4d4d4",
        paddingBottom: 4,
        marginBottom: 8,
      },
      body: { fontSize: 10, color: "#262626", lineHeight: 1.55 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#525252", width: 120, textAlign: "right" },
      itemCo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#262626", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 9, color: "#525252", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#262626", marginTop: 4, marginBottom: 4, lineHeight: 1.55 },
      skillsLine: { fontSize: 10, color: "#262626", lineHeight: 1.5 },
      ...base,
      bullet: { ...base.bullet, color: "#262626" },
    });
  }

  if (templateId === "modern") {
    return StyleSheet.create({
      page: {
        padding: 42,
        paddingBottom: 50,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.55,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        paddingBottom: 16,
      },
      headerBand: {},
      name: {
        fontSize: 23,
        fontFamily: "Helvetica-Bold",
        color: "#171717",
        marginBottom: 6,
        letterSpacing: -0.4,
      },
      jobTitle: { fontSize: 11, color: "#737373", marginBottom: 0, fontFamily: "Helvetica-Bold" },
      contact: { marginTop: 14, fontSize: 10, color: "#525252", lineHeight: 1.45 },
      section: { marginTop: 22 },
      sectionTitle: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        color: "#262626",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        paddingBottom: 6,
        marginBottom: 8,
      },
      body: { fontSize: 10, color: "#404040", lineHeight: 1.6 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#171717",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#737373", width: 120, textAlign: "right" },
      itemCo: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#404040",
        flex: 1,
        paddingRight: 8,
      },
      itemLoc: { fontSize: 9, color: "#737373", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#404040", marginTop: 5, marginBottom: 5, lineHeight: 1.6 },
      skillsLine: { fontSize: 10, color: "#404040", lineHeight: 1.55 },
      ...base,
      bullet: { ...base.bullet, color: "#404040" },
      bulletText: { ...base.bulletText, color: "#404040" },
    });
  }

  if (templateId === "executive") {
    return StyleSheet.create({
      page: {
        padding: 40,
        paddingBottom: 48,
        fontFamily: "Times-Roman",
        fontSize: 10,
        lineHeight: 1.5,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 4,
        borderBottomColor: "#0a0a0a",
        paddingBottom: 14,
      },
      headerBand: {},
      name: { fontSize: 22, fontFamily: "Times-Bold", color: "#0a0a0a", marginBottom: 4 },
      jobTitle: { fontSize: 11, fontFamily: "Times-Bold", color: "#333", marginBottom: 0 },
      contact: { marginTop: 10, fontSize: 10, color: "#404040", lineHeight: 1.45 },
      section: { marginTop: 16 },
      sectionTitle: {
        fontSize: 11,
        fontFamily: "Times-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        color: "#0a0a0a",
        borderBottomWidth: 1,
        borderBottomColor: "#a3a3a3",
        paddingBottom: 4,
        marginBottom: 8,
      },
      body: { fontSize: 10, color: "#262626", lineHeight: 1.55 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Times-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#525252", width: 120, textAlign: "right", fontFamily: "Times-Bold" },
      itemCo: { fontSize: 9, fontFamily: "Times-Bold", color: "#262626", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 9, color: "#525252", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#262626", marginTop: 4, marginBottom: 4, lineHeight: 1.55 },
      skillsLine: { fontSize: 10, color: "#262626", lineHeight: 1.5 },
      ...base,
      bullet: { ...base.bullet, color: "#262626", fontFamily: "Times-Roman" },
      bulletText: { ...base.bulletText, fontFamily: "Times-Roman" },
    });
  }

  if (templateId === "compact") {
    return StyleSheet.create({
      page: {
        padding: 28,
        paddingBottom: 40,
        fontFamily: "Helvetica",
        fontSize: 9,
        lineHeight: 1.4,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#0a0a0a",
        paddingBottom: 8,
      },
      headerBand: {},
      name: {
        fontSize: 17,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        marginBottom: 2,
      },
      jobTitle: { fontSize: 9, color: "#262626", marginBottom: 0 },
      contact: { marginTop: 6, fontSize: 8.5, color: "#525252", lineHeight: 1.35 },
      section: { marginTop: 12 },
      sectionTitle: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1,
        color: "#0a0a0a",
        borderBottomWidth: 1,
        borderBottomColor: "#d4d4d4",
        paddingBottom: 2,
        marginBottom: 6,
      },
      body: { fontSize: 9, color: "#262626", lineHeight: 1.45 },
      itemMain: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 8.5, color: "#525252", width: 118, textAlign: "right" },
      itemCo: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#262626", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 8.5, color: "#525252", width: 136, textAlign: "right" },
      desc: { fontSize: 9, color: "#262626", marginTop: 3, marginBottom: 3, lineHeight: 1.45 },
      skillsLine: { fontSize: 9, color: "#262626", lineHeight: 1.45 },
      ...base,
      bullet: { width: 9, fontSize: 9, color: "#262626" },
      bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4, color: "#262626" },
    });
  }

  if (templateId === "minimal") {
    return StyleSheet.create({
      page: {
        padding: 44,
        paddingBottom: 52,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.6,
        color: "#262626",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
        paddingBottom: 28,
      },
      headerBand: {},
      name: {
        fontSize: 26,
        fontFamily: "Helvetica",
        color: "#171717",
        marginBottom: 6,
        textAlign: "center",
      },
      jobTitle: { fontSize: 11, color: "#525252", marginBottom: 0, textAlign: "center" },
      contact: { marginTop: 22, fontSize: 10, color: "#737373", lineHeight: 1.45, textAlign: "center" },
      section: { marginTop: 22 },
      sectionTitle: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 2,
        color: "#a3a3a3",
        marginBottom: 10,
        textAlign: "center",
      },
      body: { fontSize: 10, color: "#404040", lineHeight: 1.65 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#171717",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#737373", width: 120, textAlign: "right" },
      itemCo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#404040", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 9, color: "#737373", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#404040", marginTop: 4, marginBottom: 4, lineHeight: 1.65 },
      skillsLine: { fontSize: 10, color: "#404040", lineHeight: 1.55 },
      ...base,
      bullet: { ...base.bullet, color: "#404040" },
      bulletText: { ...base.bulletText, color: "#404040" },
    });
  }

  if (templateId === "sidebar") {
    return StyleSheet.create({
      page: {
        padding: 34,
        paddingBottom: 44,
        fontFamily: "Helvetica",
        fontSize: 9.5,
        lineHeight: 1.5,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#0a0a0a",
        paddingBottom: 10,
      },
      headerBand: {},
      name: {
        fontSize: 21,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        marginBottom: 4,
      },
      jobTitle: { fontSize: 10, color: "#404040", marginBottom: 0 },
      contact: { marginTop: 8, fontSize: 9, color: "#525252", lineHeight: 1.4 },
      section: { marginTop: 14 },
      sectionTitle: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.1,
        color: "#0a0a0a",
        borderBottomWidth: 1,
        borderBottomColor: "#d4d4d4",
        paddingBottom: 3,
        marginBottom: 6,
      },
      body: { fontSize: 9.5, color: "#262626", lineHeight: 1.55 },
      itemMain: {
        fontSize: 9.5,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 8.5, color: "#525252", width: 110, textAlign: "right" },
      itemCo: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#262626", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 8.5, color: "#525252", width: 130, textAlign: "right" },
      desc: { fontSize: 9.5, color: "#262626", marginTop: 3, marginBottom: 4, lineHeight: 1.55 },
      skillsLine: { fontSize: 9.5, color: "#262626", lineHeight: 1.5 },
      ...base,
      bullet: { ...base.bullet, color: "#262626" },
    });
  }

  if (templateId === "timeline") {
    return StyleSheet.create({
      page: {
        padding: 40,
        paddingBottom: 48,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.55,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 2,
        borderBottomColor: "#0a0a0a",
        paddingBottom: 12,
      },
      headerBand: {},
      name: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        marginBottom: 4,
      },
      jobTitle: { fontSize: 11, color: "#404040", marginBottom: 0 },
      contact: { marginTop: 10, fontSize: 10, color: "#525252", lineHeight: 1.45 },
      section: { marginTop: 18 },
      sectionTitle: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.4,
        color: "#171717",
        marginBottom: 8,
      },
      body: { fontSize: 10, color: "#262626", lineHeight: 1.6 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#525252", width: 120, textAlign: "right" },
      itemCo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#262626", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 9, color: "#525252", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#262626", marginTop: 4, marginBottom: 5, lineHeight: 1.6 },
      skillsLine: { fontSize: 10, color: "#262626", lineHeight: 1.55 },
      ...base,
      bullet: { ...base.bullet, color: "#262626" },
      bulletText: { ...base.bulletText, color: "#262626" },
    });
  }

  if (templateId === "creative") {
    return StyleSheet.create({
      page: {
        padding: 42,
        paddingBottom: 50,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 1.6,
        color: "#171717",
      },
      headerRule: {
        borderBottomWidth: 1,
        borderBottomColor: "#d4d4d4",
        paddingBottom: 14,
      },
      headerBand: {},
      name: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        marginBottom: 5,
      },
      jobTitle: { fontSize: 11, color: "#404040", marginBottom: 0, fontFamily: "Helvetica-Bold" },
      contact: { marginTop: 10, fontSize: 10, color: "#525252", lineHeight: 1.45 },
      section: { marginTop: 20 },
      sectionTitle: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.3,
        color: "#ffffff",
        backgroundColor: accent,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 8,
        paddingRight: 8,
        marginBottom: 8,
        borderRadius: 8,
      },
      body: { fontSize: 10, color: "#404040", lineHeight: 1.65 },
      itemMain: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#0a0a0a",
        flex: 1,
        paddingRight: 8,
      },
      itemDates: { fontSize: 9, color: "#737373", width: 120, textAlign: "right" },
      itemCo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#404040", flex: 1, paddingRight: 8 },
      itemLoc: { fontSize: 9, color: "#737373", width: 140, textAlign: "right" },
      desc: { fontSize: 10, color: "#404040", marginTop: 4, marginBottom: 5, lineHeight: 1.65 },
      skillsLine: { fontSize: 10, color: "#404040", lineHeight: 1.55 },
      ...base,
      bullet: { ...base.bullet, color: "#404040" },
      bulletText: { ...base.bulletText, color: "#404040" },
    });
  }

  // signature
  return StyleSheet.create({
    page: {
      padding: 40,
      paddingBottom: 48,
      fontFamily: "Helvetica",
      fontSize: 10,
      lineHeight: 1.5,
      color: "#171717",
    },
    headerRule: {},
    headerBand: {
      backgroundColor: "#0a0a0a",
      padding: 18,
      marginBottom: 18,
      borderRadius: 2,
    },
    name: {
      fontSize: 21,
      fontFamily: "Helvetica-Bold",
      color: "#ffffff",
      marginBottom: 4,
    },
    jobTitle: { fontSize: 11, color: "#d4d4d4", marginBottom: 0 },
    contact: { marginTop: 10, fontSize: 10, color: "#a3a3a3", lineHeight: 1.45 },
    section: { marginTop: 16 },
    sectionTitle: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      color: "#0a0a0a",
      borderBottomWidth: 1,
      borderBottomColor: "#0a0a0a",
      paddingBottom: 4,
      marginBottom: 8,
    },
    body: { fontSize: 10, color: "#262626", lineHeight: 1.55 },
    itemMain: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#0a0a0a",
      flex: 1,
      paddingRight: 8,
    },
    itemDates: { fontSize: 9, color: "#525252", width: 120, textAlign: "right" },
    itemCo: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#262626", flex: 1, paddingRight: 8 },
    itemLoc: { fontSize: 9, color: "#525252", width: 140, textAlign: "right" },
    desc: { fontSize: 10, color: "#262626", marginTop: 4, marginBottom: 4, lineHeight: 1.55 },
    skillsLine: { fontSize: 10, color: "#262626", lineHeight: 1.5 },
    ...base,
    bullet: { ...base.bullet, color: "#262626" },
  });
}
