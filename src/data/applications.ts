// AI-assisted (Claude Code): typed queries for Applications 5a/11, Add a university 9, University's master's 10 and Checklist 12/12d: list, add, remove, universities search, programs of one university; "just added" hand-off from 10 to 11; one application with its program and attached documents, attach a document (Saved becomes In progress), mark as submitted.
import { daysUntil } from "@/format";

import type { UserDocument } from "./documents";
import { supabase } from "./supabase";
import type { ProgramWithUniversity } from "./programs";

import type { Database } from "./database.types";

type ApplicationRecord = Database["public"]["Tables"]["applications"]["Row"];
type UniversityRecord = Database["public"]["Tables"]["universities"]["Row"];

export type ApplicationStatus = "saved" | "in_progress" | "submitted";
export type DataError = "offline" | "unknown";

export interface Application {
  id: string;
  programId: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  createdAt: string;
  program: string;
  deadline: string | null; // YYYY-MM-DD
  universityId: string;
  university: string;
  initials: string;
  brandColor: string | null;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: DataError };

// A Supabase error with a code came from the server; without one the request never arrived.
function errorOf(error: { code?: string } | null): DataError {
  return error?.code ? "unknown" : "offline";
}

type ApplicationRow = ApplicationRecord & {
  programs: { program: string; deadline: string | null; universities: Pick<UniversityRecord, "id" | "name" | "initials" | "brand_color"> };
};

function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    programId: row.program_id,
    status: row.status as ApplicationStatus,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    program: row.programs.program,
    deadline: row.programs.deadline,
    universityId: row.programs.universities.id,
    university: row.programs.universities.name,
    initials: row.programs.universities.initials,
    brandColor: row.programs.universities.brand_color,
  };
}

// Newest first, so a card just added is on top (11). RLS returns only the student's own rows.
export async function listApplications(): Promise<Result<Application[]>> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, programs!inner(program, deadline, universities!inner(id, name, initials, brand_color))")
    .order("created_at", { ascending: false });
  if (error || !data) return { ok: false, error: errorOf(error) };
  return { ok: true, data: data.map(toApplication) };
}

// Programs the student already tracks, with their status, for the bookmark on Programs 3 and 4 and the rows on 10.
export type SavedPrograms = Map<string, ApplicationStatus>;

export async function savedPrograms(): Promise<Result<SavedPrograms>> {
  const { data, error } = await supabase.from("applications").select("program_id, status");
  if (error || !data) return { ok: false, error: errorOf(error) };
  return { ok: true, data: new Map(data.map((row) => [row.program_id, row.status as ApplicationStatus])) };
}

// Adds the program with status Saved and returns the application id. Adding twice returns the existing row.
export async function addApplication(programId: string): Promise<Result<string>> {
  const { data, error } = await supabase.from("applications").insert({ program_id: programId }).select("id").single();
  if (data) return { ok: true, data: data.id };
  if (error?.code === "23505") {
    const existing = await supabase.from("applications").select("id").eq("program_id", programId).maybeSingle();
    if (existing.data) return { ok: true, data: existing.data.id };
  }
  return { ok: false, error: errorOf(error) };
}

export async function removeApplication(programId: string): Promise<Result<null>> {
  const { error } = await supabase.from("applications").delete().eq("program_id", programId);
  if (error) return { ok: false, error: errorOf(error) };
  return { ok: true, data: null };
}

// Counters on 5a. "Days to next deadline" counts only applications not submitted yet whose deadline has not passed.
export interface ApplicationCounters {
  universities: number;
  applied: number;
  nextDeadlineDays: number | null;
}

export function counters(applications: Application[], today = new Date()): ApplicationCounters {
  const upcoming = applications
    .filter((a) => a.status !== "submitted" && a.deadline)
    .map((a) => daysUntil(a.deadline!, today))
    .filter((days) => days >= 0);
  return {
    universities: new Set(applications.map((a) => a.universityId)).size,
    applied: applications.filter((a) => a.status === "submitted").length,
    nextDeadlineDays: upcoming.length ? Math.min(...upcoming) : null,
  };
}

export type University = Pick<UniversityRecord, "id" | "name" | "city" | "country" | "initials" | "brand_color">;

export async function listUniversities(): Promise<Result<University[]>> {
  const { data, error } = await supabase.from("universities").select("id, name, city, country, initials, brand_color").order("name");
  if (error || !data) return { ok: false, error: errorOf(error) };
  return { ok: true, data };
}

// Case and accent insensitive, so "mexico" finds "México" and "zur" finds "Zürich".
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function searchUniversities(universities: University[], query: string): University[] {
  const q = normalize(query);
  if (!q) return universities;
  return universities.filter((u) => normalize(u.name).includes(q) || normalize(u.city).includes(q));
}

export async function getUniversityPrograms(universityId: string): Promise<Result<ProgramWithUniversity[]>> {
  const { data, error } = await supabase
    .from("programs")
    .select("*, universities!inner(name, city, country, initials, brand_color)")
    .eq("university_id", universityId)
    .order("program");
  if (error || !data) return { ok: false, error: errorOf(error) };
  return { ok: true, data };
}

// Checklist 12: one application with its full program row and the documents attached to it.
export interface ApplicationDetail {
  id: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  program: ProgramWithUniversity;
  attached: UserDocument[];
}

type DetailRow = ApplicationRecord & {
  programs: ProgramWithUniversity;
  application_documents: { documents: UserDocument }[];
};

export async function getApplication(id: string): Promise<Result<ApplicationDetail> | { ok: false; error: "not_found" }> {
  const { data, error } = await supabase
    .from("applications")
    .select("*, programs!inner(*, universities!inner(name, city, country, initials, brand_color)), application_documents(documents!inner(*))")
    .eq("id", id)
    .maybeSingle<DetailRow>();
  if (error) return { ok: false, error: errorOf(error) };
  if (!data) return { ok: false, error: "not_found" };
  return {
    ok: true,
    data: {
      id: data.id,
      status: data.status as ApplicationStatus,
      submittedAt: data.submitted_at,
      program: data.programs,
      attached: data.application_documents.map((row) => row.documents),
    },
  };
}

// Attaching a document is the first step of the work, so a Saved application becomes In progress (decision 2026-11-10).
export async function attachDocument(application: Pick<ApplicationDetail, "id" | "status">, documentId: string): Promise<Result<ApplicationStatus>> {
  const { error } = await supabase.from("application_documents").insert({ application_id: application.id, document_id: documentId });
  // Already attached (primary key): nothing to add.
  if (error && error.code !== "23505") return { ok: false, error: errorOf(error) };
  if (application.status !== "saved") return { ok: true, data: application.status };
  const update = await supabase.from("applications").update({ status: "in_progress" }).eq("id", application.id);
  // The file is attached even if the status update fails; the checklist still counts it.
  return { ok: true, data: update.error ? "saved" : "in_progress" };
}

// "I've submitted my application" (12b → 12c). Set by the student: the app cannot see the university's portal.
export async function markSubmitted(applicationId: string): Promise<Result<string>> {
  const { data, error } = await supabase
    .from("applications")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", applicationId)
    .select("submitted_at")
    .single();
  if (error || !data?.submitted_at) return { ok: false, error: errorOf(error) };
  return { ok: true, data: data.submitted_at };
}

// 10 → 11: the program just added, read once by Applications to show the banner and highlight the card.
let justAdded: { applicationId: string; programId: string } | null = null;

export function setJustAdded(value: { applicationId: string; programId: string }): void {
  justAdded = value;
}

export function takeJustAdded(): { applicationId: string; programId: string } | null {
  const value = justAdded;
  justAdded = null;
  return value;
}
