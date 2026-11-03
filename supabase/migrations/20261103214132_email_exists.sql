-- AI-assisted (Claude Code): email_exists() so screen 1 can send a new email to 1b and an existing one to 1c.
-- Callable before sign-in (anon). It reveals whether an email has an account; accepted because flows.md
-- screen 1 needs it (decision 2026-11-03). Supabase rate limits on sign-in still apply to the next step.

create function public.email_exists(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(p_email))
  );
$$;

revoke execute on function public.email_exists(text) from public;
grant execute on function public.email_exists(text) to anon, authenticated;
