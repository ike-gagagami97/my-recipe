"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  // scope: 'local' logs out only the current session/device.
  // Without it, signOut() defaults to 'global' and invalidates all active
  // sessions for the user, which breaks parallel E2E tests (and multi-device usage).
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
