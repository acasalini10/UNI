// AI-assisted (Claude Code): typed programs query and the list rows for Programs 3 (fit from fit.ts, cost from cost.ts), plus filtering and sorting.
import { getCardCost, getCostValues, type CostUnit, type CostValues } from "@/lib/cost";
import { getFit, type FitLabel, type FitResult, type StudentScores } from "@/lib/fit";
import { toTenScale, type GradeScaleId, type UkClass } from "@/lib/grades";

import { displayCurrency, rates, type Profile } from "./profile";
import { supabase } from "./supabase";

import type { Database } from "./database.types";

type ProgramRecord = Database["public"]["Tables"]["programs"]["Row"];
type UniversityRecord = Database["public"]["Tables"]["universities"]["Row"];
export type ProgramWithUniversity = ProgramRecord & {
  universities: Pick<UniversityRecord, "name" | "city" | "country" | "initials" | "brand_color">;
};

export type ProgramsResult = { ok: true; data: ProgramWithUniversity[] } | { ok: false; error: "offline" | "unknown" };

export async function getPrograms(): Promise<ProgramsResult> {
  const { data, error } = await supabase
    .from("programs")
    .select("*, universities!inner(name, city, country, initials, brand_color)");
  if (error || !data) return { ok: false, error: error?.code ? "unknown" : "offline" };
  return { ok: true, data };
}

export type ProgramResult = { ok: true; data: ProgramWithUniversity } | { ok: false; error: "offline" | "unknown" | "not_found" };

export async function getProgram(id: string): Promise<ProgramResult> {
  const { data, error } = await supabase
    .from("programs")
    .select("*, universities!inner(name, city, country, initials, brand_color)")
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false, error: error.code ? "unknown" : "offline" };
  if (!data) return { ok: false, error: "not_found" };
  return { ok: true, data };
}

// Tuition and fees as separate lines for Program detail; total only when getCardCost could sum them.
export interface DetailCosts {
  tuition: CostValues;
  fees: CostValues | null; // null = fees not published
  total: CostValues | null;
}

export function detailCosts(program: ProgramWithUniversity, profile: Profile): DetailCosts {
  const currency = displayCurrency(profile);
  const unit = program.cost_unit as CostUnit;
  const tuition = { amount: program.tuition_total, currency: program.currency, unit };
  const fees = program.fees_total === null ? null : { amount: program.fees_total, currency: program.currency, unit };
  const card = getCardCost({ tuition, fees });
  return {
    tuition: getCostValues(tuition, currency, rates),
    fees: fees && getCostValues(fees, currency, rates),
    total: card.includesFees ? getCostValues(card.cost, currency, rates) : null,
  };
}

// Student side of the fit check: grade converted to 0–10 (null for scale "Other").
export function studentScores(profile: Profile): StudentScores {
  const scale = profile.grade_scale as GradeScaleId | null;
  let gpa: number | null = null;
  if (scale === "uk_class" && profile.grade_class) gpa = toTenScale(profile.grade_class as UkClass, scale);
  else if (scale && profile.grade !== null) gpa = toTenScale(profile.grade, scale);
  return { gpa, ielts: profile.ielts };
}

function programMinGpa(program: ProgramRecord): number | null {
  const scale = program.min_gpa_scale as GradeScaleId | null;
  if (!scale) return null;
  if (scale === "uk_class") return program.min_gpa_class ? toTenScale(program.min_gpa_class as UkClass, scale) : null;
  return program.min_gpa === null ? null : toTenScale(program.min_gpa, scale);
}

export interface ProgramRow {
  id: string;
  program: string;
  university: string;
  initials: string;
  brandColor: string | null;
  country: string;
  field: string;
  lengthMonths: number;
  deadline: string | null; // YYYY-MM-DD
  highlySelective: boolean;
  fit: FitResult;
  cost: CostValues;
  includesFees: boolean;
}

export function toRows(programs: ProgramWithUniversity[], profile: Profile): ProgramRow[] {
  const student = studentScores(profile);
  const currency = displayCurrency(profile);
  return programs.map((p) => {
    const unit = p.cost_unit as CostUnit;
    const card = getCardCost({
      tuition: { amount: p.tuition_total, currency: p.currency, unit },
      fees: p.fees_total === null ? null : { amount: p.fees_total, currency: p.currency, unit },
    });
    return {
      id: p.id,
      program: p.program,
      university: p.universities.name,
      initials: p.universities.initials,
      brandColor: p.universities.brand_color,
      country: p.universities.country,
      field: p.field,
      lengthMonths: p.length_months,
      deadline: p.deadline,
      highlySelective: p.highly_selective,
      fit: getFit(student, { minGpa: programMinGpa(p), minIelts: p.min_ielts, highlySelective: p.highly_selective }),
      cost: getCostValues(card.cost, currency, rates),
      includesFees: card.includesFees,
    };
  });
}

export type DeadlineFilter = "any" | "open" | "3m" | "6m";
export type SortKey = "fit" | "cost" | "deadline";

export interface Filters {
  countries: string[];
  fields: string[];
  fits: FitLabel[];
  deadline: DeadlineFilter;
  sort: SortKey;
}

export const emptyFilters: Filters = { countries: [], fields: [], fits: [], deadline: "any", sort: "fit" };

// Best fit first; programs we cannot rate come before the ones the student cannot apply to yet.
export const fitOrder: FitLabel[] = ["safety", "match", "reach", "not_rated", "not_yet_eligible"];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function matchesDeadline(deadline: string | null, filter: DeadlineFilter, today: Date): boolean {
  if (filter === "any") return true;
  if (!deadline || deadline < isoDate(today)) return false;
  if (filter === "open") return true;
  return deadline <= isoDate(addMonths(today, filter === "3m" ? 3 : 6));
}

// Lowest cost compares the amounts in the student's currency (display conversion), or the
// published amount when no conversion is needed (decision 2026-11-09).
function sortAmount(row: ProgramRow): number {
  return row.cost.converted?.amount ?? row.cost.original.amount;
}

function compareDeadline(a: ProgramRow, b: ProgramRow): number {
  if (a.deadline === b.deadline) return 0;
  if (!a.deadline) return 1;
  if (!b.deadline) return -1;
  return a.deadline < b.deadline ? -1 : 1;
}

export function applyFilters(rows: ProgramRow[], filters: Filters, today = new Date()): ProgramRow[] {
  const filtered = rows.filter(
    (row) =>
      (filters.countries.length === 0 || filters.countries.includes(row.country)) &&
      (filters.fields.length === 0 || filters.fields.includes(row.field)) &&
      (filters.fits.length === 0 || filters.fits.includes(row.fit.label)) &&
      matchesDeadline(row.deadline, filters.deadline, today),
  );
  const byName = (a: ProgramRow, b: ProgramRow) => a.university.localeCompare(b.university) || a.program.localeCompare(b.program);
  return filtered.sort((a, b) => {
    if (filters.sort === "cost") return sortAmount(a) - sortAmount(b) || byName(a, b);
    if (filters.sort === "deadline") return compareDeadline(a, b) || byName(a, b);
    return fitOrder.indexOf(a.fit.label) - fitOrder.indexOf(b.fit.label) || compareDeadline(a, b) || byName(a, b);
  });
}

// Countries and fields that exist in the data, for the filter sheets.
export function filterOptions(rows: ProgramRow[]): { countries: string[]; fields: string[] } {
  return {
    countries: [...new Set(rows.map((row) => row.country))],
    fields: [...new Set(rows.map((row) => row.field))].sort((a, b) => a.localeCompare(b)),
  };
}

// First visit: the student's target countries, if any of them has programs.
export function initialFilters(profile: Profile, rows: ProgramRow[]): Filters {
  const available = new Set(rows.map((row) => row.country));
  return { ...emptyFilters, countries: profile.target_countries.filter((code) => available.has(code)) };
}
