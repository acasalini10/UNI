# Tasks v1

Who does what, decided once so we don't have to decide again for every task. Tick tasks as they are done.

Rule for anything not on this list:
- Touches the database, login, API keys or more than one part of the app → **Claude Code**
- A screen or piece you can check just by looking at the app → **Copilot** (agent mode or a GitHub issue assigned to Copilot)
- Anything in `src/lib/` → **Alessandro** (CS50)

## Week 1: Oct 15 to 21 (setup)
| ✓ | Task | Who |
| --- | --- | --- |
| [x] | Enroll in the Apple Developer Program (individual), Oct 15 | Alessandro |
| [ ] | Apple identity check approved (watch email) | Alessandro |
| [ ] | Expo account (add Valeria to it); install Expo Go on iPhone | Alessandro |
| [ ] | Replace Next.js with Expo (Expo Router, TypeScript, Jest, ESLint) | Claude Code |
| [ ] | Supabase dev project, client in `src/data/supabase.ts`, keys in Codespaces secrets | Claude Code |
| [ ] | Database schema with RLS: profiles, programs, scholarships, saved_programs, feedback_rounds | Claude Code |
| [ ] | `src/theme.ts`: colors, fonts, spacing from the design canvas | Copilot |
| [ ] | Sign up, sign in, sign out (email and password) | Claude Code |
| [ ] | Profile setup screen (form, saves to `profiles`) | Copilot |
| [ ] | Decide grade conversions for each scale (`business-rules.md` §3) | Alessandro + Valeria |
| [ ] | Review `flows.md` and close every DECIDE item | Alessandro + Valeria |
| [ ] | Program data sheet, 30 to 50 programs (`data.md`), by Oct 25 | Valeria |

## Week 2: Oct 22 to 28 (business rules, Checkpoint 3)
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | `grades.ts` and tests | Alessandro |
| [ ] | `fit.ts` and tests | Alessandro |
| [ ] | `cost.ts` and tests | Alessandro |
| [ ] | Review of `src/lib` (comments only, no code) | Claude Code |
| [ ] | Import the data sheet (CSV) into Supabase | Claude Code |
| [ ] | Programs screen: list, filters, initials badge, label, net cost | Copilot |
| [ ] | Program detail screen | Copilot |
| [ ] | **Oct 28 checkpoint:** if Programs and fit labels do not work with real data, drop the App Store target and use TestFlight only | Alessandro |

## Week 3: Oct 29 to Nov 2 (feedback and release)
| ✓ | Task | Who |
| --- | --- | --- |
| [ ] | TestFlight public link for classmates from Oct 29 (external testing needs a short beta review): track sign-ups and feedback rounds for the defense | Alessandro |
| [ ] | Feedback function: PDF upload to Storage, Claude API call, first issue free | Claude Code |
| [ ] | Feedback screen | Copilot |
| [ ] | My Profile screen: saved programs, status, days to deadline | Copilot |
| [ ] | Delete account | Claude Code |
| [ ] | Privacy policy page, support email | Valeria |
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
