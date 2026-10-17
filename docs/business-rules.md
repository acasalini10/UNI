# Business rules

Source of truth for the logic the app applies. Same rules as Checkpoint 2, section 3.1. If code and this file disagree, the file wins until we change it on purpose and log it in `decisions.md`.

## 1. Fit label (`src/lib/fit.ts`)

Inputs: student GPA on 0 to 10, student English score, program minimum GPA (converted to 0 to 10), program minimum English score, program `highly_selective` flag.

Order of checks:
1. No English score yet → **Not yet eligible**, with the hint "Add your English score".
2. English score below the program minimum → **Not yet eligible**.
3. `margin = student GPA − program minimum GPA` (both on 0 to 10)
   - `margin < −0.5` → **Not yet eligible**
   - `−0.5 ≤ margin ≤ 0.5` → **Reach** (up to half a point below the minimum still counts as Reach)
   - `0.5 < margin ≤ 1.0` → **Match**
   - `margin > 1.0` → **Safety**, except highly selective programs, which stay **Match**.

Boundaries to test: margin exactly −0.5, 0, 0.5, 1.0; just below −0.5 (Not yet eligible); English exactly at the minimum (eligible); no English score.

Shown next to every label: "This is not an admission probability." When the GPA is below the minimum, the reason says so: "Your grade is below the published minimum (8.0)".

## 2. English scores (`src/lib/grades.ts`)

v1 accepts IELTS only (0 to 9, step 0.5). TOEFL and others: later, with a published conversion table cited in `decisions.md`.

## 3. Grade conversion (`src/lib/grades.ts`)

Students come from any country, so both the student's grade and the program's minimum are stored on their original scale and converted to 0 to 10 before comparing.

v1 scales (decision 2026-10-17):
- `10`: 0 to 10 (Mexico, Spain and others): unchanged.
- `4.0`: US GPA: linear, `gpa4 × 2.5` (3.0 → 7.5, 3.6 → 9.0, 4.0 → 10).
- `100`: percentage: `pct / 10`.
- `30`: Italian university average (18 to 30): `avg30 / 3` (18 → 6.0, 27 → 9.0, 30 → 10). "30 e lode" counts as 30.
- `uk_class`: UK degree classification, fixed table: First → 9.0, 2:1 → 8.0, 2:2 → 7.0, Third → 6.0.

The program's minimum goes through the same function as the student's grade, so both sides of the comparison use the same scale.

Other scales: the student picks "Other" and gets no fit labels, only the program's requirements. Linear conversion is a simplification: say so in the app next to the label.

## 4. Net cost (`src/lib/cost.ts`)

`total = tuition (full program) + university fees (full program)`
`net cost = total − grants the student is eligible for`

- Living costs are not included anywhere (decision 2026-10-17). Screens say "Living costs are not included" next to the total.
- Programs list shows `total` as "Tuition and fees, full program". Program detail shows the breakdown and the net cost.
- The application fee is shown on its own in the key facts, never added to the total.
- Loans are shown separately and never subtracted.
- All amounts stored in the program's currency; displayed in USD and MXN using one rate table with its date.
- Net cost never shows below 0.

## 5. Feedback (v1)

- Fully free: every issue is shown, ranked `fix_first` or `improve`. No locked items and no "Coming soon" (App Review rejects unfinished features).
- Before the first round the student accepts sending CV and statement to Claude (Anthropic). Stored on the profile; the same switch is in Settings. The `feedback` Edge Function refuses the request if consent is false.
- Input: PDF only, max 10 MB per file. The function adds the program's requirements from the database to the prompt; without them the feedback would be generic.
- Daily limit: 3 rounds per user per day, counted in the Edge Function (decision 2026-10-17). The fourth attempt shows "You've used today's 3 checks. Try again tomorrow."

## 6. Checklist (screen 12)

- Requirements listed: only those the program asks for (GPA, English, GMAT/GRE if `test_required` is not `none`).
- A requirement is met when the student's value reaches the program minimum, with the same conversion as the fit label. GMAT/GRE with no published minimum is met when the student has entered a score.
- GPA up to 0.5 below the minimum (a Reach) shows an amber warning "Below the published minimum" but does not count as missing, so the student can still apply. More than 0.5 below counts as missing.
- Documents: CV, motivational letter, reference letters (`letters_required`).
- Items missing = unmet requirements + missing documents. Apply is enabled only at 0.
- "Applied" is set by the student with "I've submitted my application".

## 7. Careers (screen 8)

Each block (recruiters, regions, salary, employment rate) is shown only if the program's official source publishes it. No estimates.
