-- AI-assisted (Claude Code): one display currency per student (decision 2026-11-09).
-- budget_currency becomes currency: the same code is used for the budget chips (2b)
-- and for the "≈" conversion of program costs. Null = not picked yet; the app then
-- uses the default for the country of residence. RLS on profiles is unchanged.

alter table public.profiles rename column budget_currency to currency;

alter table public.profiles
  add constraint profiles_currency_check check (currency ~ '^[A-Z]{3}$');
