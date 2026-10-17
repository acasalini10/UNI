# Product: v1 scope

Goal of v1: a real student downloads UNI from the App Store, sets up a profile, sees real programs labelled by fit with their cost, tracks the applications they start, and gets feedback on a CV or statement. Live by Nov 11, 2026.

## In v1
Screen numbers match `flows.md` and the design canvas.

| Screen | What it does | Business rule |
| --- | --- | --- |
| 1, 1b, 1c Sign in | Email and password (with password rules and reset), Sign in with Apple, Google | |
| 2, 2b Profile setup | Step 1 academic (grade, English, optional GMAT/GRE, fields, countries, start). Step 2 optional: citizenship, origin, budget, who pays | |
| 3 Programs | List with filters, label, tuition and fees per program | Fit label, cost |
| 4 Program detail | Key facts, requirements vs the student, costs and net cost, funding, careers preview, official link | Fit label, net cost |
| 8 Careers | Recruiters, roles, where graduates work, salary, employment rate; only figures with an official source | |
| 5a, 5b, 9, 10, 11 Applications | Programs the student is applying to, with status, progress and days to deadline; add from search | |
| 12 Checklist | Requirements and documents per program; Apply opens the university page; student marks it as submitted | Fit label (requirements) |
| 6a, 6 Feedback | Pick a program, add CV and statement (PDF), give AI consent once, get all issues ranked by priority | Daily limit |
| 5 My Profile | Academic profile, budget and funding, documents (PDF upload) | |
| 13 Settings | Account, deadline reminders, language, AI consent switch, support links, log out, delete account | |

App languages: English and Spanish.

## Users
International students of any nationality applying to master's programs abroad. The course case tests the market in Mexico first; the app itself is not limited to Mexican students.

## Data for v1
30 to 50 real programs, each with its official URL and the date it was checked. Countries: USA, UK, Spain, Netherlands (fee-charging systems from Checkpoint 2). No sample data, no logos, no copied ranking numbers: see `data.md`.

## Out of v1, and why
| Feature | Why it waits |
| --- | --- |
| Pass purchase, any paywall | Apple requires In-App Purchase for digital goods; IAP does not fit 4 weeks. Feedback is fully free in v1 |
| "Send to a parent to pay" | External payment link, not allowed on the Mexican storefront |
| CV and motivation letter builders | Pass features, after payments |
| Sponsored placements (B2B) | Shares student data with universities; starts after a user base exists |
| Living costs in totals | Estimates that vary by student; v1 shows only tuition and university fees |
| Notifications other than deadline reminders | Not built in v1; no switch without a feature behind it |
| Face ID, cost-currency setting, "Download my data" | Not built in v1 |
| Admission probability | No outcome data to support it |
| Android | iOS first |
| University logos | Trademarks without permission; App Review risk |
| Bachelor's and PhD programs | Different requirements; master's first |
