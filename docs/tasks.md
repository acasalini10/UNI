# Tasks v1

Who does what, decided once so we don't have to decide again for every task. Tick tasks as they are done. Screen numbers match `flows.md`.

Rule for anything not on this list:
- Touches the database, login, storage, API keys or more than one part of the app → **Claude Code**
- A screen or piece you can check just by looking at the app → **Copilot** (agent mode or a GitHub issue assigned to Copilot)
- Anything in `src/lib/` → **Alessandro** (CS50)

## Week 1: Oct 15 to 21 (setup)
| ✓ | Task | Who |
| --- | --- | --- |
| [x] | Enroll in the Apple Developer Program (individual), Oct 15 | Alessandro |
| [ ] | Apple identity check approved (watch email) | Alessandro |
| [x] | Expo account (add Valeria to it); install Expo Go on iPhone | Alessandro |
| [x] | Replace Next.js with Expo (Expo Router, TypeScript, Jest, ESLint) | Claude Code |
| [x] | Final screen design on the canvas (Oct 17) | Alessandro + Valeria |
| [x] | Export one PNG per screen from the canvas into `docs/screens/` | Alessandro |
| [x] | Supabase dev project, client in `src/data/supabase.ts`, keys in Codespaces secrets | Claude Code |
| [ ] | Database schema with RLS: profiles (incl. step 2 fields, AI consent), programs, scholarships, applications (status, submitted_at), documents, feedback_rounds; private Storage bucket for PDFs | Claude Code |
| [ ] | i18n setup (`i18n-js`, `expo-localization`, `locales/en.json`, `locales/es.json`) | Claude Code |
| [ ] | `src/theme.ts`: colors, fonts, spacing from the design canvas | Copilot |
| [ ] | Tab bar: Programs · Applications · Feedback · Profile | Copilot |
| [ ] | Sign in 1, 1b, 1c: email check, password rules, reset email, Sign in with Apple, Google | Claude Code |
| [ ] | Profile setup screens 2 and 2b | Copilot |
| [ ] | Decide grade conversions for each scale (`business-rules.md` §3) | Alessandro + Valeria |
| [ ] | Review `flows.md` and close every DECIDE item | Alessandro + Valeria |
| [ ] | Program data sheet, 30 to 50 programs (`data.md`), by Oct 25 | Valeria |

## Week 2: Oct 22 to 28 (business rules, Checkpoint 3)
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | `grades.ts` and tests | Alessandro |
| [ ] | `fit.ts` and tests | Alessandro |
| [ ] | `cost.ts` and tests (tuition + fees, no living costs) | Alessandro |
| [ ] | Review of `src/lib` (comments only, no code) | Claude Code |
| [ ] | Import the data sheet (CSV) into Supabase | Claude Code |
| [ ] | Programs screen 3: list, filters, initials badge, label, tuition and fees | Copilot |
| [ ] | Program detail screen 4 (key facts, costs, official link) | Copilot |
| [ ] | Careers screen 8: hide every block without an official source | Copilot |
| [ ] | **Oct 28 checkpoint:** if Programs and fit labels do not work with real data, drop the App Store target and use TestFlight only | Alessandro |

## Week 3: Oct 29 to Nov 2 (applications, feedback, release)
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | TestFlight public link for classmates from Oct 29 (external testing needs a short beta review): track sign-ups and feedback rounds for the defense | Alessandro |
| [ ] | Applications screens 5a, 5b, 9, 10, 11 | Copilot |
| [ ] | Checklist 12 (requirements, documents, Apply, "I've submitted") | Copilot |
| [ ] | PDF upload to Storage and file picker sheet 12d (PDF only, 10 MB) | Claude Code |
| [ ] | My Profile 5 with per-document upload | Copilot |
| [ ] | Feedback function: consent check, daily limit, program requirements in the prompt, Claude API call | Claude Code |
| [ ] | Feedback screens 6a (with AI consent) and 6 | Copilot |
| [ ] | Settings 13 | Copilot |
| [ ] | Deadline reminders (local notifications) | Claude Code |
| [ ] | Delete account (all rows and files) | Claude Code |
| [ ] | Spanish strings in `locales/es.json` | Valeria |
| [ ] | Privacy policy page (names Anthropic for AI feedback), support email | Valeria |
| [ ] | Icon, screenshots, store description (ES and EN) | Valeria + Alessandro |
| [ ] | EAS build, TestFlight test on iPhone, submit to review (Nov 2) | Alessandro, with Claude Code |

## Week 4: Nov 3 to 11
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | Fix review issues | Depends on the issue (rule above) |
| [ ] | Rehearse the live demo | Alessandro + Valeria |

## After Nov 11
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | CS50 README sections, written by me | Alessandro |
| [ ] | CS50 video (max 3 min) and submit50, by Dec 31 | Alessandro |
