/**
 * Shared helpers for E2E specs:
 * - Supabase JS client factory for seeding test data
 * - psql-based cleanup (DELETE grant is not yet granted to authenticated role)
 * - Credential loading
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createClient } from "@supabase/supabase-js";

const CREDENTIALS_FILE = path.join(__dirname, ".auth/credentials.json");

export type Credentials = {
  mainUser: { id: string; email: string; password: string };
  otherUser: { id: string; email: string; password: string };
};

export function loadCredentials(): Credentials {
  return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
}

/** Returns a Supabase client authenticated as the main test user. */
export async function mainUserClient() {
  const creds = loadCredentials();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: creds.mainUser.email,
    password: creds.mainUser.password,
  });
  if (error) throw new Error(`mainUserClient: sign-in failed: ${error.message}`);
  return supabase;
}

/** Returns a Supabase client authenticated as the other test user. */
export async function otherUserClient() {
  const creds = loadCredentials();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
  const { error } = await supabase.auth.signInWithPassword({
    email: creds.otherUser.email,
    password: creds.otherUser.password,
  });
  if (error) throw new Error(`otherUserClient: sign-in failed: ${error.message}`);
  return supabase;
}

/**
 * Deletes all recipes for a given user_id via psql.
 * E2E cleanup uses psql for speed and to avoid depending on delete UI in every spec.
 */
function deleteRecipesByUserId(userId: string) {
  execSync(
    `docker exec -i supabase_db_workspace psql -U postgres -d postgres -c "DELETE FROM public.recipes WHERE user_id = '${userId}'"`,
    { stdio: "pipe" },
  );
}

/** Deletes all recipes owned by the main test user. */
export function cleanupMainUserRecipes() {
  const { mainUser } = loadCredentials();
  deleteRecipesByUserId(mainUser.id);
}

/** Deletes all recipes owned by the other test user. */
export function cleanupOtherUserRecipes() {
  const { otherUser } = loadCredentials();
  deleteRecipesByUserId(otherUser.id);
}
