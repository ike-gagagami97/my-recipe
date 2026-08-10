import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../logout-button";
import RecipeEditForm from "./recipe-edit-form";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Promise<{ id: string }>;

export default async function EditRecipePage({ params }: { params: Params }) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, cooking_time_minutes, ingredients, steps, notes",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <header className="mb-10 flex items-start justify-between gap-4">
          <Link
            href={`/recipes/${id}`}
            className="text-sm opacity-60 transition-opacity hover:opacity-100"
          >
            ← 詳細に戻る
          </Link>
          <LogoutButton />
        </header>
        <p
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          レシピの取得に失敗しました。ページを再読み込みしてください。
        </p>
      </main>
    );
  }

  if (!recipe) notFound();

  const initialValues = {
    title: recipe.title ?? "",
    cooking_time_minutes:
      recipe.cooking_time_minutes === null ||
      recipe.cooking_time_minutes === undefined
        ? ""
        : String(recipe.cooking_time_minutes),
    ingredients: recipe.ingredients ?? "",
    steps: recipe.steps ?? "",
    notes: recipe.notes ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-sm opacity-60 transition-opacity hover:opacity-100"
          >
            ← 詳細に戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            レシピを編集
          </h1>
        </div>
        <LogoutButton />
      </header>

      <RecipeEditForm recipeId={recipe.id} initialValues={initialValues} />
    </main>
  );
}
