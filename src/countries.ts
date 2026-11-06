// AI-assisted (Claude Code): ISO country codes and translated names (generated into locales/*.json by scripts/generate-countries.mjs).
import en from "../locales/en.json";
import { t } from "@/i18n";

export const countryCodes = Object.keys(en.countries);

export function countryName(code: string): string {
  return t(`countries.${code}`);
}

// "México" matches "mexico": search ignores case and accents.
export function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
