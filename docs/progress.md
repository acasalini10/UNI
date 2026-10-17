# Progress

Claude reads this at the start of a session and updates it at the end. Keep it under 40 lines: replace old entries instead of piling them up.

## Milestones
- [ ] Oct 21: Expo app running in Expo Go; Supabase schema with RLS; sign in and profile setup
- [ ] Oct 28 (Checkpoint 3): Programs and detail with real data; fit label and net cost tested
- [ ] Nov 2: Feedback; My Profile; account deletion; store listing; **submit to App Review**
- [ ] Nov 3 to 10: fix review issues; rehearse demo
- [ ] Nov 11: live on the App Store
- [ ] By Dec 31: CS50 README written by me, 3-minute video, submit50 (see `docs/cs50.md`)

## Now
Expo SDK 57 app with Expo Router, TypeScript strict, Jest, ESLint, merged to main. One screen showing "UNI", checked on iPhone with Expo Go.
Dev server: `npx expo start --tunnel` (installs `@expo/ngrok` globally on first run). If the ngrok tunnel fails, make port 8081 public in Codespaces and start with `EXPO_PACKAGER_PROXY_URL=<public 8081 URL> npx expo start`.

Oct 17: screen design final (canvas). `flows.md`, `product.md`, `business-rules.md`, `data.md`, `tasks.md` and `app-store.md` updated to match: Applications tab, profile step 2, AI consent, checklist, no living costs, feedback fully free, Apple and Google sign-in, English and Spanish.

## Next step
Export the screens into `docs/screens/`. Then Supabase dev project and client in `src/data/supabase.ts`, then the first migration.

## Open questions
- GPA conversion for the US 4.0 scale (see `business-rules.md` §3)
- Who collects the 30 to 50 programs (target Oct 25, columns in `docs/data.md`)
- Which student grade scales v1 supports (see `business-rules.md` §3)
- Email content@qs.com to ask permission to show rankings
- Rankings on screen 4: numbers (as on the canvas) or link only (as in `data.md`)? See DECIDE in `flows.md`
- GPA below the program minimum = Not yet eligible: confirm (`business-rules.md` §1)
