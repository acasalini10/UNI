// AI-assisted (Claude Code): i18n setup; picks English or Spanish from the phone language
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import en from "../locales/en.json";
import es from "../locales/es.json";

export const supportedLanguages = ["en", "es"] as const;
export type Language = (typeof supportedLanguages)[number];

const i18n = new I18n({ en, es });

// Missing keys in Spanish fall back to English instead of showing "[missing ...]".
i18n.defaultLocale = "en";
i18n.enableFallback = true;

function phoneLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === "es" ? "es" : "en";
}

i18n.locale = phoneLanguage();

// Used later by the Language row in Settings (screen 13).
export function setLanguage(language: Language): void {
  i18n.locale = language;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
