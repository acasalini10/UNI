// AI-assisted (Claude Code): email sign-up, sign-in, sign-out and password reset by emailed code; Supabase errors mapped to the few cases the screens show.
import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import { supabase } from './supabase';

export type AuthError =
  | 'offline'
  | 'rateLimited'
  | 'wrongPassword'
  | 'emailTaken'
  | 'invalidCode'
  | 'unknown';

export type AuthResult = { ok: true } | { ok: false; error: AuthError };

function toAuthError(error: unknown): AuthError {
  // Status 0 means no response at all; 502-504 (e.g. an SMTP timeout) are server problems, not the phone's connection.
  if (isAuthRetryableFetchError(error)) return error.status === 0 ? 'offline' : 'unknown';
  if (isAuthApiError(error)) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'wrongPassword';
      case 'user_already_exists':
      case 'email_exists':
        return 'emailTaken';
      case 'otp_expired':
        return 'invalidCode';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'rateLimited';
    }
  }
  return 'unknown';
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

// Screen 1: new email goes to 1b, existing one to 1c.
export async function emailExists(
  email: string,
): Promise<{ ok: true; exists: boolean } | { ok: false; error: AuthError }> {
  const { data, error } = await supabase.rpc('email_exists', { p_email: normalize(email) });
  if (error) {
    // PostgREST reports a failed fetch with an empty code.
    return { ok: false, error: error.code ? 'unknown' : 'offline' };
  }
  return { ok: true, exists: data };
}

// Screen 1b. Email confirmation is off (decision 2026-10-17), so this also signs the user in.
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signUp({ email: normalize(email), password });
  return error ? { ok: false, error: toAuthError(error) } : { ok: true };
}

// Screen 1c.
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email: normalize(email), password });
  return error ? { ok: false, error: toAuthError(error) } : { ok: true };
}

// Settings 13 "Log out"; for now also the dev-only button on the home placeholder.
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return error ? { ok: false, error: toAuthError(error) } : { ok: true };
}

// Screen 1c "Forgot password?" and 1d "Send a new code". The email template shows {{ .Token }}.
export async function sendResetCode(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(normalize(email));
  return error ? { ok: false, error: toAuthError(error) } : { ok: true };
}

// Screen 1d. Verifying the code signs the user in; the new password is saved right after.
export async function resetPassword(
  email: string,
  code: string,
  password: string,
): Promise<AuthResult> {
  const verified = await supabase.auth.verifyOtp({
    email: normalize(email),
    token: code.trim(),
    type: 'recovery',
  });
  if (verified.error) {
    const error = toAuthError(verified.error);
    // A wrong code comes back as a generic 403, not as otp_expired.
    return { ok: false, error: error === 'unknown' && verified.error.status === 403 ? 'invalidCode' : error };
  }
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { ok: false, error: toAuthError(error) } : { ok: true };
}
