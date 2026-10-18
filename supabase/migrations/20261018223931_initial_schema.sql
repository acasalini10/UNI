-- AI-assisted (Claude Code): initial schema with RLS on every table, profile trigger and private PDF bucket.
-- Countries are ISO 3166-1 alpha-2 codes; currencies are ISO 4217 codes.

-- ============================================================
-- Reference data: read-only for signed-in users.
-- Written only with the service role (CSV import).
-- ============================================================

create table public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  country char(2) not null,
  initials text not null check (char_length(initials) between 1 and 4),
  brand_color text check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (name, city)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities (id) on delete cascade,
  program text not null,
  field text not null,
  degree text not null default 'master' check (degree = 'master'),
  length_months int not null check (length_months > 0),
  language text not null,
  -- Minimum grade on its original scale; uk_class uses min_gpa_class instead of min_gpa.
  min_gpa numeric(5, 2),
  min_gpa_scale text check (min_gpa_scale in ('10', '4.0', '100', '30', 'uk_class')),
  min_gpa_class text check (min_gpa_class in ('first', '2:1', '2:2', 'third')),
  min_ielts numeric(2, 1) check (min_ielts between 0 and 9 and min_ielts * 2 = trunc(min_ielts * 2)),
  highly_selective boolean not null default false,
  tuition_total numeric(12, 2) not null check (tuition_total >= 0),
  fees_total numeric(12, 2) not null default 0 check (fees_total >= 0),
  application_fee numeric(10, 2) check (application_fee >= 0),
  test_required text not null default 'none' check (test_required in ('none', 'optional', 'required')),
  letters_required int not null default 0 check (letters_required >= 0),
  currency char(3) not null,
  deadline date,
  official_url text not null,
  ranking_url text,
  careers_url text,
  checked_on date not null,
  checked_by text not null,
  created_at timestamptz not null default now(),
  constraint programs_min_gpa_matches_scale check (
    (min_gpa_scale is null and min_gpa is null and min_gpa_class is null)
    or (min_gpa_scale = 'uk_class' and min_gpa is null and min_gpa_class is not null)
    or (min_gpa_scale <> 'uk_class' and min_gpa is not null and min_gpa_class is null)
  )
);
create index programs_university_id_idx on public.programs (university_id);

create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities (id) on delete cascade,
  program_id uuid references public.programs (id) on delete cascade,
  scope text not null check (scope in ('university', 'program')),
  area text not null check (area in ('national', 'world')),
  ranking_name text not null,
  rank text not null, -- exactly as published, e.g. "114" or "101–150"
  year int not null,
  url text not null,
  checked_on date not null,
  constraint rankings_program_matches_scope check ((scope = 'program') = (program_id is not null))
);
create index rankings_university_id_idx on public.rankings (university_id);
create index rankings_program_id_idx on public.rankings (program_id);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null,
  official_url text not null,
  amount numeric(12, 2) check (amount >= 0),
  currency char(3),
  covers_full_tuition boolean not null default false,
  is_loan boolean not null default false,
  eligible_citizenships char(2)[], -- null = any citizenship
  country char(2) not null, -- country of study
  university_id uuid references public.universities (id) on delete cascade,
  program_id uuid references public.programs (id) on delete cascade,
  deadline date,
  checked_on date not null,
  created_at timestamptz not null default now(),
  constraint scholarships_amount_has_currency check (amount is null or currency is not null)
);
create index scholarships_university_id_idx on public.scholarships (university_id);
create index scholarships_program_id_idx on public.scholarships (program_id);

alter table public.universities enable row level security;
alter table public.programs enable row level security;
alter table public.rankings enable row level security;
alter table public.scholarships enable row level security;

create policy "Signed-in users read universities" on public.universities for select to authenticated using (true);
create policy "Signed-in users read programs" on public.programs for select to authenticated using (true);
create policy "Signed-in users read rankings" on public.rankings for select to authenticated using (true);
create policy "Signed-in users read scholarships" on public.scholarships for select to authenticated using (true);

-- ============================================================
-- User data: each user reads and writes only their own rows.
-- Every row is deleted with the auth user (account deletion).
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Step 1 (academic)
  first_name text,
  last_name text,
  country_of_residence char(2),
  current_university text,
  current_studies text,
  fields text[] not null default '{}',
  -- Grade on its original scale; uk_class uses grade_class, 'other' keeps the raw number.
  grade numeric(5, 2),
  grade_scale text check (grade_scale in ('10', '4.0', '100', '30', 'uk_class', 'other')),
  grade_class text check (grade_class in ('first', '2:1', '2:2', 'third')),
  ielts numeric(2, 1) check (ielts between 0 and 9 and ielts * 2 = trunc(ielts * 2)), -- null = not taken yet
  test_type text check (test_type in ('gmat', 'gre')),
  test_score int,
  target_countries char(2)[] not null default '{}' check (cardinality(target_countries) <= 3),
  planned_start date check (extract(day from planned_start) = 1), -- first day of the start month
  -- Step 2 (optional)
  citizenships char(2)[] not null default '{}' check (cardinality(citizenships) <= 2),
  country_of_origin char(2),
  budget_band text check (budget_band in ('under_10k', '10k_25k', '25k_50k', 'over_50k', 'not_sure')),
  budget_currency char(3),
  payers text[] not null default '{}' check (payers <@ array['me', 'family', 'scholarship', 'loan', 'not_sure']),
  -- AI consent (App Review 5.1.2(i)); also checked in the feedback Edge Function
  ai_consent boolean not null default false,
  ai_consent_at timestamptz,
  -- 0 = not started, 1 = step 1 saved, 2 = setup finished
  setup_step int not null default 0 check (setup_step between 0 and 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_grade_matches_scale check (
    (grade_scale is null and grade is null and grade_class is null)
    or (grade_scale = 'uk_class' and grade is null and grade_class is not null)
    or (grade_scale = '10' and grade between 0 and 10 and grade_class is null)
    or (grade_scale = '4.0' and grade between 0 and 4 and grade_class is null)
    or (grade_scale = '100' and grade between 0 and 100 and grade_class is null)
    or (grade_scale = '30' and grade between 18 and 30 and grade_class is null)
    or (grade_scale = 'other' and grade_class is null)
  ),
  constraint profiles_test_score_matches_type check (
    (test_type is null and test_score is null)
    or (test_type = 'gmat' and test_score between 200 and 805)
    or (test_type = 'gre' and test_score between 260 and 340)
  )
);

-- One empty profile per new account (email, Apple or Google).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'in_progress', 'submitted')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, program_id),
  constraint applications_submitted_has_date check ((status = 'submitted') = (submitted_at is not null))
);
create index applications_program_id_idx on public.applications (program_id);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('cv', 'motivation_letter', 'reference_letter')),
  storage_path text not null unique, -- '<user_id>/<file>.pdf' in the documents bucket
  file_name text not null,
  size_bytes int not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now(),
  constraint documents_path_in_user_folder check (storage_path like user_id::text || '/%')
);
create index documents_user_id_idx on public.documents (user_id);

-- Which file is attached to which application (sheet 12d).
create table public.application_documents (
  application_id uuid not null references public.applications (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (application_id, document_id)
);
create index application_documents_document_id_idx on public.application_documents (document_id);

-- Written only by the feedback Edge Function (service role), which also counts the daily limit.
create table public.feedback_rounds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid references public.programs (id) on delete set null,
  cv_document_id uuid references public.documents (id) on delete set null,
  statement_document_id uuid references public.documents (id) on delete set null,
  result jsonb,
  created_at timestamptz not null default now()
);
create index feedback_rounds_user_id_created_at_idx on public.feedback_rounds (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.application_documents enable row level security;
alter table public.feedback_rounds enable row level security;

-- Profiles: created by the trigger, deleted with the account.
create policy "Users read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users read own applications" on public.applications
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add own applications" on public.applications
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own applications" on public.applications
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own applications" on public.applications
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read own documents" on public.documents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add own documents" on public.documents
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own documents" on public.documents
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own documents" on public.documents
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Both the application and the document must belong to the user.
create policy "Users read own attachments" on public.application_documents
  for select to authenticated using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
  );
create policy "Users attach own documents" on public.application_documents
  for insert to authenticated with check (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
    and exists (select 1 from public.documents d where d.id = document_id and d.user_id = (select auth.uid()))
  );
create policy "Users detach own documents" on public.application_documents
  for delete to authenticated using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
  );

create policy "Users read own feedback rounds" on public.feedback_rounds
  for select to authenticated using ((select auth.uid()) = user_id);

-- ============================================================
-- Storage: private bucket for PDFs, one folder per user.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', false, 10485760, array['application/pdf']);

create policy "Users read own files" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users upload own files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update own files" on storage.objects
  for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete own files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
