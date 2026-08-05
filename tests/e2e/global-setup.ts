/**
 * Playwright global setup: creates two test users via the Supabase admin API.
 * Credentials are saved to tests/e2e/.auth/credentials.json for use by specs.
 * Users are deleted in global-teardown.ts (recipes cascade via FK).
 */
import fs from "fs";
import path from "path";

// Use unique email addresses per test run to avoid Supabase Auth rate limiting
// that occurs when the same email is deleted and recreated repeatedly.
const RUN_ID = Date.now();
export const TEST_USER_EMAIL = `e2e-${RUN_ID}-main@example.com`;
export const TEST_USER_PASSWORD = "E2eTest123!";
export const OTHER_USER_EMAIL = `e2e-${RUN_ID}-other@example.com`;
export const OTHER_USER_PASSWORD = "E2eTest123!";

const CREDENTIALS_FILE = path.join(__dirname, ".auth/credentials.json");

async function createUser(
  adminUrl: string,
  serviceRoleKey: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${adminUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create user ${email}: ${res.status} ${body}`);
  }
  const data = await res.json() as { id: string; email?: string; email_confirmed_at?: string };
  console.log(`[global-setup] Created ${data.email} id=${data.id?.slice(0, 8)} confirmed=${!!data.email_confirmed_at}`);
  return data.id;
}

export default async function globalSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
    );
  }

  const mainUserId = await createUser(
    supabaseUrl,
    serviceRoleKey,
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD,
  );
  const otherUserId = await createUser(
    supabaseUrl,
    serviceRoleKey,
    OTHER_USER_EMAIL,
    OTHER_USER_PASSWORD,
  );


  const credentials = {
    mainUser: { id: mainUserId, email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
    otherUser: { id: otherUserId, email: OTHER_USER_EMAIL, password: OTHER_USER_PASSWORD },
  };

  fs.mkdirSync(path.dirname(CREDENTIALS_FILE), { recursive: true });
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));

  console.log(`[global-setup] Created test users: ${mainUserId}, ${otherUserId}`);
}
