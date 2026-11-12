-- AI-assisted (Claude Code): career outcome tables for Careers 8 (decisions 2026-11-11). Read-only for signed-in users, written only by the seed migration.
-- Every nullable column means "the report does not publish it". No estimates (business-rules.md §7).
-- scope says whose figures they are: the program itself, its department or its school; scope_label names them when not the program.

-- One row per program: the report, employment, salary and roles.
create table public.program_careers (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null unique references public.programs (id) on delete cascade,
  scope text not null check (scope in ('program', 'department', 'school')),
  scope_label text,
  report_url text not null,
  report_year text, -- as published: "2025", "2023-2024"; blank if the report has none
  avg_salary numeric(12, 2) check (avg_salary > 0),
  salary_currency char(3) check (salary_currency ~ '^[A-Z]{3}$'),
  salary_stat text check (salary_stat in ('mean', 'median')),
  employed_pct numeric(4, 1) check (employed_pct between 0 and 100),
  employed_months int check (employed_months > 0),
  top_roles text[] not null default '{}',
  notes text, -- for the team only, never shown in the app
  checked_on date not null,
  created_at timestamptz not null default now(),
  constraint program_careers_scope_label check (scope = 'program' or scope_label is not null),
  -- A salary needs its amount, currency and statistic together.
  constraint program_careers_salary_complete check (
    (avg_salary is null and salary_currency is null and salary_stat is null)
    or (avg_salary is not null and salary_currency is not null and salary_stat is not null)
  ),
  constraint program_careers_months_need_pct check (employed_months is null or employed_pct is not null)
);

-- One row per company, in the order of the report.
create table public.program_recruiters (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  position int not null check (position > 0),
  company text not null,
  roles text, -- no report links roles to companies yet
  scope text not null check (scope in ('program', 'department', 'school')),
  scope_label text,
  created_at timestamptz not null default now(),
  constraint program_recruiters_scope_label check (scope = 'program' or scope_label is not null),
  unique (program_id, company)
);
create index program_recruiters_program_id_idx on public.program_recruiters (program_id, position);

-- One row per region, named as in the report. Shares may not add up to 100.
create table public.program_regions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  position int not null check (position > 0),
  region text not null,
  share_pct numeric(4, 1) not null check (share_pct > 0 and share_pct <= 100),
  scope text not null check (scope in ('program', 'department', 'school')),
  scope_label text,
  created_at timestamptz not null default now(),
  constraint program_regions_scope_label check (scope = 'program' or scope_label is not null),
  unique (program_id, region)
);
create index program_regions_program_id_idx on public.program_regions (program_id, position);

alter table public.program_careers enable row level security;
alter table public.program_recruiters enable row level security;
alter table public.program_regions enable row level security;

create policy "Signed-in users read program careers" on public.program_careers for select to authenticated using (true);
create policy "Signed-in users read program recruiters" on public.program_recruiters for select to authenticated using (true);
create policy "Signed-in users read program regions" on public.program_regions for select to authenticated using (true);
