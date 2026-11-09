-- AI-assisted (Claude Code): unit of the published cost (business-rules.md §4) and fees that may be unpublished.
-- cost_unit applies to tuition_total and fees_total as published on the university site.
-- The 31 programs imported on Nov 6 were collected for the whole program, so they get 'total'.
alter table public.programs
  add column cost_unit text not null default 'total'
    check (cost_unit in ('per_year', 'total', 'per_credit'));

-- Null = the university does not publish its fees (not the same as 0). Existing values are kept.
alter table public.programs
  alter column fees_total drop not null,
  alter column fees_total drop default;
