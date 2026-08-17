const MAX_CHARS = 40000;
const MAX_BYTES = 4 * 1024 * 1024;

const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/x-markdown",
]);

function asText(value: string) {
  const trimmed = value.replace(/\u0000/g, "").trim();
  if (!trimmed) return "";
  return trimmed.length > MAX_CHARS
    ? `${trimmed.slice(0, MAX_CHARS)}\n\n[Truncated]`
    : trimmed;
}

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

type TextItem = {
  str: string;
  x: number;
  y: number;
  hasEOL: boolean;
};

function reconstructPages(pages: TextItem[][]) {
  return pages
    .map((page) => {
      const sorted = [...page].sort((a, b) => b.y - a.y || a.x - b.x);
      const lines: string[] = [];
      let current = "";
      let lastY: number | null = null;

      for (const item of sorted) {
        const text = item.str.replace(/\s+/g, " ").trim();
        if (!text) {
          if (item.hasEOL && current.trim()) {
            lines.push(current.trim());
            current = "";
            lastY = null;
          }
          continue;
        }

        if (lastY !== null && Math.abs(item.y - lastY) > 3.5) {
          if (current.trim()) lines.push(current.trim());
          current = text;
        } else {
          current = current ? `${current} ${text}` : text;
        }
        lastY = item.y;

        if (item.hasEOL) {
          if (current.trim()) lines.push(current.trim());
          current = "";
          lastY = null;
        }
      }

      if (current.trim()) lines.push(current.trim());
      return lines.join("\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

function preferRicher(a: string, b: string) {
  const score = (value: string) =>
    value.length + value.split("\n").length * 40;
  return score(a) >= score(b) ? a : b;
}

async function extractPdfText(bytes: Uint8Array) {
  const { extractText, extractTextItems, extractLinks, getDocumentProxy } =
    await import("unpdf");
  const pdf = await getDocumentProxy(bytes);

  const [merged, structured, links] = await Promise.all([
    extractText(pdf, { mergePages: true }),
    extractTextItems(pdf).catch(() => null),
    extractLinks(pdf).catch(() => ({ links: [] as string[] })),
  ]);

  const mergedText = typeof merged.text === "string" ? merged.text : "";
  const structuredText = structured
    ? reconstructPages(structured.items as TextItem[][])
    : "";
  const body = preferRicher(structuredText, mergedText);
  const extraLinks = (links.links || []).filter(Boolean);
  const uniqueLinks = [...new Set(extraLinks)];
  const withLinks =
    uniqueLinks.length > 0
      ? `${body}\n\nLinks found:\n${uniqueLinks.join("\n")}`
      : body;

  return asText(withLinks);
}

export async function extractAttachmentText(file: File) {
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Use a file under 4 MB.");
  }

  const name = file.name || "attachment";
  const type = file.type || "";
  const ext = extOf(name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (ext === ".txt" || ext === ".md" || TEXT_TYPES.has(type)) {
    return asText(buffer.toString("utf8"));
  }

  if (ext === ".pdf" || type === "application/pdf") {
    const extracted = await extractPdfText(new Uint8Array(buffer));
    if (!extracted) {
      throw new Error("Could not read text from that PDF.");
    }
    return extracted;
  }

  if (
    ext === ".docx" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const extracted = asText(result.value);
    if (!extracted) {
      throw new Error("Could not read text from that Word file.");
    }
    return extracted;
  }

  throw new Error("Use a PDF, Word (.docx), or text file.");
}
