# Business rules

Source of truth for the logic the app applies. Based on Checkpoint 2, section 3.1; changed on 2026-11-09 (missing minimums, scholarships, costs and currency). If code and this file disagree, the file wins until we change it on purpose and log it in `decisions.md`.

The only business rule is the fit label (`grades.ts`, `fit.ts`). `cost.ts` only formats the published cost and converts currency for display (section 4).

## 1. Fit label (`src/lib/fit.ts`)

Inputs: student GPA on 0 to 10 (missing when the scale is "Other"), student English score (may be missing), program minimum GPA (converted to 0 to 10, may be missing), program minimum English score (may be missing), program `highly_selective` flag.

Output: a label key (`safety`, `match`, `reach`, `not_yet_eligible`, `not_rated`) and the status of each requirement (`met`, `below`, `no_minimum`, `missing_score`). `src/lib` returns keys, never display text: screens translate them with `t()` (`fit.labels.*` in `locales/*.json`).

### Missing minimums (decision 2026-11-09)

A missing minimum means our data has no published value, not that the program has no requirement. The same rule applies to every requirement (here and in the checklist, section 6).
- The requirement row shows **"No published minimum"** with the subtext "Check with the university". Never "Not required".
- Program IELTS minimum missing → the English check is skipped; the label comes from the GPA only.
- Program GPA minimum missing → no Reach, Match or Safety: the chip shows **Not rated**, unless the student's English score is below a published minimum (**Not yet eligible**).
- Both minimums missing → **Not rated**.

Student with no English score yet (decision 2026-11-09): status `missing_score`. It does not change the label, which comes from the GPA; the English row shows the hint "Add your IELTS score".

Order of checks:
1. The student has an English score below a published minimum → **Not yet eligible**. This wins over everything, also when the GPA minimum is missing.
2. Program GPA minimum missing, or student GPA missing (scale "Other") → **Not rated**.
3. `margin = student GPA − program minimum GPA` (both on 0 to 10):
   - `margin < −0.5` → **Not yet eligible**
   - `−0.5 ≤ margin ≤ 0.5` → **Reach** (up to half a point below the minimum still counts as Reach)
   - `0.5 < margin ≤ 1.0` → **Match**
   - `margin > 1.0` → **Safety**, except highly selective programs, which stay **Match**.

Boundaries to test: margin exactly −0.5, 0, 0.5, 1.0; just below −0.5 (Not yet eligible); English exactly at the minimum (eligible); no English score (label from the GPA, status `missing_score`). Missing minimums: IELTS minimum missing (GPA only); GPA minimum missing with English met or no English score (Not rated) and with English below the minimum (Not yet eligible); both missing (Not rated). Scale "Other" (Not rated, or Not yet eligible with English below the minimum).

Shown next to every label: "This is not an admission probability." When the GPA is below the minimum, the reason says so: "Your grade is below the published minimum (8.0)".

## 2. English scores (`src/lib/grades.ts`)

v1 accepts IELTS only (0 to 9, step 0.5). TOEFL and others: later, with a published conversion table cited in `decisions.md`.

## 3. Grade conversion (`src/lib/grades.ts`)

Students come from any country, so both the student's grade and the program's minimum are stored on their original scale and converted to 0 to 10 before comparing.

Rule (decision 2026-11-09, replaces the 2026-10-17 conversions): the scale's passing grade maps to 6.0 (the Mexican passing grade), its best grade to 10, linear in between:
`on10 = 6 + (grade − pass) / (best − pass) × 4`, kept between 0 and 10, rounded to 0.1.

v1 scales (ids as stored in `profiles.grade_scale`):
- `10`: 0 to 10 (Mexico, Spain and others), pass 6: unchanged.
- `4.0`: US GPA, pass 2.0: 2.0 → 6.0, 3.0 → 8.0, 3.6 → 9.2, 4.0 → 10.
- `100`: percentage, pass 60: 60 → 6.0, 80 → 8.0, 90 → 9.0.
- `30`: Italian university average (18 to 30), pass 18: 18 → 6.0, 27 → 9.0, 30 → 10. "30 e lode" counts as 30.
- `uk_class`: UK degree classification (`profiles.grade_class`: `first`, `2:1`, `2:2`, `third`), bands First 9–10, 2:1 8–9, 2:2 7–8, Third 6–7. The student's class uses the middle of the band: First → 9.5, 2:1 → 8.5, 2:2 → 7.5, Third → 6.5. A program's minimum class uses the bottom of the band: First → 9, 2:1 → 8, 2:2 → 7, Third → 6 ("at least a 2:1" accepts the whole band). Decision 2026-11-11.
- `other`: no conversion (null).

The program's minimum goes through the same function as the student's grade, so both sides of the comparison use the same scale. Only UK classes differ by side (middle of the band for the student, bottom for the minimum).

Other scales: the student picks "Other" and gets no fit labels (Not rated, section 1), only the program's requirements. Linear conversion is a simplification: say so in the app next to the label.

## 4. Cost display and currency (`src/lib/cost.ts`)

No net cost (decision 2026-11-09). The app shows only the cost published on the university's site.
- Fee: the international one only (non-EU / overseas).
- Unit: the site's unit (per year, total or per credit), shown next to the amount. No conversion into a total.
- Living costs are not included anywhere (decision 2026-10-17). Screens say "Living costs are not included" next to the cost.
- The academic year of the amount is not stored for now.
- The application fee is shown on its own in the key facts, never added to the cost.

Currency:
- The student picks a currency in profile setup (not at sign-in). Default from the country of residence for 10 countries (MX → MXN, US → USD, GB → GBP, CH → CHF; IT, ES, DE, FR, NL, IE → EUR); every other country falls back to USD. It can be changed from Profile.
- The main amount is always the original one, in the site's currency. Next to it: "≈" + the amount in the student's currency + the date of the rate.
- Rates and their date live in a `rates.json` file, updated by hand for the MVP. `cost.ts` receives the rates as a parameter, so it stays pure.
- The conversion is for display only: every comparison and stored value uses the site's currency.
- `cost.ts` returns values (amount, currency code, unit key, rate date), never display text. Screens translate the unit with `t()` (`cost.units.*`) and pass the active locale to `formatMoney`.
- Currency codes are case-insensitive (normalized to uppercase) and checked with `isValidCurrency(code, rates)` when program data is imported: valid only if it is a 3-letter code present in `rates.json`. `formatMoney` falls back to "CODE amount" if `Intl` rejects the code.

## 4b. Scholarships

- Listed in Program detail, nothing more.
- Never subtracted from the cost. No eligibility check.

## 5. Feedback (v1)

- Fully free: every issue is shown, ranked `fix_first` or `improve`. No locked items and no "Coming soon" (App Review rejects unfinished features).
- Before the first round the student accepts sending CV and statement to Claude (Anthropic). Stored on the profile; the same switch is in Settings. The `feedback` Edge Function refuses the request if consent is false.
- Input: PDF only, max 10 MB per file. The function adds the program's requirements from the database to the prompt; without them the feedback would be generic.
- Daily limit: 3 rounds per user per day, counted in the Edge Function (decision 2026-10-17). The fourth attempt shows "You've used today's 3 checks. Try again tomorrow."

## 6. Checklist (screen 12)

- Requirements listed: only those the program asks for (GPA, English, GMAT/GRE if `test_required` is not `none`).
- A requirement is met when the student's value reaches the program minimum, with the same conversion as the fit label.
- Missing minimum (decision 2026-11-09, same rule as section 1): the row is still listed and shows "No published minimum" with "Check with the university". GPA or English with no published minimum never counts as missing. GMAT/GRE with no published minimum is met when the student has entered a score.
- GPA up to 0.5 below the minimum (a Reach) shows an amber warning "Below the published minimum" but does not count as missing, so the student can still apply. More than 0.5 below counts as missing.
- Student grade that cannot be converted (scale "Other", decision 2026-11-10): the GPA row shows "Not converted" with "Check with the university" and never counts as missing, as the fit label shows Not rated. The student cannot change it, so it must not block Apply.
- Documents: CV, motivational letter, reference letters (`letters_required`).
- Items missing = unmet requirements + missing documents. Apply is enabled only at 0.
- "Applied" is set by the student with "I've submitted my application".

## 7. Careers (screen 8)

Each block (recruiters, regions, salary, employment rate) is shown only if the program's official source publishes it. No estimates.
