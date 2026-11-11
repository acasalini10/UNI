// AI-assisted (Claude Code): Feedback 6a and 6: AI consent on the profile, a round from the feedback Edge Function, and the latest saved round.
import { FunctionsFetchError, FunctionsHttpError } from "@supabase/supabase-js";

import { currentLanguage } from "@/i18n";

import { supabase } from "./supabase";

export type FeedbackPriority = "fix_first" | "improve";
export interface FeedbackIssue {
  priority: FeedbackPriority;
  document: "cv" | "statement";
  text: string;
}

export interface FeedbackRound {
  id: string;
  createdAt: string;
  programId: string | null;
  program: string | null; // null when the program was removed from the catalog
  university: string | null;
  cvDocumentId: string | null;
  cvFileName: string | null;
  statementDocumentId: string | null;
  statementFileName: string | null;
  issues: FeedbackIssue[];
}

export type FeedbackError =
  | "offline"
  | "unknown"
  | "consent_required"
  | "daily_limit"
  | "too_large"
  | "not_found"
  | "analysis_failed";

type Result<T, E = "offline" | "unknown"> = { ok: true; data: T } | { ok: false; error: E };

// Stores the student's choice with its time (App Review 5.1.2(i)). The Edge Function reads the same column.
export async function setAiConsent(consent: boolean): Promise<Result<null>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "offline" };
  const { error } = await supabase
    .from("profiles")
    .update({ ai_consent: consent, ai_consent_at: consent ? new Date().toISOString() : null })
    .eq("id", userData.user.id);
  if (error) return { ok: false, error: error.code ? "unknown" : "offline" };
  return { ok: true, data: null };
}

const knownErrors: FeedbackError[] = ["consent_required", "daily_limit", "too_large", "not_found", "analysis_failed"];

// Takes 15 to 30 seconds: Claude reads both PDFs. The function counts the daily limit and checks consent again.
export async function requestFeedback(input: {
  programId: string;
  cvDocumentId: string;
  statementDocumentId: string;
}): Promise<Result<Pick<FeedbackRound, "id" | "createdAt" | "issues">, FeedbackError>> {
  const { data, error } = await supabase.functions.invoke<{ id: string; createdAt: string; issues: FeedbackIssue[] }>("feedback", {
    method: "POST",
    body: { ...input, language: currentLanguage() },
  });
  if (error) {
    if (error instanceof FunctionsFetchError) return { ok: false, error: "offline" };
    if (error instanceof FunctionsHttpError) {
      // The function answers { error: "<code>" }; anything else is shown as a generic failure.
      const body = (await (error.context as Response).json().catch(() => null)) as { error?: string } | null;
      const code = knownErrors.find((known) => known === body?.error);
      return { ok: false, error: code ?? "unknown" };
    }
    return { ok: false, error: "unknown" };
  }
  if (!data) return { ok: false, error: "unknown" };
  return { ok: true, data };
}

type RoundRow = {
  id: string;
  created_at: string;
  program_id: string | null;
  cv_document_id: string | null;
  statement_document_id: string | null;
  result: { issues?: FeedbackIssue[] } | null;
  programs: { program: string; universities: { name: string } } | null;
  cv: { file_name: string } | null;
  statement: { file_name: string } | null;
};

// Only the latest round is shown in v1 (flows.md §6). RLS returns only the student's own rounds.
export async function getLatestRound(): Promise<Result<FeedbackRound | null>> {
  const { data, error } = await supabase
    .from("feedback_rounds")
    .select(
      "id, created_at, program_id, cv_document_id, statement_document_id, result, programs(program, universities!inner(name)), cv:documents!feedback_rounds_cv_document_id_fkey(file_name), statement:documents!feedback_rounds_statement_document_id_fkey(file_name)",
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<RoundRow>();
  if (error) return { ok: false, error: error.code ? "unknown" : "offline" };
  if (!data) return { ok: true, data: null };
  return {
    ok: true,
    data: {
      id: data.id,
      createdAt: data.created_at,
      programId: data.program_id,
      program: data.programs?.program ?? null,
      university: data.programs?.universities.name ?? null,
      cvDocumentId: data.cv_document_id,
      cvFileName: data.cv?.file_name ?? null,
      statementDocumentId: data.statement_document_id,
      statementFileName: data.statement?.file_name ?? null,
      issues: data.result?.issues ?? [],
    },
  };
}
