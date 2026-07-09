"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddRecipeState = { error?: string; success?: boolean };

export async function addRecipe(
  _prevState: AddRecipeState,
  formData: FormData,
): Promise<AddRecipeState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .insert({ title, description: description || null });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
