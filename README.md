# UNI
#### Video Demo: https://www.youtube.com/watch?v=VQ2BGbEdDfo
#### Description:

Over the last year I found out that finding the right master's degree abroad is surprisingly hard. You go to a university's website and look for the master's programs you are interested in, so you end up with many tabs open. You read very long PDFs about admissions just to find the English level or the test score required. And that is for a single university with more than one program you like: now imagine doing it for ten universities. On top of that, nobody can tell you how competitive your profile is.

After living this problem myself, I wondered why there was no tool that simply collects programs from around the world, with clear information and requirements, so you can see whether you are eligible and competitive, and then improve your application. That is how UNI was born.

## What it does

UNI is an iOS app for international students of any nationality who want to study abroad. Version 1 covers master's programs. A student enters their grades, English test score, fields of interest and target countries once. UNI then shows real programs, taken from the universities' official pages, each with a fit label (Safety, Match, Reach, Not yet eligible or Not rated) that compares the student's profile with the program's published minimums, and with the cost the university publishes.

The student can save programs to the Applications tab, where a checklist shows which requirements are met and which documents are still missing. When nothing is missing, they open the official application page and mark the application as submitted. In the Feedback tab, after giving explicit consent, they upload their CV and statement as PDFs and get AI feedback on what to fix for one specific program, up to 3 times a day. The app also sends local reminders 30, 7 and 1 day before each deadline, and works in English and Spanish.

## Files

### Screens (`app/`)
Each file in `app/` is one screen (Expo Router). Folders in parentheses group screens without appearing in the route.
- `app/_layout.tsx`: decides which screens the user can see. Signed-out users see only the sign-in screens; signed-in users who have not completed their profile see the profile setup; everyone else sees the four tabs and the screens inside them.
- `app/index.tsx`: the start route. It redirects to Programs, and the rules in `_layout.tsx` then send the user to sign-in or profile setup if needed.
- `app/(auth)/_layout.tsx`: the container for the sign-in screens.
- `app/(auth)/sign-in.tsx`: email entry for every user, plus Sign in with Apple. A registered email goes to the password screen, a new one to create a password.
- `app/(auth)/password.tsx`: password for an existing account, with "Forgot password?".
- `app/(auth)/set-password.tsx`: creates a new account with a password.
- `app/(auth)/reset-password.tsx`: after "Forgot password?", the user enters the code received by email and a new password.
- `app/(setup)/_layout.tsx`: the container for the two profile setup screens.
- `app/(setup)/profile-setup.tsx`: the required academic profile: current university, grade and grading scale, IELTS, GMAT/GRE, fields, target countries and start date.
- `app/(setup)/profile-funding.tsx`: the optional second step: citizenship, country of origin, currency, budget and who pays.
- `app/(tabs)/_layout.tsx`: the tab bar with Programs, Applications, Feedback and Profile.
- `app/(tabs)/programs.tsx`: the list of programs with fit label, cost and deadline, with filters and sorting.
- `app/program/[id].tsx`: program detail: each requirement compared with the student's profile, costs, deadline and a preview of career outcomes.
- `app/careers/[id].tsx`: career outcomes of a program, when the university publishes them, always with the source.
- `app/(tabs)/applications.tsx`: the saved applications with their status.
- `app/add-university.tsx`: search for a university by name or city.
- `app/university/[id].tsx`: the master's programs of one university with their fit labels; tapping one adds it to Applications.
- `app/checklist/[id].tsx`: the checklist of one application: requirements, attached documents, the link to the official page and "I've submitted my application".
- `app/(tabs)/feedback.tsx`: choose a program, a CV and a statement, give consent, and get the AI feedback.
- `app/(tabs)/profile.tsx`: profile summary with edit, currency choice and PDF uploads.
- `app/settings.tsx`: deadline reminders, AI consent, terms and privacy, log out and account deletion.

### Business logic (`src/lib/`)
These are pure functions: no React and no database, just values in and results out, so they can be tested on their own. They return keys, not text, so the screens can translate them.
- `src/lib/grades.ts`: to label every student in the same way, every grading scale has to be converted to one standard scale, 0 to 10. For linear scales (0-10, US 4.0, percentage, Italian 30) the passing grade becomes 6, the best grade becomes 10, and grades in between are placed on a straight line: 27/30 becomes 9.0 and 3.6/4.0 becomes 9.2. UK degree classes are bands, so they use a table: the middle of the band for the student and the bottom of the band for a program's minimum, because "at least a 2:1" accepts the whole band. The scale "Other" cannot be converted.
- `src/lib/fit.ts`: gives the fit label. First it compares each requirement, grade and English score, on its own, with one of four results: no minimum (the university does not publish one), missing score (the student has no value), met (equal to or above the minimum) and below. Then it decides the label in order: an English score below the minimum gives Not yet eligible, whatever the grade; with no grade comparison possible the label is Not rated; otherwise the difference between the student's grade and the minimum decides: below -0.5 Not yet eligible, up to +0.5 Reach, up to +1.0 Match, above that Safety, except highly selective programs, which stay Match.
- `src/lib/cost.ts`: shows the cost exactly as the university publishes it, in its currency and unit (per year or total). Tuition and fees are added up only when they share the same currency and unit; otherwise only tuition is shown. It also converts the amount into the student's currency, shown as approximate with the date of the exchange rate.
- `src/lib/email.ts`: checks that an email has the shape name@domain.ext. It does not check that the address exists.
- `src/lib/password.ts`: checks the password rules one by one (at least 8 characters, one digit, one uppercase letter), so the sign-up screen can tick each rule while the user types.
- `src/lib/checklist.ts`: builds the checklist of one application: which requirements are met, which documents are missing, and how many items are missing in total. Apply is enabled only when nothing is missing. A grade up to 0.5 below the minimum shows a warning but does not block.
- `src/lib/*.test.ts`: unit tests for the files above. Other tests sit next to the files they check in `src/`, `src/data/` and `src/components/scenes/`.

### Data access (`src/data/`)
- `src/data/supabase.ts`: creates the single connection to Supabase and saves the user's session on the phone.
- `src/data/session.ts`: tells the app whether the user is signed in right now and updates on sign-in and sign-out. The root layout uses it.
- `src/data/auth.ts`: sign-up, sign-in with email or Apple, sign-out and password recovery.
- `src/data/account.ts`: deletes the account through the `delete-account` server function, then clears the session on the phone.
- `src/data/profile.ts`: reads and saves the student's profile.
- `src/data/programs.ts`: reads the programs, applies the functions in `src/lib` to each one, then filters and sorts them.
- `src/data/institutions.ts`: searches more than 10,000 universities for the "current university" field, starting with the student's country of residence.
- `src/data/applications.ts`: adds, reads and updates applications, attaches documents and marks an application as submitted.
- `src/data/documents.ts`: picks a PDF from the phone, checks its type and size (10 MB at most), uploads it to the user's private folder and saves its details.
- `src/data/feedback.ts`: saves the AI consent, calls the `feedback` server function and reads the latest result. The Claude API key never goes through the app.
- `src/data/careers.ts` and `careerBlocks.ts`: read a program's career data and turn it into the blocks of the careers screen (employment, salary, regions, recruiters, roles), hiding empty ones and showing the source.
- `src/data/reminders.ts`: schedules local notifications before the deadlines of applications not yet submitted, with no server.
- `src/data/rates.json`: European Central Bank exchange rates, with their date, updated by hand.
- `src/data/database.types.ts`: TypeScript types of every table, generated by the Supabase CLI.

### Other modules (`src/`) and components (`src/components/`)
`theme.ts` holds the colors, fonts and spacing used by every screen. `i18n.ts`, with the texts in `locales/en.json` and `locales/es.json`, translates the app according to the phone's language. `format.ts` formats dates and counts the days left to a deadline; `fields.ts` lists the fields of study (UNESCO ISCED); `countries.ts` lists countries with accent-insensitive search; `legal.ts` opens the terms and privacy pages inside the app; `reminderDates.ts` computes when each reminder fires. `src/components/` holds the reusable pieces of the interface: buttons, text fields, the program card, the colored fit label, the pickers and sheets, and the feedback results. `src/components/scenes/` draws an illustration for each university in code with its brand colors, because the app does not use university logos.

### Backend (`supabase/`)
- `supabase/migrations/`: one SQL file per change to the database. The first creates every table, the constraints, the Row Level Security policies (each user can read and write only their own rows) and the private storage for PDFs. The others add the email check used at sign-in, currency and cost units, career data and the list of universities. The seed files insert the program data.
- `supabase/seed/*.csv` and `scripts/`: the program data collected from official university pages, and the scripts that turn it into migrations.
- `supabase/functions/feedback/index.ts`: a server function. It checks the user and their consent, enforces the limit of 3 rounds in 24 hours, sends the two PDFs and the program's requirements to Claude, saves the result and returns the issues ranked by priority.
- `supabase/functions/delete-account/index.ts`: deletes the user's files and then the user; all their rows are deleted with them.

### Other files
`plugins/withoutPushEntitlement.js` removes a push notification permission that made the iOS build fail, since the app uses only local notifications. `site/` holds the privacy, terms and support pages, published on GitHub Pages by `.github/workflows/pages.yml`. `app.json` and `eas.json` configure the app and its cloud builds, `package.json` lists the libraries and commands, and `docs/` holds the business rules, screen flows and decision log.

## Design choices

- **An iOS app with Expo instead of a website.** I first started with Next.js, but a website cannot go on the App Store and Apple often rejects websites wrapped as apps. Expo builds a real iPhone app in the cloud. Time was short and I was unsure whether to stop at TestFlight, but once the app was on TestFlight I pushed it to the App Store. Some features, such as Sign in with Google, were left for later.
- **Fit labels instead of an admission probability.** There is no data on admission outcomes, so a percentage would be invented. A label that compares the profile with the published minimums is honest, and the app says it is not an admission probability.
- **Reach down to 0.5 below the minimum.** Published minimums are often soft, so a student just below one can still apply. The floor at -0.5 stops profiles far below from looking reachable.
- **Not rated when a program publishes no minimum.** A label I cannot justify with an official page would break the trust the app depends on.
- **Grades stored on their original scale.** The student never converts by hand, the original grade is kept, and the conversion lives in one place.
- **Business logic as pure functions with tests**, separate from the screens, so it can be checked and changed in one place.
- **Claude called only from a server function.** An API key inside the app could be extracted by anyone.
- **Only the published cost.** Living costs are estimates that change from student to student, so the app shows only figures it can source.
- **No university logos.** Logos are trademarks; the app uses initials, brand colors and drawn illustrations instead.

## How to run it

The app is available on the App Store: https://apps.apple.com/app/id6830953548

To run the code: `npm install`, copy `.env.example` to `.env` and fill in the two Supabase values, run `npx expo start --tunnel`, and open it on an iPhone with Expo Go.

## Use of AI

I used AI to write many parts of the project, but I made the product and design decisions myself. I wrote the core logic of the app: `grades.ts`, `fit.ts`, `cost.ts`, `password.ts` and `email.ts`. Claude Code added the UK class handling for a program's minimum in `grades.ts`. Claude wrote `checklist.ts`, and Claude Code wrote all the unit tests at my request. Screens, data access, server functions and migrations were written with Claude Code and GitHub Copilot, and every file with substantial AI help says so in a comment at the top. I collected the program data from official university pages, with Claude's help.
