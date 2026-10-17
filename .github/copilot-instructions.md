# Copilot instructions for UNI

- Expo (React Native) with Expo Router and TypeScript strict. No `any`.
- Styling with `StyleSheet.create` and tokens from `src/theme.ts`. No inline color values.
- Business logic only in `src/lib` as pure functions. Screens call them; they never compute fit labels or costs themselves.
- Data access only through functions in `src/data`, which use the Supabase client from `src/data/supabase.ts`.
- Never reference `ANTHROPIC_API_KEY` or any secret in app code.
- Functional components and hooks only. Files in kebab-case, components in PascalCase.
- Tests with Jest next to the file: `fit.ts` and `fit.test.ts`.

- Screens follow `docs/flows.md` exactly: every tap destination and every state (loading, empty, error) listed there. Screenshots are in `docs/screens/`.
- Every user-facing string uses `t('...')` from i18n with keys in `locales/en.json` and `locales/es.json`. No hard-coded text.
- No button or row that does nothing: if a feature is not built, do not show it.

## CS50 rules (see docs/cs50.md)
- Do not write or change code in `src/lib/`: the owner writes it himself. You may explain it or point out bugs.
- Every file you create or substantially change starts with `// AI-assisted (GitHub Copilot): <what you did>`.
- Do not edit README.md sections marked TODO.
- No university logos. Ranking numbers always show their source and year, with a link to the ranking page (see docs/data.md).
- Before finishing a task, run `npx tsc --noEmit` and `npm test`.
