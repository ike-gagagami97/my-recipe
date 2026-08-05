/**
 * Playwright global teardown: deletes both test users created in global-setup.ts.
 * Recipe rows cascade-delete via the FK ON DELETE CASCADE on auth.users(id).
 */
import fs from "fs";
import path from "path";

const CREDENTIALS_FILE = path.join(__dirname, ".auth/credentials.json");

export default async function globalTeardown() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return;

  let credentials: {
    mainUser: { id: string };
    otherUser: { id: string };
  };

  try {
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
  } catch {
    return;
  }

  for (const user of [credentials.mainUser, credentials.otherUser]) {
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });
  }

  fs.rmSync(CREDENTIALS_FILE, { force: true });
  console.log("[global-teardown] Deleted test users.");
}
