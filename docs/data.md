# Program data

Every number a student sees must be true and traceable. No sample data in production builds.

## Sources and rules
| Data | Source | Rule |
| --- | --- | --- |
| Requirements, tuition, deadlines, length, language | The program's official page | Collected by hand. Store the URL and the date checked; the app shows "Checked on <date> · official page". |
| University fees, application fee | The program's or university's official fees page | Same: URL and date. |
| Careers (recruiters, regions, salary, employment rate) | The program's official employment or career outcomes report | Only what the report publishes; store its URL and year. No estimates. |
| Fields of study (profile 2) | UNESCO, International Standard Classification of Education: Fields of Education and Training 2013 (ISCED-F 2013), detailed level | 78 fields with their 4-digit codes, names in `locales/*.json` under `isced` (English, Spanish). Left out: 00 Generic programmes, every "inter-disciplinary" (codes ending in 8) entry except 0788 (engineering), every "not elsewhere classified" (ending in 9) entry, 9999 Field unknown. Profiles store codes, never translated names. Search aliases (`isced.aliases`): common degree names linked to a code, searched in both languages and shown as "Includes: …". Checked against UNESCO's *ISCED-F 2013 – Detailed field descriptions* (2015): computer science, informatics, computer systems analysis → 0613; business administration, human resources, logistics, supply chain, public administration, entrepreneurship, management science → 0413; accounting → 0411; international relations → 0312; econometrics → 0311; actuarial science → 0542; data analysis → 0541; electronic engineering → 0714; mechanical, metallurgical → 0715; aerospace → 0716; electrical, energy → 0713; civil → 0732; chemical, biotechnology engineering → 0711; environmental engineering → 0712; biotechnology → 0512; graphic design, multimedia → 0211; mass communication → 0321; translation → 0231; nutrition → 0915. Our own mapping, not in the UNESCO text: industrial engineering, engineering management, systems engineering → 0788; mechatronics, robotics → 0714; software engineering → 0613; data science, business analytics → 0542 and 0613; automotive, naval engineering → 0716. |
| Current university (profile 2) | [university-domains-list](https://github.com/Hipo/university-domains-list) by Hipo, `world_universities_and_domains.json` (commit `a8fb652`, Nov 2, 2026) | MIT License, which allows use in an app if the copyright and permission notice is included: kept in `supabase/seed/LICENSE-university-domains-list.txt` and shown under Acknowledgements in `site/terms.html`. Imported into `institutions` (name, ISO alpha-2 country, `search_name` without accents), separate from `universities`. 10,253 rows after removing 19 duplicates. Re-import: download the JSON, `node scripts/import-institutions.mjs <file>` (new migration, upsert on name + country), `npx supabase db push --linked`. |
| Grants | Official grant page | Same. v1: listed only, never subtracted from the cost, no eligibility check (decision 2026-11-09). |
| Exchange rates | One public reference rate source, chosen when `rates.json` is created | Updated by hand for the MVP; the file stores the rates and their date, and the app shows the date next to every "≈" amount. |
| Rankings | QS, THE, US News | Show the rank exactly as published, with the ranking's name, edition year and a link to the page (decision 2026-10-17). Never round, combine or recompute ranks. QS terms ask for written consent for commercial use: request it in parallel (content@qs.com) and remove QS numbers if they refuse. |
| Logos | None | **No logos or crests.** Trademarks without permission are a common App Review rejection (guideline 5.2) and suggest the university endorses UNI. Use initials badges. Logos come later, with permission, from universities that pay for placement. |
| Brand colors (`universities.brand_color`, initials badge and Program detail scene) | The university's brand or visual identity page; otherwise the color its official website uses (CSS or theme color), noted as such | One hex per university, never guessed. Every university must stay clearly distinguishable from the others on Programs 3 (CIEDE2000 distance ≥ 12, checked by `src/components/scenes/scenes.test.ts`): when two primaries are too close, one moves to another color of its own official palette. IE Business School and IE University share one color (same institution, decision 2026-11-12). Nov 12 values. Primary, from brand pages: MIT #750014 (brand.mit.edu/color, MIT Red), Columbia #B9D9EB (visualidentity.columbia.edu/content/color), Purdue #CFB991 (marcom.purdue.edu/our-brand/visual-identity), UCL #993BFF (ucl.ac.uk/brand-and-experience/brand/visual-guidelines/colour), Warwick #3C1053 (id7.warwick.ac.uk/components/colour-palette), TU Delft #00A6D6 (tudelft.nl corporate design, cyan), Trinity #0569B9 (tcd.ie: most used color in the site CSS; `unicol` R package from the TCD visual identity). Primary, from the official site: LSE #E0112B (lse.ac.uk theme color), IE #FF630F (ie.edu CSS `--brand-1`; navy #000047 is too close to the app background), St. Gallen #00802F (unisg.ch CSS), Bocconi #0046AD (unibocconi.it CSS), EADA #410099 (EADA 2023 identity manual, "Innovation" axis; the site blocks automated reading). Moved to another official color: Berkeley #FC9313 Gold Dark (brand.berkeley.edu/identity-and-visual-design/color; Berkeley Blue #002676 disappears on the dark page and California Gold was too close to ASU), Duke #C84E00 Copper (brand.duke.edu/colors; Royal Blue #00539B too close to Trinity and Bocconi), ASU #FFC627 ASU Gold (brandguide.asu.edu via `unicol`; maroon too close to MIT), Imperial #40E0D0 (imperial.ac.uk CSS accent; main blue #0000CD too close to EADA and Bocconi), Edinburgh #D0006F Bright pink (Edinburgh colour theming via `unicol`; University red too close to LSE), Oxford #69913B graduate dark green (ox.ac.uk digital style guide via `unicol`; Oxford blue #002147 disappears on the dark page), ESADE #007A63 (esade.edu CSS; navy #000B3D disappears), ETH #007894 (ethz.ch theme color; ETH Blue #215CAF too close to Bocconi), EPFL #00A79F Léman (EPFL brand guidelines PDF; the red is not confirmed by an official source), HEC #7F9CB7 (hec.edu CSS; navy #003A70 disappears). To change one: edit `supabase/seed/universities.csv`, run `npm test` (distance check), `node scripts/generate-seed.mjs`, push. |

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
| `tuition_total` | 45000 | International tuition, in the unit of `cost_unit` |
| `fees_total` | 3600 | Mandatory university fees, same unit. Blank if the site does not publish them in a unit we can store (total or per year); 0 only if the site says they are included or there are none |
| `cost_unit` | total | `per_year` or `total`, for tuition and fees. Per semester × 2 = `per_year`; per credit only as `total` when the site gives a fixed number of credits, otherwise the program is left out (`business-rules.md` §4) |
| `application_fee` | 85 | |
| `test_required` | optional | `none`, `optional`, `required` (GMAT or GRE) |
| `letters_required` | 3 | Reference letters |
| `currency` | USD | |
| `deadline` | 2027-01-15 | Next intake, main round |
| `official_url` | https://… | Page where requirements and fees appear |
| `ranking_url` | https://… | University's page on the ranking site |
| `careers_url` | https://… | Not used: the report link lives in `careers.csv` (see Careers sheets) |
| `checked_on` | 2026-10-20 | |
| `checked_by` | Valeria | |

Rankings go in a second sheet, one row per rank shown: `program` (or blank for a university-wide rank), `university`, `scope` (`university` or `program`), `area` (`national` or `world`), `ranking_name` (e.g. "QS World University Rankings"), `rank` (as published, e.g. "114" or "101–150"), `year`, `url`, `checked_on`.

### Careers sheets
Three sheets, saved as `supabase/seed/careers.csv`, `recruiters.csv` and `regions.csv`. Each row names its program with `university` + `program`, written exactly as in `programs.csv` (no IDs); `scripts/generate-seed.mjs` stops with an error if a pair is not found. A blank cell means the report does not publish that figure: never estimate it. Display rules in `business-rules.md` §7. The `careers_url` column of `programs.csv` is not used (decision on removing it pending).

Every sheet has `scope` (`program`, `department` or `school`: whose figures they are) and `scope_label` (required when the scope is not `program`, e.g. "LSE Department of Management"). The scope is per sheet: for the same program, employment can be the program's and regions the school's. Within one sheet, all rows of a program share one scope.

`careers.csv`: one row per program; programs without a report have no row.

| Column | Example | Notes |
| --- | --- | --- |
| `university`, `program` | Massachusetts Institute of Technology, Master of Business Analytics | As in `programs.csv` |
| `scope`, `scope_label` | program, (blank) | Applies to salary, employment and roles |
| `report_url` | https://… | Official career outcomes report; the source link of every block |
| `report_year` | 2025 | Text as published ("2023-2024", "2019/20-2023/24"); blank if the report gives none |
| `avg_salary` | 139496 | Base salary in a real currency. Salaries published only in $PPP or measured 3 years after graduation are left out |
| `salary_currency` | USD | Must exist in `src/data/rates.json` |
| `salary_stat` | mean | `mean` or `median`, as the report says. Salary, currency and stat are all filled or all blank |
| `employed_pct` | 95.5 | % of graduates employed |
| `employed_months` | 3 | Months after graduation; blank if the report gives no timeframe |
| `top_roles` | Data Scientist; Data Analyst | Separated by ";" |
| `notes` | | For the team only; never shown |
| `checked_on` | 2026-11-11 | |

`recruiters.csv`: one row per company, in the report's order. Columns `university`, `program`, `company`, `roles` (blank: no report links roles to companies), `scope`, `scope_label`.

`regions.csv`: one row per region, in the report's order. Columns `university`, `program`, `region` (as written in the report, e.g. "Europe & UK", "London"), `share_pct` (above 0, up to 100; the shares of a program may add up to less than 100), `scope`, `scope_label`.

Recruiters and regions need the program's row in `careers.csv`, which holds the report link.

Target: 30 to 50 programs by Oct 25, in the fields and countries with the most demand.
