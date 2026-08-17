import { Document, Packer, Paragraph, TextRun } from "docx";
import { ResumeData } from "@/types/resume";
import { formatMonYYYY } from "@/lib/dateFormat";

function p(text: string, opts?: { bold?: boolean; size?: number }) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({
        text,
        bold: opts?.bold,
        size: opts?.size || 22,
        font: "Calibri",
      }),
    ],
  });
}

function heading(text: string) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { color: "999999", space: 1, style: "single", size: 6 } },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 20,
        font: "Calibri",
      }),
    ],
  });
}

export async function resumeToDocxBlob(data: ResumeData) {
  const { personalInfo, summary, experience, education, skills, projects, customSections } = data;
  const children: Paragraph[] = [
    p(personalInfo.fullName || "Resume", { bold: true, size: 36 }),
  ];

  if (personalInfo.jobTitle) children.push(p(personalInfo.jobTitle, { size: 24 }));

  const contact = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.website,
  ].filter(Boolean);
  if (contact.length) children.push(p(contact.join("  |  "), { size: 20 }));

  if (summary.trim()) {
    children.push(heading("Summary"));
    children.push(p(summary));
  }

  if (experience.length) {
    children.push(heading("Experience"));
    for (const item of experience) {
      const dates = `${formatMonYYYY(item.startDate) || item.startDate} - ${
        item.current ? "Present" : formatMonYYYY(item.endDate) || item.endDate || ""
      }`;
      children.push(p(`${item.jobTitle}  |  ${item.company}  |  ${dates}`, { bold: true }));
      if (item.location) children.push(p(item.location, { size: 20 }));
      item.description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => children.push(p(`• ${line.replace(/^•\s*/, "")}`)));
    }
  }

  if (education.length) {
    children.push(heading("Education"));
    for (const item of education) {
      children.push(
        p(
          `${item.degree}  |  ${item.school}${item.gpa ? `  |  GPA ${item.gpa}` : ""}`,
          { bold: true },
        ),
      );
    }
  }

  if (skills.length) {
    children.push(heading("Skills"));
    children.push(p(skills.map((item) => item.name).filter(Boolean).join(", ")));
  }

  if (projects.length) {
    children.push(heading("Projects"));
    for (const item of projects) {
      children.push(p(item.name, { bold: true }));
      if (item.description) children.push(p(item.description));
      if (item.url) children.push(p(item.url, { size: 20 }));
    }
  }

  for (const section of customSections ?? []) {
    if (!section.title.trim()) continue;
    children.push(heading(section.title));
    for (const item of section.items) {
      const line = [item.name, item.description].filter(Boolean).join(" — ");
      if (line) children.push(p(line));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  const buffer = await Packer.toBlob(doc);
  return buffer;
}

export async function coverLetterToDocxBlob(name: string, body: string) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          p(name || "Cover Letter", { bold: true, size: 32 }),
          ...body
            .split(/\n{2,}/)
            .map((block) => block.trim())
            .filter(Boolean)
            .map((block) => p(block)),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}
