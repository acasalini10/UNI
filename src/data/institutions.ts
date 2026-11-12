// AI-assisted (Claude Code): searches public.institutions for the "Current university" field: universities of the student's country of residence first, then the rest.
import { normalizeForSearch } from "@/countries";

import { supabase } from "./supabase";

export type Institution = { name: string; country: string };
export type InstitutionsResult = { ok: true; data: Institution[] } | { ok: false };

const LOCAL_LIMIT = 20;
const TOTAL_LIMIT = 40;

export async function searchInstitutions(query: string, residence: string | null): Promise<InstitutionsResult> {
  // Wildcards typed by the student are removed, so they cannot widen the pattern.
  const words = normalizeForSearch(query).replace(/[%_*\\]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return { ok: true, data: [] };
  const pattern = `%${words.join("%")}%`;

  const base = () => supabase.from("institutions").select("name, country").ilike("search_name", pattern).order("name");
  const [local, all] = await Promise.all([
    residence ? base().eq("country", residence).limit(LOCAL_LIMIT) : Promise.resolve({ data: [] as Institution[], error: null }),
    base().limit(TOTAL_LIMIT),
  ]);
  if (local.error || all.error || !all.data) return { ok: false };

  const seen = new Set<string>();
  const merged: Institution[] = [];
  for (const row of [...(local.data ?? []), ...all.data]) {
    const key = `${row.name}|${row.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return { ok: true, data: merged.slice(0, TOTAL_LIMIT) };
}
