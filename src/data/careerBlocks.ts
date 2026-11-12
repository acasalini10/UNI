// AI-assisted (Claude Code): turns a program's career rows into the blocks of Careers 8 and the preview on 4 (business-rules.md §7). Pure: no React, no Supabase, so it is tested in careerBlocks.test.ts.
import { convert, type ConvertedCost, type Rates } from "@/lib/cost";

import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
export type CareerRow = Tables["program_careers"]["Row"];
export type RecruiterRow = Pick<Tables["program_recruiters"]["Row"], "company" | "position" | "scope" | "scope_label">;
export type RegionRow = Pick<Tables["program_regions"]["Row"], "region" | "share_pct" | "position" | "scope" | "scope_label">;

// Shown under every block: who the figures are about, the report year and the report link.
export interface CareerSource {
  url: string;
  year: string | null;
  scopeLabel: string | null; // null when the figures are the program's own
}

export interface EmploymentBlock {
  pct: number;
  months: number | null; // null → "X% employed" with no timeframe
  source: CareerSource;
}

export interface SalaryBlock {
  stat: "mean" | "median";
  amount: number;
  currency: string;
  converted: ConvertedCost | null; // null when the student's currency is the report's, or no rate
  source: CareerSource;
}

export interface RegionsBlock {
  segments: { region: string; share: number }[];
  notBrokenDown: number; // grey segment; 0 when the shares add up to 100
  source: CareerSource;
}

export interface ListBlock {
  items: string[];
  source: CareerSource;
}

export interface CareerBlocks {
  employment: EmploymentBlock | null;
  salary: SalaryBlock | null;
  regions: RegionsBlock | null;
  recruiters: ListBlock | null;
  roles: ListBlock | null;
}

export const noCareerBlocks: CareerBlocks = { employment: null, salary: null, regions: null, recruiters: null, roles: null };

export function hasCareerData(blocks: CareerBlocks): boolean {
  return Object.values(blocks).some((block) => block !== null);
}

function source(report: CareerRow, scope: string, scopeLabel: string | null): CareerSource {
  return { url: report.report_url, year: report.report_year, scopeLabel: scope === "program" ? null : scopeLabel };
}

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

export function toCareerBlocks(
  report: CareerRow | null,
  recruiters: RecruiterRow[],
  regions: RegionRow[],
  studentCurrency: string,
  rates: Rates,
): CareerBlocks {
  // Every block links to the report, so without the careers row nothing is shown.
  if (!report) return noCareerBlocks;
  const own = source(report, report.scope, report.scope_label);

  const employment = report.employed_pct === null ? null : { pct: report.employed_pct, months: report.employed_months, source: own };

  let salary: SalaryBlock | null = null;
  if (report.avg_salary !== null && report.salary_currency && (report.salary_stat === "mean" || report.salary_stat === "median")) {
    const from = report.salary_currency.toUpperCase();
    const to = studentCurrency.toUpperCase();
    const amount = from === to ? null : convert(report.avg_salary, from, to, rates);
    salary = {
      stat: report.salary_stat,
      amount: report.avg_salary,
      currency: from,
      converted: amount === null ? null : { amount, currency: to, rateDate: rates.date },
      source: own,
    };
  }

  let regionsBlock: RegionsBlock | null = null;
  if (regions.length > 0) {
    const sorted = [...regions].sort(byPosition);
    const total = sorted.reduce((sum, row) => sum + row.share_pct, 0);
    // Rounded to one decimal so 99.99 from float sums does not leave a sliver.
    const rest = Math.round((100 - total) * 10) / 10;
    regionsBlock = {
      segments: sorted.map((row) => ({ region: row.region, share: row.share_pct })),
      notBrokenDown: rest > 0 ? rest : 0,
      source: source(report, sorted[0].scope, sorted[0].scope_label),
    };
  }

  let recruitersBlock: ListBlock | null = null;
  if (recruiters.length > 0) {
    const sorted = [...recruiters].sort(byPosition);
    recruitersBlock = { items: sorted.map((row) => row.company), source: source(report, sorted[0].scope, sorted[0].scope_label) };
  }

  const roles = report.top_roles.length > 0 ? { items: report.top_roles, source: own } : null;

  return { employment, salary, regions: regionsBlock, recruiters: recruitersBlock, roles };
}
