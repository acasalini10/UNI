// AI-assisted (Claude Code): typed profile reads and updates for profile setup screens.
import { supabase } from "./supabase";

import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type ProfileResult<T> = { ok: true; data: T } | { ok: false; error: "offline" | "unknown" };

function mapError(error: { code?: string } | null): "offline" | "unknown" {
  return error?.code ? "unknown" : "offline";
}

export async function getProfile(): Promise<ProfileResult<Profile>> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { ok: false, error: "offline" };

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single();
  if (error || !data) return { ok: false, error: mapError(error) };
  return { ok: true, data };
}

export async function updateProfile(values: ProfileUpdate): Promise<ProfileResult<Profile>> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { ok: false, error: "offline" };

  const { data, error } = await supabase
    .from("profiles")
    .update(values)
    .eq("id", userData.user.id)
    .select("*")
    .single();
  if (error || !data) return { ok: false, error: mapError(error) };
  return { ok: true, data };
}
