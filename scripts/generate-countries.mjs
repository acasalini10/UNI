// AI-assisted (Claude Code): writes country names (en, es) into locales/*.json from Node's ICU data. Run once with `node scripts/generate-countries.mjs`; Hermes has no Intl.DisplayNames, so the app reads the names from the locale files.
import { readFileSync, writeFileSync } from "node:fs";

// Deprecated codes, groups and places without residents, which no student picks.
const excluded = new Set([
  "AN", "BU", "CS", "DD", "DY", "FX", "HV", "NH", "RH", "SU", "TP", "UK", "VD", "YD", "YU", "ZR",
  "AC", "CP", "CQ", "DG", "EA", "EU", "EZ", "IC", "QO", "TA", "UN", "XA", "XB", "ZZ",
  "AQ", "BV", "HM", "UM", "GS", "IO", "TF",
]);

// Shorter or clearer names than ICU's defaults.
const overrides = {
  en: { HK: "Hong Kong", MO: "Macao", CD: "DR Congo", CG: "Republic of the Congo", MM: "Myanmar", PS: "Palestine" },
  es: { HK: "Hong Kong", MO: "Macao", CD: "República Democrática del Congo", CG: "República del Congo", MM: "Myanmar", PS: "Palestina" },
};

for (const lang of ["en", "es"]) {
  const names = new Intl.DisplayNames([lang], { type: "region", fallback: "none" });
  const countries = {};
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      if (excluded.has(code)) continue;
      const name = names.of(code);
      if (name && name !== code) countries[code] = overrides[lang][code] ?? name.replace(/ & /g, " and ");
    }
  }
  const file = `locales/${lang}.json`;
  const json = JSON.parse(readFileSync(file, "utf8"));
  json.countries = countries;
  writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
  console.log(`${file}: ${Object.keys(countries).length} countries`);
}
