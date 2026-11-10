// AI-assisted (Claude Code): the student's PDFs: list by kind, pick one from the phone and upload it to the private documents bucket, then save its row.
import { StorageApiError } from "@supabase/supabase-js";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";

import { supabase } from "./supabase";

import type { Database } from "./database.types";

export type UserDocument = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentKind = "cv" | "motivation_letter" | "reference_letter";
export const documentKinds: DocumentKind[] = ["cv", "motivation_letter", "reference_letter"];

// Same limits as the bucket and the documents table (decision 2026-10-17): PDF only, 10 MB.
const MAX_BYTES = 10 * 1024 * 1024;
const PDF = "application/pdf";

export type DocumentError = "offline" | "unknown" | "wrong_type" | "too_large";
export type DocumentResult<T> = { ok: true; data: T } | { ok: false; error: DocumentError };

// A row error with a Postgres code means the server answered; no code means no connection.
function mapError(error: { code?: string } | null): "offline" | "unknown" {
  return error?.code ? "unknown" : "offline";
}

// Newest first, so the first document of a kind is the latest upload.
export async function listDocuments(): Promise<DocumentResult<UserDocument[]>> {
  const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
  if (error || !data) return { ok: false, error: mapError(error) };
  return { ok: true, data };
}

// Opens the iOS file picker (PDFs only) and uploads the chosen file.
// data is null when the student closes the picker without choosing.
export async function pickAndUploadDocument(kind: DocumentKind): Promise<DocumentResult<UserDocument | null>> {
  const picked = await DocumentPicker.getDocumentAsync({ type: PDF, copyToCacheDirectory: true, multiple: false });
  if (picked.canceled) return { ok: true, data: null };
  const asset = picked.assets[0];

  // The picker already filters to PDFs; the name check covers files shared from other apps without a type.
  const isPdf = asset.mimeType === PDF || asset.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return { ok: false, error: "wrong_type" };

  const file = new File(asset.uri);
  const size = asset.size ?? file.size;
  if (size > MAX_BYTES) return { ok: false, error: "too_large" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { ok: false, error: "offline" };
  const userId = userData.user.id;

  // The storage policies only allow paths inside the user's own folder.
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
  const bytes = await file.arrayBuffer();
  const upload = await supabase.storage.from("documents").upload(path, bytes, { contentType: PDF });
  if (upload.error) return { ok: false, error: upload.error instanceof StorageApiError ? "unknown" : "offline" };

  const { data, error } = await supabase
    .from("documents")
    .insert({ kind, storage_path: path, file_name: asset.name, size_bytes: size })
    .select("*")
    .single();
  if (error || !data) {
    // Without its row the file would be invisible in the app: remove it again.
    await supabase.storage.from("documents").remove([path]);
    return { ok: false, error: mapError(error) };
  }
  return { ok: true, data };
}
