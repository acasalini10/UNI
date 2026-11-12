// AI-assisted (Claude Code): turns supabase/seed/universities.csv and programs.csv into a repeatable SQL migration (upsert, no duplicates on re-run); cost_unit column added Nov 9, limited to per_year and total Nov 11. Nov 12: careers.csv, recruiters.csv and regions.csv added (program found by university + program; the three career tables are replaced on every run).
// Usage: node scripts/generate-seed.mjs   → writes supabase/migrations/<timestamp>_seed_programs.sql
// The CSVs are checked by hand before running; the script stops on career rows it cannot link or read, and the database constraints are the final check when the migration is pushed.
import { readFileSync, writeFileSync } from "node:fs";

// Minimal RFC 4180 parser: quoted fields, "" inside quotes, commas and newlines inside quotes.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  const [header, ...data] = rows;
  return data.map((values) => Object.fromEntries(header.map((name, i) => [name.trim(), (values[i] ?? "").trim()])));
}

// Empty cells become NULL; everything else is a quoted text literal, cast to its column type in the SELECT.
function literal(value) {
  return value === "" ? "null" : `'${value.replaceAll("'", "''")}'`;
}

const universities = parseCsv(readFileSync("supabase/seed/universities.csv", "utf8"));
const programs = parseCsv(readFileSync("supabase/seed/programs.csv", "utf8"));

const programColumns = [
  ["program", "text"],
  ["field", "text"],
  ["degree", "text"],
  ["length_months", "int"],
  ["language", "text"],
  ["min_gpa", "numeric"],
  ["min_gpa_scale", "text"],
  ["min_gpa_class", "text"],
  ["min_ielts", "numeric"],
  ["highly_selective", "boolean"],
  ["tuition_total", "numeric"],
  ["fees_total", "numeric"], // blank = not published
  ["cost_unit", "text"], // per_year or total, for tuition and fees
  ["application_fee", "numeric"],
  ["test_required", "text"],
  ["letters_required", "int"],
  ["currency", "text"],
  ["deadline", "date"],
  ["official_url", "text"],
  ["ranking_url", "text"],
  ["careers_url", "text"],
  ["checked_on", "date"],
  ["checked_by", "text"],
];

const universityValues = universities
  .map((u) => `  (${[u.name, u.city, u.country, u.initials].map(literal).join(", ")})`)
  .join(",\n");

const programValues = programs
  .map((p) => {
    // The database accepts only lowercase 'master'; the sheet writes "Master".
    const row = { ...p, degree: p.degree.toLowerCase(), highly_selective: p.highly_selective.toLowerCase() };
    return `  (${[row.university, row.city, ...programColumns.map(([name]) => row[name])].map(literal).join(", ")})`;
  })
  .join(",\n");

const names = programColumns.map(([name]) => name);

// ---------- Careers ----------
const careers = parseCsv(readFileSync("supabase/seed/careers.csv", "utf8"));
const recruiters = parseCsv(readFileSync("supabase/seed/recruiters.csv", "utf8"));
const regions = parseCsv(readFileSync("supabase/seed/regions.csv", "utf8"));
const rates = JSON.parse(readFileSync("src/data/rates.json", "utf8"));

const errors = [];
const key = (row) => `${row.university} | ${row.program}`;
// university + program → city, so each career row joins to exactly one program in SQL.
const cityOf = new Map(programs.map((p) => [key(p), p.city]));
const withCareers = new Set(careers.map(key));
const scopes = ["program", "department", "school"];

function checkRow(file, row, line) {
  if (!cityOf.has(key(row))) errors.push(`${file} line ${line}: "${key(row)}" is not in programs.csv (write university and program exactly as there)`);
  if (!scopes.includes(row.scope)) errors.push(`${file} line ${line}: scope "${row.scope}" must be ${scopes.join(", ")}`);
  if (row.scope !== "program" && row.scope_label === "") errors.push(`${file} line ${line}: scope "${row.scope}" needs a scope_label`);
}

const seenCareers = new Set();
careers.forEach((row, i) => {
  const line = i + 2;
  checkRow("careers.csv", row, line);
  if (seenCareers.has(key(row))) errors.push(`careers.csv line ${line}: "${key(row)}" appears twice`);
  seenCareers.add(key(row));
  if (row.report_url === "") errors.push(`careers.csv line ${line}: report_url is empty`);
  const salaryParts = [row.avg_salary, row.salary_currency, row.salary_stat].filter((value) => value !== "").length;
  if (salaryParts !== 0 && salaryParts !== 3) errors.push(`careers.csv line ${line}: avg_salary, salary_currency and salary_stat must be all filled or all empty`);
  if (row.salary_stat !== "" && !["mean", "median"].includes(row.salary_stat)) errors.push(`careers.csv line ${line}: salary_stat "${row.salary_stat}" must be mean or median`);
  if (row.salary_currency !== "" && rates.rates[row.salary_currency.toUpperCase()] === undefined)
    errors.push(`careers.csv line ${line}: salary_currency "${row.salary_currency}" is not in src/data/rates.json`);
  if (row.employed_months !== "" && row.employed_pct === "") errors.push(`careers.csv line ${line}: employed_months without employed_pct`);
});

// Recruiters and regions: linked program, its careers row (for the report link), one scope per program, no duplicates.
function checkList(file, rows, itemColumn) {
  const scopeOf = new Map();
  const seen = new Set();
  rows.forEach((row, i) => {
    const line = i + 2;
    checkRow(file, row, line);
    if (cityOf.has(key(row)) && !withCareers.has(key(row))) errors.push(`${file} line ${line}: "${key(row)}" has no row in careers.csv (the report link comes from there)`);
    const scope = `${row.scope} | ${row.scope_label}`;
    if (scopeOf.has(key(row)) && scopeOf.get(key(row)) !== scope) errors.push(`${file} line ${line}: "${key(row)}" mixes scopes in the same file`);
    scopeOf.set(key(row), scope);
    const item = `${key(row)} | ${row[itemColumn]}`;
    if (seen.has(item)) errors.push(`${file} line ${line}: "${row[itemColumn]}" appears twice for "${key(row)}"`);
    seen.add(item);
  });
}
checkList("recruiters.csv", recruiters, "company");
checkList("regions.csv", regions, "region");
regions.forEach((row, i) => {
  const share = Number(row.share_pct);
  if (row.share_pct === "" || !(share > 0 && share <= 100)) errors.push(`regions.csv line ${i + 2}: share_pct "${row.share_pct}" must be a number above 0 and up to 100`);
});

if (errors.length > 0) {
  console.error(`Career CSVs not imported:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

// Position = order in the CSV for that program, so screens keep the report's order.
function withPositions(rows) {
  const counters = new Map();
  return rows.map((row) => {
    const position = (counters.get(key(row)) ?? 0) + 1;
    counters.set(key(row), position);
    return { ...row, position: String(position) };
  });
}

// top_roles "A; B; C" → text array literal.
function rolesArray(text) {
  const roles = text.split(";").map((role) => role.trim()).filter((role) => role !== "");
  return `array[${roles.map(literal).join(", ")}]::text[]`;
}

const programLink = (row) => [row.university, cityOf.get(key(row)), row.program].map(literal).join(", ");
const join = `join public.universities u on u.name = v.university and u.city = v.city
join public.programs p on p.university_id = u.id and p.program = v.program`;

const careerValues = careers
  .map((c) => {
    const values = [c.scope, c.scope_label, c.report_url, c.report_year, c.avg_salary, c.salary_currency.toUpperCase(), c.salary_stat, c.employed_pct, c.employed_months]
      .map(literal)
      .join(", ");
    return `  (${programLink(c)}, ${values}, ${rolesArray(c.top_roles)}, ${literal(c.notes)}, ${literal(c.checked_on)})`;
  })
  .join(",\n");

const recruiterValues = withPositions(recruiters)
  .map((r) => `  (${programLink(r)}, ${[r.position, r.company, r.roles, r.scope, r.scope_label].map(literal).join(", ")})`)
  .join(",\n");

const regionValues = withPositions(regions)
  .map((r) => `  (${programLink(r)}, ${[r.position, r.region, r.share_pct, r.scope, r.scope_label].map(literal).join(", ")})`)
  .join(",\n");

const careersSql = `
-- Career data: the CSVs are the whole truth, so the three tables are emptied and filled again (a row removed from a CSV disappears).
-- ${careers.length} programs with careers, ${recruiters.length} recruiters, ${regions.length} regions.
delete from public.program_regions;
delete from public.program_recruiters;
delete from public.program_careers;

insert into public.program_careers (program_id, scope, scope_label, report_url, report_year, avg_salary, salary_currency, salary_stat, employed_pct, employed_months, top_roles, notes, checked_on)
select p.id, v.scope, v.scope_label, v.report_url, v.report_year, v.avg_salary::numeric, v.salary_currency, v.salary_stat, v.employed_pct::numeric, v.employed_months::int, v.top_roles, v.notes, v.checked_on::date
from (
  values
${careerValues}
) as v (university, city, program, scope, scope_label, report_url, report_year, avg_salary, salary_currency, salary_stat, employed_pct, employed_months, top_roles, notes, checked_on)
${join};

insert into public.program_recruiters (program_id, position, company, roles, scope, scope_label)
select p.id, v.position::int, v.company, v.roles, v.scope, v.scope_label
from (
  values
${recruiterValues}
) as v (university, city, program, position, company, roles, scope, scope_label)
${join};

insert into public.program_regions (program_id, position, region, share_pct, scope, scope_label)
select p.id, v.position::int, v.region, v.share_pct::numeric, v.scope, v.scope_label
from (
  values
${regionValues}
) as v (university, city, program, position, region, share_pct, scope, scope_label)
${join};
`;

const sql = `-- AI-assisted (Claude Code): generated by scripts/generate-seed.mjs from supabase/seed/*.csv. Do not edit by hand: change the CSVs and generate a new migration.
-- ${universities.length} universities, ${programs.length} programs. Repeatable: running it again updates rows instead of duplicating them.

-- One program name per university, so the import can upsert programs.
create unique index if not exists programs_university_program_key on public.programs (university_id, program);

insert into public.universities (name, city, country, initials)
values
${universityValues}
on conflict (name, city) do update
  set country = excluded.country,
      initials = excluded.initials;

-- university and city only link each program to its university; they are not columns of programs.
insert into public.programs (university_id, ${names.join(", ")})
select u.id, ${programColumns.map(([name, type]) => `v.${name}::${type}`).join(", ")}
from (
  values
${programValues}
) as v (university, city, ${names.join(", ")})
join public.universities u on u.name = v.university and u.city = v.city
on conflict (university_id, program) do update
  set ${names.filter((name) => name !== "program").map((name) => `${name} = excluded.${name}`).join(",\n      ")};
${careersSql}`;

const now = new Date();
const stamp = now.toISOString().replace(/\D/g, "").slice(0, 14);
const file = `supabase/migrations/${stamp}_seed_programs.sql`;
writeFileSync(file, sql);
console.log(
  `${file}: ${universities.length} universities, ${programs.length} programs, ${careers.length} careers, ${recruiters.length} recruiters, ${regions.length} regions`,
);
