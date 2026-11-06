// AI-assisted (Claude Code): URLs of the public legal pages and a helper that opens them in an in-app Safari sheet.
import * as WebBrowser from "expo-web-browser";

import { currentLanguage } from "@/i18n";

const siteUrl = "https://acasalini10.github.io/UNI";

const pages = {
  terms: `${siteUrl}/terms.html`,
  privacy: `${siteUrl}/privacy.html`,
} as const;

export type LegalPage = keyof typeof pages;

// Both pages hold English and Spanish; Spanish users jump straight to the #es section.
export function legalUrl(page: LegalPage): string {
  return currentLanguage() === "es" ? `${pages[page]}#es` : pages[page];
}

export async function openLegalPage(page: LegalPage): Promise<void> {
  await WebBrowser.openBrowserAsync(legalUrl(page), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  });
}
