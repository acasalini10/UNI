-- AI-assisted (Claude Code): institutions for the "Current university" field on profile setup 2 (decision 2026-11-11).
-- Separate from public.universities, which holds only the universities of the programs.
-- Filled by scripts/import-institutions.mjs from Hipo's university-domains-list (MIT licence, see docs/data.md).

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country char(2) not null check (country ~ '^[A-Z]{2}$'),
  -- Lowercase name without accents, written by the import script, so "anahuac" finds "Anáhuac".
  search_name text not null,
  created_at timestamptz not null default now(),
  unique (name, country)
);
create index institutions_country_idx on public.institutions (country);

alter table public.institutions enable row level security;
create policy "Signed-in users read institutions" on public.institutions for select to authenticated using (true);
