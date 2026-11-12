// AI-assisted (Claude Code): loads a program's career data (three read-only tables) and returns the blocks ready for Careers 8 and the preview on 4.
import { toCareerBlocks, type CareerBlocks } from "./careerBlocks";
import { displayCurrency, rates, type Profile } from "./profile";
import { supabase } from "./supabase";

export type CareersResult = { ok: true; data: CareerBlocks } | { ok: false; error: "offline" | "unknown" };

export async function getCareers(programId: string, profile: Profile): Promise<CareersResult> {
  const [report, recruiters, regions] = await Promise.all([
    supabase.from("program_careers").select("*").eq("program_id", programId).maybeSingle(),
    supabase.from("program_recruiters").select("company, position, scope, scope_label").eq("program_id", programId),
    supabase.from("program_regions").select("region, share_pct, position, scope, scope_label").eq("program_id", programId),
  ]);
  const error = report.error ?? recruiters.error ?? regions.error;
  if (error) return { ok: false, error: error.code ? "unknown" : "offline" };
  return {
    ok: true,
    data: toCareerBlocks(report.data, recruiters.data ?? [], regions.data ?? [], displayCurrency(profile), rates),
  };
}
