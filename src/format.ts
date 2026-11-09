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

// "Nov 9, 2026"
export function shortDate(iso: string): string {
  return utc(iso).toLocaleDateString(locale(), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
