// AI-assisted (Claude Code): country field that opens a searchable sheet with every country; single choice, or several up to `max`. Built on SearchPicker (Nov 12).
import { useMemo } from "react";

import { SearchPicker } from "@/components/SearchPicker";
import { countryCodes, countryName, normalizeForSearch } from "@/countries";
import { t } from "@/i18n";

type Props = {
  label: string;
  value: string[];
  onChange: (codes: string[]) => void;
  // 1 = single choice: picking a country closes the sheet.
  max?: number;
};

export function CountryPicker({ label, value, onChange, max = 1 }: Props) {
  // Sorted by the translated name, so the order follows the app language. The code is searchable too ("mx").
  const options = useMemo(
    () =>
      countryCodes
        .map((code) => ({ value: code, label: countryName(code), searchText: `${normalizeForSearch(countryName(code))} ${code.toLowerCase()}` }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  return (
    <SearchPicker
      label={label}
      value={value}
      onChange={onChange}
      max={max}
      options={options}
      summary={value.map(countryName).join(", ")}
      placeholder={t("countryPicker.placeholder")}
      searchPlaceholder={t("countryPicker.search")}
      noResults={t("countryPicker.noResults")}
    />
  );
}
