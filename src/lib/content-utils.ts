import type { AppLocale } from "@/lib/constants";
import type { LocalizedText } from "@/types/content";

const htmlBreakPattern = /<br\s*\/?>/gi;

export function getLocalizedText(value: LocalizedText, locale: AppLocale) {
  return locale === "hi" ? value.hi : value.en;
}

export function getTextLines(value: string) {
  return value
    .replace(htmlBreakPattern, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatDisplayDate(value: string, locale: AppLocale) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium"
  }).format(parsed);
}
