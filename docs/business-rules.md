# Business rules

Source of truth for the logic the app applies. Same rules as Checkpoint 2, section 3.1. If code and this file disagree, the file wins until we change it on purpose and log it in `decisions.md`.

## 1. Fit label (`src/lib/fit.ts`)

Inputs: student GPA on 0 to 10, student English score, program minimum GPA (converted to 0 to 10), program minimum English score, program `highly_selective` flag.

Order of checks:
1. English score below the program minimum → **Not yet eligible**.
2. GPA below the program minimum → **Not yet eligible**.
3. `margin = student GPA − program minimum GPA`
   - `0 ≤ margin ≤ 0.5` → **Reach**
   - `0.5 < margin ≤ 1.0` → **Match**
   - `margin > 1.0` → **Safety**, except highly selective programs, which stay **Match**.

Boundaries to test: margin exactly 0, 0.5, 1.0; English exactly at the minimum (eligible).

Shown next to every label: "This is not an admission probability."

Open: rule 2 (GPA below minimum) is implied in Checkpoint 2 but not written there. Confirm with Valeria.

## 2. English scores (`src/lib/grades.ts`)

v1 accepts IELTS only (0 to 9, step 0.5). TOEFL and others: later, with a published conversion table cited in `decisions.md`.

## 3. Grade conversion (`src/lib/grades.ts`)

Students come from any country, so both the student's grade and the program's minimum are stored on their original scale and converted to 0 to 10 before comparing.

v1 scales:
- `10`: 0 to 10 (Mexico, Spain and others): unchanged.
- `4.0`: US GPA: linear, `gpa4 × 2.5` (3.0 → 7.5). The Checkpoint 2 screen shows 3.0 → 8.0: decide which one and log it.
- `100`: percentage: `pct / 10`.
- `30`: Italian university average (18 to 30): to decide and log.
- `uk_class`: UK degree classification (First, 2:1, 2:2, Third): fixed table, to decide and log.

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
- Daily limit per user: see the DECIDE item in `flows.md` (proposal: 3).

## 6. Checklist (screen 12)

- Requirements listed: only those the program asks for (GPA, English, GMAT/GRE if `test_required` is not `none`).
- A requirement is met when the student's value reaches the program minimum, with the same conversion as the fit label. GMAT/GRE with no published minimum is met when the student has entered a score.
- Documents: CV, motivational letter, reference letters (`letters_required`).
- Items missing = unmet requirements + missing documents. Apply is enabled only at 0.
- "Applied" is set by the student with "I've submitted my application".

## 7. Careers (screen 8)

Each block (recruiters, regions, salary, employment rate) is shown only if the program's official source publishes it. No estimates.
