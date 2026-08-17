export const DONATE_URL =
  process.env.NEXT_PUBLIC_DONATE_URL?.trim() || "https://ko-fi.com/vistawatch";
export const DONATE_INTERVAL_MS = 4 * 60 * 1000;

export const DONATE_EVENT = "simple-resume:donate";

export function requestDonatePrompt() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DONATE_EVENT));
}
