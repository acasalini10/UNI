# Flows v1

Every screen, every tap, every state. The visual design is the canvas; screenshots go in `docs/screens/`, named by screen number (for example `4-program-detail.png`). Numbers below match the canvas. Build a screen only when its section has no open question. Items marked **DECIDE** are open.

## Rules for every screen
- Tab bar: **Programs · Applications · Feedback · Profile**.
- All text through i18n (`en`, `es`).
- Uploads: PDF only, max 10 MB, from My Profile or the phone (iOS file picker).
- Costs = tuition + university fees. Living costs are never shown in totals.
- Every visible button or row works. If it does not work in v1, it is not in the build.
- States to handle on every data screen: loading, empty, error, no connection.

## Navigation map
```
App start
├─ not signed in ─► 1 Sign in
│                    ├─ Continue with email ─► new email → 1b Set password → 2 Profile → 2b → 3 Programs
│                    │                         existing  → 1c Sign in → 3 Programs (or 2 if setup not finished)
│                    └─ Apple / Google ──────► 2 Profile (first time) or 3 Programs
└─ signed in ─────► 3 Programs

3 Programs ─► 4 Program detail ─► 8 Careers · 6a Feedback · official page (browser)
5a Applications ─► 9 Add a university ─► 10 Its master's ─► 11 Applications (card added)
5a / 11 ─► 12 Checklist ─► 12d Choose a file · university application page (browser)
6a Feedback start ─► 6 Feedback results
5 My Profile ─► 2 / 2b (edit) · 13 Settings ─► 1 Sign in (log out)
```

## 1 · Sign in
| Element | Tap goes to |
| --- | --- |
| Email + Continue with email | Checks the email: new → 1b, existing → 1c |
| Continue with Apple | Apple sign-in, then 2 (first time) or 3 |
| Continue with Google | Google sign-in, then 2 (first time) or 3 |
| Terms, Privacy Policy | Browser |
States: invalid email, no connection, loading.
**DECIDE:** email confirmation required before using the app? (Simpler: no.)

## 1b · Set password (new account)
Email shown with "Change" → 1. Password and Confirm password, each with show/hide.
Rules under the first field, each turns green when met: 8+ characters, one number, one uppercase letter.
"Passwords don't match" when Confirm differs. **Continue** disabled until rules are met and both match → 2.

## 1c · Sign in (existing account)
"Welcome back", email with "Change" → 1. Password with show/hide.
| Element | Tap goes to |
| --- | --- |
| Forgot password? | Supabase reset email; banner "We sent a link…" |
| Sign in | 3 Programs |
States: wrong password ("Wrong password. Try again or reset it."), no connection, loading.

## 2 · Profile setup, step 1 of 2 (academic)
First name, last name, country you live in, current university, currently studying, fields you want to study, grade + grade scale (`10`, `4.0`, `100`, `30`, `uk_class`, Other), English test (IELTS score or "not taken yet"), **GMAT or GRE (optional)**, target countries (up to 3), planned start. Hint with typical deadlines for that start.
| Element | Tap goes to |
| --- | --- |
| Continue | 2b (only if step 1 is valid) |
| Back | 1 (first setup) or 5 (editing) |
States: missing required field, saving, save error. Closing the app halfway resumes at the same step.
**DECIDE:** without an IELTS score, which label? (Proposal: "Not yet eligible" with "Add your English score" hint.)

## 2b · Profile setup, step 2 of 2 (budget and funding, all optional)
Subtitle says why we ask: citizenship and origin find scholarships; budget and payer help us understand who uses UNI. Nothing is shared.
Citizenship (+ add a second), country of origin, info box on EU home fees. Budget for tuition and fees (chips: under 10k, 10–25k, 25–50k, over 50k, not sure; currency selectable). Who will pay (multi: me, family, scholarship, loan, not sure). Scholarship hint based on citizenship.
| Element | Tap goes to |
| --- | --- |
| Show my programs | 3 |
| Skip for now | 3 (nothing saved) |
| Back | 2 |

## 3 · Programs (tab)
Header: one-line profile summary + "Edit" → 2.
Filters: country, field, fit, max cost, deadline. Sort: best fit (default), lowest cost, nearest deadline.
Count per label (Match, Reach, Not yet eligible).
Each card: initials badge, university, program, country and length, label, one-line reason, **tuition and fees, full program**, deadline.
| Element | Tap goes to |
| --- | --- |
| Card | 4 Program detail |
| Bookmark on card | Adds to Applications as "Saved", stays on list |
| Filter chip | Bottom sheet with options |
| Reset | Clears filters |
States: loading, no programs match filters ("Clear filters"), grade scale "Other" (cards without labels + banner), no connection.

## 4 · Program detail (4b = scrolled, header pinned)
Sections in order: campus image, badge, university, city · label, title, school, length, language · key facts **Deadline · Tuition · Application fee** · requirements vs you (GPA, English, background) with the reason for the label and "This is not an admission probability" · application timeline (opens, deadline, decisions, start) and requirements list · rankings · careers preview (top recruiters, top roles) · what it costs (tuition, university fees, total, grants, **net cost**, "Living costs are not included") · funding · "Checked on <date> · official page".
| Element | Tap goes to |
| --- | --- |
| Back | 3 (same scroll position and filters) |
| Bookmark | Save / unsave in Applications |
| Share | iOS share sheet with the official URL |
| See all (Careers) | 8 |
| Check official web page | Browser (domain shown under the link) |
| Get feedback on my application | 6a with this program preselected |
Rankings: a grid with University and Program rows, national and world columns. Each cell shows the rank as published, the ranking name and year, and opens the ranking page in the browser. A cell without data is left out (see `data.md`).

## 5 · My Profile (tab)
Header: name, university, gear → 13.
| Element | Tap goes to |
| --- | --- |
| Academic profile · Edit | 2 |
| Budget and funding · Edit | 2b |
| Upload on CV / Motivation letters / Reference letters | iOS file picker (PDF) |
Each document row shows its status: Ready, number of drafts, or received count (2 / 3).
States: upload failed, wrong file type, file too large.

## 5a · Applications (tab)
Counters: universities, applied, days to next deadline.
My universities: one card per saved program with status (Saved, In progress %, Submitted) and progress bar.
| Element | Tap goes to |
| --- | --- |
| Card | 12 Checklist |
| Add / Add a university | 9 |
States: empty (5b), loading, no connection.

## 5b · Applications, empty
Counters 0, 0, "–". Card "No universities yet" explaining checklist, reminders and one-tap apply.
| Element | Tap goes to |
| --- | --- |
| Add a university | 9 |
| Browse programs that fit you | 3 |

## 6a · Feedback (tab), start
1. Program to check against (from Applications; if none: "Add a university first" → 9).
2. CV and statement of purpose (PDF, from My Profile or the phone).
3. AI consent: documents are sent to Claude (Anthropic) only to generate feedback; link "How we handle your documents"; checkbox. Asked once, stored on the account, same switch as in 13.
**Get feedback** disabled until both documents and consent; helper text says what is missing → 6 (loading 15–30 s).
States: wrong file type, file too large, analysis failed (retry), daily limit reached.
**DECIDE:** rounds per user per day (proposal: 3, controls API cost).

## 6 · Feedback results
Documents checked and program name. All issues shown, each with a priority badge (**Fix first**, **Improve**). No locked issues in v1.
| Element | Tap goes to |
| --- | --- |
| Upload a new version (PDF) | 6a |
| Past rounds | List of previous results |

## 8 · Careers
Companies that hire graduates (2–3 roles each), where graduates work by continent (donut + legend), average salary (gross per year), % employed within 3 months, source link.
Only figures published by an official source (see `data.md`). A block without a source is hidden; if no block has a source, the "See all" link in 4 is hidden.

## 9 · Add a university
Search by name or city, live results (badge, name, city), clear button.
| Element | Tap goes to |
| --- | --- |
| Result | 10 |
| Cancel | 5a |
States: no match ("Check the spelling, or search by city").

## 10 · University's master's
University header, filter chips (All, Fits you, by area). Each row: label, program, faculty, length, deadline.
| Element | Tap goes to |
| --- | --- |
| Row | Adds the program to Applications → 11 |
| Back | 9 |

## 11 · Applications, card added
Same as 5a with banner "Added to your applications" + **Undo** (removes it), new card highlighted on top.

## 12 · Checklist (12a incomplete, 12b ready, 12c applied)
Header: program, status chip, deadline chip with days left.
Requirements vs you: only those the program asks for (GPA, English, GMAT/GRE…). Met = green check; missing = empty dashed circle and "Not added".
Documents: CV, Motivational letter, Reference letters (count, e.g. 1/2). Missing → **Upload** → 12d; done → "Ready".
| State | Bottom of the screen |
| --- | --- |
| 12a incomplete | Apply grey and disabled, "N items missing" |
| 12b ready | **Apply on <university>'s website** → browser; **I've submitted my application** → 12c |
| 12c applied | "Applied" with check, not tappable, submission date |
"Applied" is set by the student; the app cannot see the university's portal.

## 12d · Choose a file (sheet over 12)
From My Profile: files of that type, single select. Or **Upload a new PDF from your phone** (also saved to My Profile). **Use selected file** attaches it and closes the sheet. Close (×) cancels.

## 13 · Settings
| Group | Rows |
| --- | --- |
| Account | Name, Email, Change password |
| Notifications | Deadline reminders (local notifications, 30/7/1 days before) |
| Preferences | Language (English, Español) |
| Privacy and security | AI feedback on my documents (consent switch) |
| Support | Help center, Contact us (`mailto:`), Terms of service, Privacy policy |
| Bottom | Log out → 1 · Delete account (red): confirm alert, delete all user data on the server, then 1 |
