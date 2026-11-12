// AI-assisted (Claude Code): tests for toCareerBlocks.
/// <reference types="jest" />
import { hasCareerData, toCareerBlocks, type CareerRow, type RecruiterRow, type RegionRow } from "./careerBlocks";

const rates = { date: "2026-11-09", base: "USD", rates: { USD: 1, MXN: 18.6134, GBP: 0.74538 } };

const report: CareerRow = {
  id: "c1",
  program_id: "p1",
  scope: "program",
  scope_label: null,
  report_url: "https://example.edu/report.pdf",
  report_year: "2025",
  avg_salary: 100000,
  salary_currency: "USD",
  salary_stat: "mean",
  employed_pct: 95.5,
  employed_months: 3,
  top_roles: ["Data Scientist", "Analyst"],
  notes: "internal",
  checked_on: "2026-11-11",
  created_at: "2026-11-12T00:00:00Z",
};

const recruiter = (company: string, position: number, scope = "program", scope_label: string | null = null): RecruiterRow => ({
  company,
  position,
  scope,
  scope_label,
});
const region = (name: string, share_pct: number, position: number, scope = "program", scope_label: string | null = null): RegionRow => ({
  region: name,
  share_pct,
  position,
  scope,
  scope_label,
});

describe("toCareerBlocks", () => {
  it("returns no blocks without the careers row, even with recruiters", () => {
    const blocks = toCareerBlocks(null, [recruiter("Amazon", 1)], [], "USD", rates);
    expect(hasCareerData(blocks)).toBe(false);
  });

  it("builds every block from full data, with the program's own source", () => {
    const blocks = toCareerBlocks(report, [recruiter("Amazon", 1)], [region("United States", 100, 1)], "MXN", rates);
    expect(blocks.employment).toEqual({ pct: 95.5, months: 3, source: { url: report.report_url, year: "2025", scopeLabel: null } });
    expect(blocks.salary?.stat).toBe("mean");
    expect(blocks.salary?.converted?.currency).toBe("MXN");
    expect(blocks.salary?.converted?.amount).toBeCloseTo(1861340);
    expect(blocks.salary?.converted?.rateDate).toBe("2026-11-09");
    expect(blocks.roles?.items).toEqual(["Data Scientist", "Analyst"]);
    expect(hasCareerData(blocks)).toBe(true);
  });

  it("hides each empty block on its own", () => {
    const blocks = toCareerBlocks(
      { ...report, avg_salary: null, salary_currency: null, salary_stat: null, employed_pct: null, employed_months: null, top_roles: [] },
      [],
      [],
      "USD",
      rates,
    );
    expect(blocks).toEqual({ employment: null, salary: null, regions: null, recruiters: null, roles: null });
    expect(hasCareerData(blocks)).toBe(false);
  });

  it("keeps employment without months", () => {
    const blocks = toCareerBlocks({ ...report, employed_months: null }, [], [], "USD", rates);
    expect(blocks.employment?.months).toBeNull();
  });

  it("does not convert a salary already in the student's currency", () => {
    const blocks = toCareerBlocks({ ...report, salary_stat: "median" }, [], [], "usd", rates);
    expect(blocks.salary).toMatchObject({ stat: "median", amount: 100000, currency: "USD", converted: null });
  });

  it("shows no conversion when the student's currency has no rate", () => {
    const blocks = toCareerBlocks(report, [], [], "JPY", rates);
    expect(blocks.salary?.converted).toBeNull();
  });

  it("orders regions by position and adds the rest as not broken down", () => {
    const blocks = toCareerBlocks(report, [], [region("Europe", 20, 2), region("United Kingdom", 47, 1)], "USD", rates);
    expect(blocks.regions?.segments).toEqual([
      { region: "United Kingdom", share: 47 },
      { region: "Europe", share: 20 },
    ]);
    expect(blocks.regions?.notBrokenDown).toBe(33);
  });

  it("leaves no grey segment when shares add up to 100, despite float sums", () => {
    const blocks = toCareerBlocks(report, [], [region("A", 95.4, 1), region("B", 3.1, 2), region("C", 1.5, 3)], "USD", rates);
    expect(blocks.regions?.notBrokenDown).toBe(0);
  });

  it("labels recruiters and regions with their own scope", () => {
    const label = "Columbia IEOR (combined)";
    const blocks = toCareerBlocks(
      report,
      [recruiter("Citi", 2, "department", label), recruiter("Amazon", 1, "department", label)],
      [region("Asia", 10, 1, "school", "Whole school")],
      "USD",
      rates,
    );
    expect(blocks.recruiters).toEqual({ items: ["Amazon", "Citi"], source: { url: report.report_url, year: "2025", scopeLabel: label } });
    expect(blocks.regions?.source.scopeLabel).toBe("Whole school");
    expect(blocks.employment?.source.scopeLabel).toBeNull();
  });

  it("shows the report's scope label on employment, salary and roles", () => {
    const blocks = toCareerBlocks({ ...report, scope: "department", scope_label: "LSE Department of Management", report_year: null }, [], [], "USD", rates);
    expect(blocks.employment?.source).toEqual({ url: report.report_url, year: null, scopeLabel: "LSE Department of Management" });
    expect(blocks.roles?.source.scopeLabel).toBe("LSE Department of Management");
  });
});
