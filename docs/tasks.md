# Tasks v1

Who does what. The first open row of **Next up** is the next task. Tick a row when it is done and move it to **Done** at the end of the session. Screen numbers match `flows.md`.

Rule for anything not on this list:
- Anything in `src/lib/` → **Alessandro** (CS50)
- Everything else in the code → **Claude Code** (screens moved from Copilot on Nov 9: nothing had started and the demo is on Nov 18)
- Copilot only for small UI fixes Alessandro assigns by hand

## Next up: to the Nov 18 demo (in order)
| ✓ | When | Task | Who |
| --- | --- | --- | --- |
| [x] | Nov 12–13 | Applications screens 5a, 5b, 9, 10, 11 (#39; cards open 4 until 12 exists) | Claude Code |
| [x] | Nov 12–13 | Checklist 12 (requirements, documents, Apply, "I've submitted") and file picker sheet 12d (reuses `pickAndUploadDocument`); cards on 5a open 12; `checklist.ts` by Claude, cited, with tests | Claude Code |
| [x] | Nov 13–14 | Feedback Edge Function: consent check, 3 rounds a day, program requirements in the prompt, Claude API call | Claude Code |
| [x] | Nov 13–14 | Feedback screens 6a (with AI consent) and 6 | Claude Code |
| [x] | Nov 14 | "Get feedback on my application" on Program detail 4 (opens 6a with the program) and AI consent switch in Settings 13 | Claude Code |
| [x] | Nov 15 | Deadline reminders (local notifications): 30, 7, 1 day before at 9:00; switch in Settings 13 | Claude Code |
| [ ] | Optional | Careers data: figures from official career outcome reports for 5–8 demo programs (companies and roles, share by continent, average salary with currency, % employed within 3 months, report URL and year); no estimates (`data.md`) | Alessandro |
| [ ] | Optional, after the data | Careers 8: migration (`program_careers`, `program_recruiters`, `program_regions`, RLS read-only), CSV sheets + `generate-seed.mjs`, `src/data/careers.ts`, screen with every block hidden without a source, preview and "See all" on 4. To decide first: donut (`react-native-svg`) or segmented bar; salary in the report's currency only or also "≈" (`business-rules.md` §7) | Claude Code |
| [ ] | Nov 16–17 | Production build, TestFlight install, fixes | Alessandro, with Claude Code |
| [ ] | Nov 17 | Rehearse the live demo | Alessandro + Valeria |

## In parallel (not code)
| ✓ | Task | Who |
| --- | --- | --- |
| [x] | TestFlight build with #11, #16, #21 sent to external beta review (build log must show both `EXPO_PUBLIC_SUPABASE_*` variables; demo account with 2 and 2b filled; Test Information checked against `app-store.md`) | Alessandro |
| [x] | TestFlight public link for classmates (open; shared at the demo); track sign-ups and feedback rounds for the defense | Alessandro |
| [x] | UK class values: the student's class keeps the middle of the band (First 9.5, 2:1 8.5, 2:2 7.5, Third 6.5); a program's minimum class uses the bottom of the band (9, 8, 7, 6). Changed in `grades.ts` by Claude Code (decision 2026-11-11) | Alessandro, with Claude Code |
| [x] | Program data: costs checked on the official pages, `cost_unit` only `total` or `per_year`, `fees_total` blank when not published (0 if included); Carnegie Mellon removed, 30 programs (decision 2026-11-11). Duke and Oxford deadlines, `checked_by` and the two IE universities stay as they are (decision 2026-11-06) | Alessandro |
| [ ] | Program data: check University College London, MSc Management (UCL pages did not open on Nov 11): tuition, `fees_total` (still 0), `cost_unit` (still the default `total`) | Valeria |
| [x] | Spanish strings: switch `locales/es.json` from Spain forms ("máster", "nota") to Mexican Spanish | Valeria |
| [ ] | Screenshots and store description (ES and EN) | Valeria + Alessandro |
| [ ] | Email content@qs.com for permission to show QS rankings | Alessandro |

## After the demo
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | Revoke the Sign in with Apple token on Delete account (before App Store release, decision 2026-11-08) | Claude Code |
| [ ] | Google sign-in (postponed, decision 2026-11-03) | Claude Code |
| [ ] | Settings 13: remaining rows (Language) as their features exist; AI consent switch done | Claude Code |
| [ ] | CS50 README sections, written by me | Alessandro |
| [ ] | Rewrite the Nov 11 UK class change in `src/lib/grades.ts` myself before the CS50 submission (written by Claude Code for lack of time) | Alessandro |
| [ ] | CS50 video (max 3 min) and submit50, by Dec 31 | Alessandro |

## Done
| Date | Task | Who |
| --- | --- | --- |
| Oct 15 | Apple Developer Program enrolled; identity check approved | Alessandro |
| Oct 15 | Expo account (Valeria added); Expo Go on iPhone | Alessandro |
| Oct 15 | Next.js replaced with Expo (Expo Router, TypeScript, Jest, ESLint) | Claude Code |
| Oct 17 | Final screen design on the canvas; one PNG per screen in `docs/screens/` | Alessandro + Valeria |
| Oct 18 | Supabase project and client; schema with RLS; private Storage bucket for PDFs | Claude Code |
| Oct 28 | i18n setup; upgrade to Expo SDK 58 | Claude Code |
| Oct 29 | `src/theme.ts` (colors, fonts, spacing) | Copilot |
| Nov 3 | Tab bar (#9) | Copilot |
| Nov 3 | Sign in 1, 1b, 1c, 1d (#8) and Sign in with Apple (#10) | Claude Code |
| Nov 3 | Oct 28 checkpoint decided: TestFlight only | Alessandro |
| Nov 5 | Profile setup 2 and 2b (#11); first-time routing (#17) | Copilot, Claude Code |
| Nov 5 | Settings 13 minimal: email, Log out (#16); Terms and Privacy (#24); Delete account (#28) | Claude Code |
| Nov 5 | `eas.json`, certificates, first production builds on TestFlight internal testing (#12, #20, #21) | Alessandro, with Claude Code |
| Nov 5 | App icon (#18) | Valeria + Alessandro |
| Nov 5 | Privacy policy page, support email (#19) | Valeria |
| Nov 6 | Terms of service (#23); country pickers on 2 and 2b (#25) | Claude Code |
| Nov 6 | Program data sheet: 31 programs, 24 universities, imported into Supabase (#26) | Valeria, Claude Code |
| Nov 8 | Delete account: Edge Function, all rows and files (#28) | Claude Code |
| Nov 9 | Business rules closed: grade conversion, missing minimums, cost display, currency (#29) | Alessandro + Valeria |
| Nov 9 | Every DECIDE item in `flows.md` closed | Alessandro + Valeria |
| Nov 9 | Display currency: `profiles.currency`, picker on 2b, row on the Profile tab, `rates.json`; tested in Expo Go | Claude Code |
| Nov 9 | `grades.ts`, `fit.ts`, `cost.ts` (#30); review and tests by Claude Code at Alessandro's request | Alessandro |
| Nov 9 | Cost unit per program (`programs.cost_unit`, nullable `fees_total`); `getCardCost` by Alessandro (#33) | Claude Code, Alessandro |
| Nov 9 | Programs 3: list, filters, sort, fit labels, published cost with "≈" (#34); tested in Expo Go | Claude Code |
| Nov 9 | Program detail 4: key facts, requirements vs you, costs, official page (#35); tested in Expo Go | Claude Code |
| Nov 10 | Missing #33–#35 commits brought to `main` (#36) | Claude Code |
| Nov 10 | PDF upload to Storage and My Profile 5 with Edit on 2 and 2b (#37); tested in Expo Go | Claude Code |
