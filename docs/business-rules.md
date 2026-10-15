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

`net cost = tuition (full program) + living costs (program length) − grants the student is eligible for`

- Loans are shown separately and never subtracted.
- All amounts stored in the program's currency; displayed in USD and MXN using one rate table with its date.
- Net cost never shows below 0.

## 5. Feedback paywall (v1)

Free: the first issue of each feedback round. The rest is shown locked with "Coming soon". No purchase flow in v1 (see `product.md`).
