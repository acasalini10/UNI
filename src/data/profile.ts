// AI-assisted (Claude Code): typed profile reads and updates for profile setup screens, plus useSetupStep() for first-time routing.
import { useEffect, useState } from "react";

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
  setupStepListeners.forEach((listener) => listener(data.setup_step));
  return { ok: true, data };
}

// Every save tells mounted useSetupStep() hooks the new step, so the root layout
// lets the user into the tabs right after step 1 without reading the profile again.
const setupStepListeners = new Set<(step: number) => void>();

// setup_step of the signed-in user: 0 = nothing saved, 1 = step 1 saved, 2 = step 2 saved.
// step is null when signed out or when the profile could not be read (offline).
export function useSetupStep(userId: string | null): { step: number | null; loading: boolean } {
  const [loaded, setLoaded] = useState<{ userId: string; step: number | null } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void supabase
      .from("profiles")
      .select("setup_step")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (active) setLoaded({ userId, step: data?.setup_step ?? null });
      });
    const listener = (step: number) => setLoaded({ userId, step });
    setupStepListeners.add(listener);
    return () => {
      active = false;
      setupStepListeners.delete(listener);
    };
  }, [userId]);

  if (!userId) return { step: null, loading: false };
  if (loaded?.userId !== userId) return { step: null, loading: true };
  return { step: loaded.step, loading: false };
}
