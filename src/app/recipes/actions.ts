"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { optionalText, parseCookingTimeInput } from "@/lib/recipes";

export async function logout() {
  const supabase = await createClient();
  // scope: 'local' logs out only the current session/device.
  // Without it, signOut() defaults to 'global' and invalidates all active
  // sessions for the user, which breaks parallel E2E tests (and multi-device usage).
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}

export type CreateRecipeValues = {
  title: string;
  cooking_time_minutes: string;
  ingredients: string;
  steps: string;
  notes: string;
};

export type CreateRecipeState = {
  error?: string;
  fieldErrors?: {
    title?: string;
    cooking_time_minutes?: string;
  };
  values: CreateRecipeValues;
} | null;

function readValues(formData: FormData): CreateRecipeValues {
  return {
    title: (formData.get("title") ?? "").toString(),
    cooking_time_minutes: (
      formData.get("cooking_time_minutes") ?? ""
    ).toString(),
    ingredients: (formData.get("ingredients") ?? "").toString(),
    steps: (formData.get("steps") ?? "").toString(),
    notes: (formData.get("notes") ?? "").toString(),
  };
}

export async function createRecipe(
  _prevState: CreateRecipeState,
  formData: FormData,
): Promise<CreateRecipeState> {
  const values = readValues(formData);
  const title = values.title.trim();
  const fieldErrors: NonNullable<CreateRecipeState>["fieldErrors"] = {};

  if (!title) {
    fieldErrors.title = "タイトルを入力してください";
  }

  const cookingTime = parseCookingTimeInput(values.cooking_time_minutes);
  if (!cookingTime.ok) {
    fieldErrors.cooking_time_minutes = cookingTime.error;
  }

  if (fieldErrors.title || fieldErrors.cooking_time_minutes) {
    return { fieldErrors, values };
  }

  // Narrowed: cookingTime.ok is true when fieldErrors.cooking_time_minutes is unset.
  const cookingTimeMinutes = cookingTime.ok ? cookingTime.value : null;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      error: "Supabase が設定されていません（環境変数を確認してください）",
      values,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      title,
      cooking_time_minutes: cookingTimeMinutes,
      ingredients: optionalText(values.ingredients),
      steps: optionalText(values.steps),
      notes: optionalText(values.notes),
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error: "レシピの保存に失敗しました。もう一度お試しください。",
      values,
    };
  }

  redirect(`/recipes/${data.id}`);
}
