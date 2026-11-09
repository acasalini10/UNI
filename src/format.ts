// AI-assisted (Claude Code): date formatting for the active language; dates from the database are YYYY-MM-DD and read as UTC so the day never shifts.
import { currentLanguage } from "@/i18n";

function utc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function locale(): string {
  return currentLanguage() === "es" ? "es-MX" : "en-US";
}

// "Jan 2027"
export function monthYear(iso: string): string {
  return utc(iso).toLocaleDateString(locale(), { month: "short", year: "numeric", timeZone: "UTC" });
}

// Whole days from today (local calendar day) to the date; negative once it has passed.
export function daysUntil(iso: string, today = new Date()): number {
  const start = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((utc(iso).getTime() - start) / 86_400_000);
}

// "Nov 9, 2026"
export function shortDate(iso: string): string {
  return utc(iso).toLocaleDateString(locale(), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
