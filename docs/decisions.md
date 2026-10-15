# Decision log

One row per non-trivial decision. Same columns as the course Decision Log, so rows can be copied into the checkpoint documents.

| Date | Decision | Options considered | Why the others were discarded | Role of AI | Evidence |
| --- | --- | --- | --- | --- | --- |
| 2026-10-13 | GitHub Codespaces as the dev environment | Local Mac setup; Codespaces | Prefer having all projects on GitHub; no local setup to maintain | Claude explained trade-offs (hours limit, need for internet); we chose | [Planning the build](https://claude.ai/share/be2f144d-9b5f-4fc8-a22b-5f49d4733d1d) |
| 2026-10-15 | Expo (React Native) instead of Next.js | Next.js web app; Next.js wrapped with Capacitor; Expo | Next.js is a website, not an App Store app. Capacitor needs Xcode for every build and Apple often rejects wrapped websites. Expo builds iOS in the cloud from Codespaces | Claude flagged the mismatch with the App Store goal; we decided | (link to this chat) |
| 2026-10-15 | Target all international students, not only Mexicans | Mexico only; all nationalities | The product works the same for any nationality; Mexico stays the test market in the course case | We decided | |
| 2026-10-15 | Same repo for the course and CS50; I write `src/lib` myself | Separate CS50 project; AI writes everything | CS50 requires the essence of the work to be mine and AI use cited in comments | Claude checked the CS50 rules; we decided | [CS50 final project](https://cs50.harvard.edu/x/project) |
| 2026-10-15 | Initials badges instead of university logos | Logos from university sites; initials | Trademarks without permission risk App Review rejection and imply endorsement | Claude checked guideline 5.2; we decided | |
| 2026-10-15 | Link to ranking pages instead of showing QS numbers | Copy QS numbers; ask QS for permission; link out | QS terms require written consent for commercial use; link out now, ask permission in parallel | Claude read the QS terms; we decided | [QS terms](https://www.topuniversities.com/terms-conditions) |
| 2026-10-15 | No payments in v1 | Stripe in the app; Apple In-App Purchase; no payments | Stripe for a digital Pass breaks Apple's rules; IAP setup and review do not fit 4 weeks | Claude checked the App Review rules; we decided | (link to this chat) |
| 2026-10-15 | Paid Apple Developer Program (99/year) now | Wait until Oct 28; free account; web only | Free account installs only on my iPhone for 7 days; the paid membership enables TestFlight for classmates and the App Store, and covers the coding year until Oct 2027 | Claude suggested waiting until Oct 28; I decided to enroll now | |
