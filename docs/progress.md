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
Expo SDK 58 app (upgraded from 57 on Oct 28 because Expo Go supports only 58) with Expo Router, TypeScript strict, Jest 30, ESLint, on main. One screen showing "UNI" through i18n, checked on iPhone with Expo Go.
`package.json` overrides `react-dom` with `$react-dom`, so the version jest-expo pulls in always matches the direct dependency. `app.json` sets `web.output: "static"`.
`expo start` regenerates `tsconfig.json` (drops `.expo/types` and `expo-env.d.ts` from `include`); the regenerated file is committed.
Dev server: `npx expo start --tunnel` (installs `@expo/ngrok` globally on first run). If the ngrok tunnel fails, make port 8081 public in Codespaces and start with `EXPO_PACKAGER_PROXY_URL=<public 8081 URL> npx expo start`.

Oct 17: screen design final (canvas). `flows.md`, `product.md`, `business-rules.md`, `data.md`, `tasks.md` and `app-store.md` updated to match: Applications tab, profile step 2, AI consent, checklist, no living costs, feedback fully free, Apple and Google sign-in, English and Spanish.

Oct 18: Supabase client (`src/data/supabase.ts`) and initial schema with RLS merged.
Oct 28: i18n set up (`src/i18n.ts`, `locales/en.json`, `locales/es.json`); screens use `t("key")`. Upgraded to SDK 58, merged to main, app checked on iPhone. Behind schedule on the Oct 28 checkpoint: no data sheet in the repo, `src/lib` not started.
Oct 29: design tokens from the canvas in `src/theme.ts` (colors, fit label colors, Plus Jakarta Sans fonts, typography, spacing, radius, sizes, layout), on branch `feat/theme`, PR opened Nov 3. Root layout loads the five Plus Jakarta Sans weights (`@expo-google-fonts/plus-jakarta-sans`, `expo-font`), keeps the splash screen up until they load, and sets the `colors.bg` background and a light status bar.

## Next step
Merge the `feat/theme` PR. Then: sign-in screens 1, 1b, 1c with email on `feat/auth-email`, then Apple (Claude Code); tab bar (Copilot). Terms and Privacy links on screen 1 are added once Alessandro has the page URLs.

## Open questions
- Who collects the 30 to 50 programs (target Oct 25, columns in `docs/data.md`)
- Email content@qs.com to ask permission to show QS rankings (numbers are shown from Oct 17; remove them if QS refuses)
