# Product: v1 scope

Goal of v1: a real student downloads UNI from the App Store, sets up a profile, sees real programs labelled by fit with net cost, and gets feedback on a CV or statement. Live by Nov 11, 2026.

## In v1
| Screen | What it does | Business rule |
| --- | --- | --- |
| Sign in | Email and password (Supabase Auth). Sign out, delete account. | |
| Profile setup | Background, GPA, IELTS, fields, target countries, start date | |
| Programs | List with filters (country, field, fit, cost), label and net cost per program | Fit label, net cost |
| Program detail | Requirements vs the student, deadlines, net cost, official link | Fit label, net cost |
| My Profile | Saved programs with status and days to the next deadline | |
| Feedback | Upload CV or statement (PDF), get the first issue free, rest locked | Paywall |

## Users
International students of any nationality applying to master's programs abroad. The course case tests the market in Mexico first; the app itself is not limited to Mexican students.

## Data for v1
30 to 50 real programs, each with its official URL and the date it was checked. Countries: USA, UK, Spain, Netherlands (fee-charging systems from Checkpoint 2). No sample data, no logos, no copied ranking numbers: see `data.md`.

## Out of v1, and why
| Feature | Why it waits |
| --- | --- |
| Pass purchase | Apple requires In-App Purchase for digital goods; setting up IAP and its review risk does not fit 4 weeks |
| "Send to a parent to pay" | Same reason: an external payment link is not allowed on the Mexican storefront |
| Apply tab | My Profile already tracks applications |
| CV and motivation letter builders | Pass features, after payments |
| Sponsored placements (B2B) | Starts after a user base exists |
| Google and Apple sign-in | Google sign-in alone would require Apple sign-in too; email only keeps v1 simple |
| Admission probability | No outcome data to support it |
| Android | iOS first |
| University logos | Trademarks without permission; App Review risk |
| Ranking numbers | QS and others require a licence for commercial use; v1 links to the ranking page |
| Bachelor's and PhD programs | Different requirements; master's first |
