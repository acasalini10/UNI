// AI-assisted (Claude Code): fields of study from UNESCO ISCED-F 2013 (detailed level, 4-digit codes); names and search aliases (common degree names) in locales/*.json under "isced". Also the rules that read and save the profile's study fields.
import en from "../locales/en.json";
import es from "../locales/es.json";
import { normalizeForSearch } from "@/countries";
import { t } from "@/i18n";

// Detailed fields only; broad (2 digits) and narrow (3 digits) names are used for search and as the row's area.
export const fieldCodes = Object.keys(en.isced.detailed);
const known = new Set(fieldCodes);

// Value saved in current_studies when the student picks "Other" and writes their own text.
export const OTHER_FIELD = "other";

export function isFieldCode(value: string): boolean {
  return known.has(value);
}

export function fieldName(code: string): string {
  return t(`isced.detailed.${code}`);
}

// The broad area, e.g. "Engineering, manufacturing and construction" for 0713.
export function fieldArea(code: string): string {
  return t(`isced.broad.${code.slice(0, 2)}`);
}

// Common degree names that ISCED-F does not use as field names ("Industrial engineering" → 0788), per language.
const aliasesEn: Record<string, string> = en.isced.aliases;
const aliasesEs: Record<string, string> = es.isced.aliases;

// Second line of a row: the degree names it includes, or else the broad area.
export function fieldDetail(code: string): string {
  return code in aliasesEn ? t("profile.setup.fieldIncludes", { names: t(`isced.aliases.${code}`).split("; ").join(", ") }) : fieldArea(code);
}

// Field, narrow group, broad area and the aliases in both languages, so "engineering" finds every engineering
// field and "ingeniería industrial" finds 0788 whatever the app language.
export function fieldSearchText(code: string): string {
  return normalizeForSearch(
    [fieldName(code), t(`isced.narrow.${code.slice(0, 3)}`), fieldArea(code), aliasesEn[code] ?? "", aliasesEs[code] ?? ""].join(" "),
  );
}

// current_studies holds an ISCED code, or the student's own text when they picked "Other".
// Text saved before the list existed is read as "Other" with that text.
export type Studies = { code: string } | { other: string } | null;

export function readStudies(value: string | null): Studies {
  const text = value?.trim() ?? "";
  if (!text) return null;
  return isFieldCode(text) ? { code: text } : { other: text };
}

// Text for My Profile: the field's name, or the student's own text.
export function studiesText(value: string | null): string | null {
  const studies = readStudies(value);
  if (!studies) return null;
  return "code" in studies ? fieldName(studies.code) : studies.other;
}

// fields keeps ISCED codes only: free text saved before the list existed is dropped.
export function readFieldCodes(values: string[]): string[] {
  return values.filter(isFieldCode);
}
