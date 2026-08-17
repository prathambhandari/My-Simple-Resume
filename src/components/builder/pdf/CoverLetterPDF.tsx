import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 54,
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: 1.5,
    color: "#171717",
  },
  name: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    marginBottom: 16,
  },
  body: {
    fontSize: 12,
    marginBottom: 12,
  },
});

export function CoverLetterPDF({
  name,
  body,
}: {
  name: string;
  body: string;
}) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{name || "Cover Letter"}</Text>
        {(paragraphs.length ? paragraphs : [body.trim() || " "]).map((part, index) => (
          <Text key={index} style={styles.body}>
            {part}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
