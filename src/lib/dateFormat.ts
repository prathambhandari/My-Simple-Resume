const safeParseIsoDate = (iso: string) => {
  // Supports YYYY-MM-DD (preferred) and YYYY-MM (legacy month picker)
  const trimmed = iso.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}-01T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
};

export const formatMonYYYY = (iso: string | undefined) => {
  const d = iso ? safeParseIsoDate(iso) : null;
  if (!d) return "";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(d);
};

