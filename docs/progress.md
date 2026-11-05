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
Nov 3: PR #7 (theme), #8 (email sign-in 1, 1b, 1c, 1d with reset by 6-digit code; session guard in `app/_layout.tsx`; `email_exists()` migration; Alessandro wrote `src/lib/password.ts` and `src/lib/email.ts`, Claude wrote their tests), #9 (four tabs, Copilot) merged. Checkpoint decided: TestFlight only; Google sign-in postponed. PR #10 merged: Sign in with Apple (native sheet + `signInWithIdToken`, name saved to `profiles` on first sign-in, bundle ID `com.acasalini.uni` registered as an App ID).
Nov 5: PR #11 open (Copilot): profile setup 2 and 2b in `app/(auth)/profile-setup.tsx` and `profile-funding.tsx`, `src/data/profile.ts`. PR #12 open: `eas.json` (production profile, build number kept by EAS), encryption flag and EAS `projectId` in `app.json`. First production build done: Alessandro ran it with `npx eas-cli` (no global `eas` command; already logged in as `acasalini10`), EAS created and stores the distribution certificate and provisioning profile. Not yet submitted to App Store Connect. `assets/icon.png` is still the Expo template icon.
Supabase dashboard (set by hand): Apple provider on, Client IDs `host.exp.Exponent,com.acasalini.uni` (no secret key); Confirm email off; password min 8, "Letters and digits"; custom SMTP via a dedicated Gmail with an app password; reset template shows `{{ .Token }}`.

## Next step
Merge PR #11 and #12. Alessandro: `npx eas-cli submit -p ios --latest` (let EAS create the App Store Connect app record and API key), add himself as an internal tester, install from TestFlight. External beta review as soon as the build shows up in TestFlight; it needs a privacy policy URL (Valeria) and a demo account; Claude Code can draft the beta description and review notes. Claude Code: route a first-time Apple or email user to screen 2 instead of the tabs; Terms and Privacy links on screen 1 once the page URLs exist; import the program data sheet when Valeria has it. Copilot: Programs 3 and 4.

## Open questions
- Who collects the 30 to 50 programs (target Oct 25, columns in `docs/data.md`)
- Email content@qs.com to ask permission to show QS rankings (numbers are shown from Oct 17; remove them if QS refuses)
