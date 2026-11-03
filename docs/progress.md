# Progress

Claude reads this at the start of a session and updates it at the end. Keep it under 40 lines: replace old entries instead of piling them up.

## Milestones
- [ ] Oct 21: Expo app running in Expo Go; Supabase schema with RLS; sign in and profile setup
- [ ] Oct 28 (Checkpoint 3): Programs and detail with real data; fit label and net cost tested
- [ ] ~~Nov 2: submit to App Review~~ Dropped Nov 3: TestFlight only (decision 2026-11-03)
- [ ] By about Nov 7: TestFlight build with external testing beta review submitted
- [ ] Nov 3 to 10: fix issues; rehearse demo
- [ ] Nov 11: live demo on a TestFlight build
- [ ] By Dec 31: CS50 README written by me, 3-minute video, submit50 (see `docs/cs50.md`)

## Now
Expo SDK 58 app (Expo Router, TypeScript 6 strict, Jest 30, ESLint), Supabase schema with RLS, i18n (en; es falls back to en), design tokens in `src/theme.ts`, Plus Jakarta Sans loaded in the root layout. Main has all of this up to PR #7.
`package.json` overrides `react-dom` with `$react-dom`. `expo start` regenerates `tsconfig.json`; the regenerated file is committed. TypeScript 6 no longer loads `@types/jest` globally: test files start with `/// <reference types="jest" />`. If lint reports a stale "unresolved import", run `npx eslint --no-cache .`.
Dev server: `npx expo start --tunnel` from the repo root (not from a subfolder). If the ngrok tunnel fails, make port 8081 public in Codespaces and start with `EXPO_PACKAGER_PROXY_URL=<public 8081 URL> npx expo start`.

Oct 17: screen design final (canvas); docs updated to match. Oct 18: Supabase client and initial schema with RLS. Oct 28: i18n; SDK 58. Oct 29: design tokens and fonts.
Nov 3: PR #7 (theme) merged. Oct 28 checkpoint decided: TestFlight only; Google sign-in postponed. Email sign-in on `feat/auth-email`, PR #8 open: screens 1, 1b, 1c and new 1d (reset by 6-digit code) in `app/(auth)/`, session guard in `app/_layout.tsx` (`Stack.Protected` with `redirectTo`), shared components in `src/components/`, `src/data/auth.ts`, `src/data/session.ts`, `email_exists()` migration pushed to the dev project, icons from `expo-symbols`. Alessandro wrote `src/lib/password.ts` and `src/lib/email.ts`; Claude wrote their tests (15 pass). Tested on iPhone: sign-up, wrong password, reset by code. Placeholder home (`app/index.tsx`) has a dev-only Sign out.
Supabase dashboard (set by hand): Confirm email off; password min 8, "Letters and digits"; custom SMTP via a dedicated Gmail with an app password; reset template shows `{{ .Token }}`.

## Next step
Merge PR #8. Then give Copilot the tab bar prompt (from the Nov 3 session; it replaces `app/index.tsx` with `app/(tabs)/` and moves the dev Sign out to Profile). Claude Code: Sign in with Apple on `feat/auth-apple`. Terms and Privacy links on screen 1 once Alessandro has the page URLs. Plan the TestFlight build for about Nov 7.

## Open questions
- Who collects the 30 to 50 programs (target Oct 25, columns in `docs/data.md`)
- Email content@qs.com to ask permission to show QS rankings (numbers are shown from Oct 17; remove them if QS refuses)
