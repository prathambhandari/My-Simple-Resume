import { AppUi, defaultAppUi } from "@/types/ui";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asHex(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const hex = value.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(hex)) return hex.toLowerCase();
  if (/^#([0-9a-fA-F]{3})$/.test(hex)) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return fallback;
}

function asNumber(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeUi(raw: unknown, fallback: AppUi = defaultAppUi): AppUi {
  const input =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    chatWidthPercent: Math.round(
      clamp(asNumber(input.chatWidthPercent, fallback.chatWidthPercent), 18, 48),
    ),
    accent: asHex(input.accent, fallback.accent),
    glassOpacity: Number(
      clamp(asNumber(input.glassOpacity, fallback.glassOpacity), 0.04, 0.22).toFixed(2),
    ),
    radiusPx: Math.round(
      clamp(asNumber(input.radiusPx, fallback.radiusPx), 8, 28),
    ),
  };
}

export function mergeUi(current: AppUi, patch: unknown): AppUi {
  if (!patch || typeof patch !== "object") return current;
  return normalizeUi({ ...current, ...(patch as object) }, current);
}

const COLOR_NAMES: Array<[RegExp, string]> = [
  [/\b(blue|azure)\b/, "#0081ff"],
  [/\b(purple|violet)\b/, "#7c4dff"],
  [/\b(green|emerald)\b/, "#12b981"],
  [/\b(orange|amber)\b/, "#f59e0b"],
  [/\b(pink|magenta)\b/, "#ec4899"],
  [/\b(red|rose)\b/, "#ef4444"],
  [/\b(teal|cyan)\b/, "#14b8a6"],
  [/\b(white|silver|grey|gray)\b/, "#94a3b8"],
];

export function isAppUiRequest(text: string) {
  return /\b(chat|header|glass|ui|interface|app chrome|background|bubble|composer|accent|theme color|rounder|wider|narrower)\b/i.test(
    text,
  );
}

export function uiFromUserText(
  text: string,
  current: AppUi,
): Partial<AppUi> | null {
  const lower = text.toLowerCase();
  if (!isAppUiRequest(lower) && !/reset (the )?(ui|interface|theme)\b/.test(lower)) {
    return null;
  }

  const next: Partial<AppUi> = {};

  if (/reset (the )?(ui|interface|theme|app)\b/.test(lower)) {
    return { ...defaultAppUi };
  }

  const percent = lower.match(
    /(?:chat[^%]{0,24}|width[^%]{0,12})(\d{2})\s*%|(\d{2})\s*%[^.]{0,16}chat/,
  );
  const amount = percent?.[1] || percent?.[2];
  if (amount) next.chatWidthPercent = Number(amount);

  if (next.chatWidthPercent == null) {
    if (/\bchat\b.*\b(wider|bigger|larger|broader)\b|\b(wider|bigger) chat\b/.test(lower)) {
      next.chatWidthPercent = current.chatWidthPercent + 8;
    } else if (/\bchat\b.*\b(narrower|smaller|thinner|skinnier)\b|\b(narrower|smaller) chat\b/.test(lower)) {
      next.chatWidthPercent = current.chatWidthPercent - 8;
    }
  }

  if (/\b(more glass|frostier|more blur|blurrier|more transparent)\b/.test(lower)) {
    next.glassOpacity = current.glassOpacity + 0.04;
  } else if (/\b(less glass|more solid|less blur|more opaque)\b/.test(lower)) {
    next.glassOpacity = current.glassOpacity - 0.04;
  }

  if (/\b(rounder|more round|softer corners)\b/.test(lower)) {
    next.radiusPx = current.radiusPx + 6;
  } else if (/\b(sharper|less round|square|squarer)\b/.test(lower)) {
    next.radiusPx = current.radiusPx - 6;
  }

  for (const [pattern, color] of COLOR_NAMES) {
    if (
      pattern.test(lower) &&
      /\b(accent|color|colour|button|blue|theme|ui|chat|header)\b/.test(lower)
    ) {
      next.accent = color;
      break;
    }
  }

  if (
    Object.keys(next).length === 0 &&
    /\b(different ui|change (the )?ui|new ui|restyle (the )?(app|ui))\b/.test(lower)
  ) {
    next.accent = current.accent === "#0081ff" ? "#7c4dff" : "#0081ff";
    next.radiusPx = current.radiusPx >= 20 ? 12 : 22;
    next.glassOpacity = current.glassOpacity >= 0.14 ? 0.08 : 0.16;
  }

  return Object.keys(next).length > 0 ? next : null;
}
