# UNI

Mobile app (iOS first) that helps international students of any nationality choose programs abroad and strengthen their application. v1 covers master's programs. Two uses: team project for Strategic Sales Management (Universidad Panamericana; App Store submission by Nov 2, 2026; live demo Nov 11) and my CS50x final project (deadline Dec 31, 2026).

## Stack
- Expo (React Native) with Expo Router, TypeScript strict
- Supabase: Postgres, Auth (email + password, Sign in with Apple, Google), Row Level Security, Storage (PDFs), Edge Functions (Deno)
- i18n: `i18n-js` + `expo-localization`, strings in `locales/en.json` and `locales/es.json`
- Claude API is called only from the `feedback` Edge Function, never from the app
- EAS Build and EAS Submit for iOS (Apple Developer Program active). Expo web only as an emergency fallback: do not spend time on web compatibility unless I ask.
- Styling: React Native StyleSheet with tokens from `src/theme.ts`. No UI library.

## Commands
- `npx expo start --tunnel`: dev server (tunnel is required in Codespaces); open with Expo Go on iPhone
- `npx tsc --noEmit`: typecheck
- `npm run lint`
- `npm test`: unit tests (Jest) for `src/lib`
- `eas build -p ios --profile production` and `eas submit -p ios`: run only when I ask

## Structure
- `app/`: screens (Expo Router). `(auth)/`, `(tabs)/programs`, `(tabs)/applications`, `(tabs)/feedback`, `(tabs)/profile`
- `src/lib/`: pure logic, no React, no Supabase: `fit.ts` (labels), `cost.ts` (net cost), `grades.ts` (conversion)
- `src/data/`: Supabase queries, typed
- `src/components/`: shared UI
- `supabase/migrations/`: one SQL file per change
- `supabase/functions/feedback/`: Claude API call
- `docs/`: read the relevant file before working on that area

## Docs (read only when relevant)
- `docs/product.md`: v1 scope and what is out
- `docs/flows.md`: every screen, tap and state; screenshots in `docs/screens/`. Before building a screen, check its section has no open DECIDE items; if it does, ask me.
- `docs/business-rules.md`: fit labels and net cost. Source of truth. If code and doc disagree, stop and ask.
- `docs/decisions.md`: append a row for every non-trivial technical decision
- `docs/progress.md`: read at the start of a session, update at the end
- `docs/app-store.md`: release checklist
- `docs/data.md`: data sources, logo and ranking rules, collection sheet columns
- `docs/cs50.md`: CS50 final project requirements
- `docs/tasks.md`: task list with owners. Only work on tasks marked Claude Code; if I ask for a task owned by someone else, say so first.

## Rules
- Business logic lives in `src/lib` as pure functions with unit tests. Screens never compute labels or costs.
- Every new table gets RLS enabled in the same migration. Users read and write only their own rows. `programs` and `scholarships` are read-only for authenticated users.
- No secrets in the app. Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are public. `ANTHROPIC_API_KEY` lives only in Supabase function secrets.
- No fake or placeholder data in production builds: App Review rejects it.
- No payments in v1. Do not add Stripe or links to external payment pages: Apple requires In-App Purchase for digital goods.
- Every user-facing string goes through i18n. No hard-coded text in screens.
- No button or row that does nothing: if a feature is not built, it is not shown.
- Documents reach Claude only after the user's AI consent, checked in the Edge Function too.
- Prefer Expo SDK modules that run in Expo Go. Ask before adding any package.
- One feature per branch. Run typecheck and tests before saying a task is done.

## CS50 rules (see docs/cs50.md)
- The essence of the work must be mine. For `src/lib/*` (fit, cost, grades): do not write the code. Explain the approach, review what I write, point out bugs. Write tests only when I ask.
- Elsewhere you can write code, but every file you substantially write or change starts with a comment: `// AI-assisted (Claude Code): <what you did>`. Keep it accurate when you edit the file again.
- Never write or edit README.md sections marked TODO: I write those myself.

## Data rules (see docs/data.md)
- No university logos or crests anywhere: use initials badges (brand colors are allowed).
- No ranking numbers copied from QS, THE or similar: link to the official ranking page instead.

## Working with me
- I am learning to code. When you make a non-obvious choice, explain it in two or three lines.
- Keep replies short. Do not reprint code you did not change.
- For tasks touching more than three files, propose a plan first and wait for my OK.
