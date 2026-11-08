// AI-assisted (Claude Code): Settings 13 "Delete account": calls the delete-account Edge Function, then clears the local session.
import { FunctionsFetchError } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type DeleteAccountResult = { ok: true } | { ok: false; error: 'offline' | 'unknown' };

export async function deleteAccount(): Promise<DeleteAccountResult> {
  // invoke() sends the signed-in user's access token; the function reads the user id from it.
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) {
    return { ok: false, error: error instanceof FunctionsFetchError ? 'offline' : 'unknown' };
  }
  // The user no longer exists on the server, so only the session stored on the phone is cleared.
  // The session guard in app/_layout.tsx then opens screen 1.
  await supabase.auth.signOut({ scope: 'local' });
  return { ok: true };
}
