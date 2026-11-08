// AI-assisted (Claude Code): deletes the calling user's PDFs in Storage, then the auth user; every table row goes with it through "on delete cascade".
import { createClient } from "jsr:@supabase/supabase-js@2";

const BUCKET = "documents";
const PAGE = 100;

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);

  // The service role bypasses RLS, so the user id must come from the verified JWT, never from the request body.
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return json({ error: "unauthorized" }, 401);
  const userId = userData.user.id;

  // Storage files are not linked to auth.users by a foreign key, so they would stay behind.
  // Files live flat in "<user_id>/"; list and remove a page at a time until the folder is empty.
  const bucket = admin.storage.from(BUCKET);
  for (;;) {
    const { data: entries, error: listError } = await bucket.list(userId, { limit: PAGE });
    if (listError) return json({ error: "storage_list_failed" }, 500);
    const paths = entries.filter((entry) => entry.id !== null).map((entry) => `${userId}/${entry.name}`);
    if (paths.length === 0) break;
    const { error: removeError } = await bucket.remove(paths);
    if (removeError) return json({ error: "storage_remove_failed" }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json({ error: "delete_failed" }, 500);

  return json({ ok: true });
});
