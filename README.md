# UNI

#### Video demo: <URL, to add after recording>

#### Description

<!--
CS50x final project README. Rules (cs50.harvard.edu/x/project):
- Several hundred words at minimum; about 750 is typical.
- Explain what the project is, what each file contains and does, and the design choices debated and why.
- Fill the sections below in your own words as the project is built. Do not let AI write this file.
Delete this comment before submitting.
-->

UNI is an iOS app for international students of any nationality who want to study abroad. A student enters their grades, English test score, fields of interest and target countries once. UNI then shows real programs labelled by how well the student fits their published minimums (Match, Reach or Not yet eligible), what each program really costs after the grants the student qualifies for, and feedback on their CV and statement. v1 covers master's programs.

<!-- TODO (≈150 words): the problem. Why choosing a program abroad is hard; what students do today; why I built this. -->

### How it works

<!-- TODO (≈150 words): the main flow a user goes through, screen by screen. -->

### Files

<!-- TODO (≈250 words): one short paragraph per important file or folder. Start with:
- app/ (screens)
- src/lib/fit.ts, cost.ts, grades.ts (business rules)
- src/data/ (database queries)
- supabase/migrations/ (schema and Row Level Security)
- supabase/functions/feedback/ (AI feedback)
-->

### Design choices

<!-- TODO (≈200 words): decisions I debated. Candidates from docs/decisions.md:
- Expo instead of a Next.js website, to ship on the App Store
- Fit labels instead of an admission probability (no outcome data)
- Business logic as pure functions with tests, separate from the screens
- AI called from a server function, never from the app (API key safety)
- Initials instead of university logos; ranking numbers shown only with their source and year
-->

### Use of AI

<!-- TODO: which tools (Claude Code, GitHub Copilot), for what, and which parts I wrote myself. Files with substantial AI help carry a comment at the top saying so. -->

### Context

UNI is also the team project for Strategic Sales Management at Universidad Panamericana (Mexico City, 2026) with Valeria Laparra Castro, who led market research, program data and design. The code in this repository is mine. The business case is in the course documents, not here.

---

## Run it (GitHub Codespaces)
1. Open the repository's codespace from github.com/codespaces.
2. Supabase keys load from the repository's Codespaces secrets. Outside Codespaces, copy `.env.example` to `.env` and fill it in.
3. `npm install`
4. `npx expo start --tunnel`
5. On iPhone, scan the QR code with the Expo Go app.

## Documentation
| File | What it holds |
| --- | --- |
| `CLAUDE.md` | Instructions for Claude Code: stack, commands, rules |
| `.github/copilot-instructions.md` | Code conventions for GitHub Copilot |
| `docs/product.md` | v1 scope, screens, what is left out |
| `docs/flows.md` | Every screen, tap and state |
| `docs/screens/` | Screenshots of the design, one per screen |
| `docs/business-rules.md` | Fit labels, grade conversion, net cost |
| `docs/data.md` | Where program data comes from and the columns we collect |
| `docs/decisions.md` | Decision log (feeds the course Decision Log and the Design choices above) |
| `docs/progress.md` | Where we are and the next step |
| `docs/tasks.md` | Task list with owners (Alessandro, Valeria, Claude Code, Copilot) |
| `docs/app-store.md` | Release checklist for App Review |
| `docs/cs50.md` | CS50 final project requirements and checklist |
