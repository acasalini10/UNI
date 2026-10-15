# Flows v1

Every screen, every tap, every state. Not visual design (that is the canvas). Build a screen only when its section here has no open question. Items marked **DECIDE** are open.

## Navigation map
```
App start
├─ not signed in ──────────► Welcome
│                              ├─ Sign up ─► Profile setup (2 steps) ─► Programs
│                              └─ Sign in ─► Programs (or Profile setup if not finished)
└─ signed in ──────────────► Programs

Tabs (bottom bar): Programs · Feedback · Profile
Programs ─► Program detail ─► official page (browser) / ranking page (browser)
Profile ─► Edit profile (same form as setup) · Settings ─► Sign out / Delete account
```
The Apply tab is removed in v1 (see `product.md`).

## Welcome
| Element | Tap goes to |
| --- | --- |
| Sign up | Sign up |
| Sign in | Sign in |
| Terms, Privacy | Browser |

## Sign up / Sign in
Fields: email, password (min 8). Sign in also has "Forgot password" → email with reset link.
States: wrong password, email already used, no connection, loading.
**DECIDE:** email confirmation required before using the app? (Simpler: no.)

## Profile setup (2 steps, progress bar)
Step 1: name, country of citizenship, current university, current degree and field.
Step 2: grade + grade scale (`10`, `4.0`, `100`, `30`, `uk_class`, Other), English test (IELTS score, or "not taken yet"), fields of interest (multi-select), target countries (multi-select), planned start (term + year).
| Element | Tap goes to |
| --- | --- |
| Next | Step 2 (only if step 1 is valid) |
| Back | Step 1 |
| Finish | Programs |
States: missing required field, saving, save error. Closing the app halfway resumes at the same step.
**DECIDE:** without an IELTS score, which label? (Proposal: "Not yet eligible" with "Add your English score" hint.)

## Programs (tab)
Header: one-line profile summary + "Edit" → Edit profile.
Filters: country, field, fit, max net cost, deadline. Sort: best fit (default), lowest cost, nearest deadline.
Each card: initials badge, university, program, country, label, net cost, deadline.
| Element | Tap goes to |
| --- | --- |
| Card | Program detail |
| Bookmark on card | Saves to My universities (Profile), stays on list |
| Filter chip | Bottom sheet with options |
| Reset | Clears filters |
States: loading, no programs match filters ("Clear filters"), grade scale "Other" (cards without labels + banner), no connection.

## Program detail
Sections: header (badge, names, label, "This is not an admission probability"), requirements vs you (GPA, IELTS, background), costs (tuition, living, grants, net cost; loans apart), deadlines, "Checked on <date> · official page".
| Element | Tap goes to |
| --- | --- |
| Back | Programs (same scroll position and filters) |
| Bookmark | Save / unsave |
| Official page | Browser |
| See ranking | Ranking site in browser |
| Get feedback for this program | Feedback with this program preselected |
| Share | iOS share sheet with the official URL |

## Feedback (tab)
1. Pick a target program (from saved ones; if none, "Save a program first" → Programs).
2. Upload CV and/or statement (PDF, max 5 MB).
3. Analyse → result: number of issues found, first issue in full, others locked "Coming soon".
| Element | Tap goes to |
| --- | --- |
| Upload | iOS file picker |
| Analyse | Loading (15–30 s), then result |
| Past rounds | List of previous results |
States: wrong file type, file too large, analysis failed (retry), daily limit reached.
**DECIDE:** rounds per user per day (proposal: 3, controls API cost).

## Profile (tab)
Header: name, university, edit profile. Counters: saved, applied, days to next deadline.
My universities: saved programs with status (Saved, In progress, Submitted, Result), tap status to change it.
| Element | Tap goes to |
| --- | --- |
| Program row | Program detail |
| Status chip | Status picker |
| Settings (gear) | Settings: Sign out · Delete account (confirm, then Welcome) · Privacy · Contact |
States: no saved programs ("Find programs" → Programs).
