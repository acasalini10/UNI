# Program data

Every number a student sees must be true and traceable. No sample data in production builds.

## Sources and rules
| Data | Source | Rule |
| --- | --- | --- |
| Requirements, tuition, deadlines, length, language | The program's official page | Collected by hand. Store the URL and the date checked; the app shows "Checked on <date> · official page". |
| Living costs | Official university or government estimate (e.g. visa guidance) | Same: URL and date. |
| Grants | Official grant page | Same. v1: only grants with clear eligibility rules. |
| Rankings | QS, THE, US News | **Do not copy ranking numbers.** QS terms require written consent for commercial use and forbid altering the data. The app links to the university's page on the ranking site. Permission request: content@qs.com. |
| Logos | None | **No logos or crests.** Trademarks without permission are a common App Review rejection (guideline 5.2) and suggest the university endorses UNI. Use initials badges. Logos come later, with permission, from universities that pay for placement. |

No scraping in v1: university pages and PDFs differ too much, and values change every intake. Later: Claude extracts fields from the official page, a person checks them before publishing.

## Collection sheet (Google Sheets → CSV → Supabase)
One row per program. Column names match the database.

| Column | Example | Notes |
| --- | --- | --- |
| `university` | Georgia Institute of Technology | |
| `program` | MS in Industrial Engineering | |
| `country` | USA | |
| `city` | Atlanta | |
| `field` | Industrial Engineering | From a fixed list |
| `degree` | Master | v1: Master only |
| `length_months` | 18 | |
| `language` | English | |
| `min_gpa` | 3.0 | Blank if not published |
| `min_gpa_scale` | 4.0 | `4.0`, `10`, `100`, `uk_class` |
| `min_ielts` | 7.0 | Blank if not published |
| `highly_selective` | TRUE | Acceptance rate under ~20% or stated as highly selective |
| `tuition_total` | 58000 | Whole program |
| `living_cost_month` | 1800 | |
| `currency` | USD | |
| `deadline` | 2027-01-15 | Next intake, main round |
| `official_url` | https://… | Page where requirements and fees appear |
| `ranking_url` | https://… | University's page on the ranking site |
| `checked_on` | 2026-10-20 | |
| `checked_by` | Valeria | |

Target: 30 to 50 programs by Oct 25, in the fields and countries with the most demand.
