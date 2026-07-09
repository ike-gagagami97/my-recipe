import { createClient } from "@/lib/supabase/server";
import type { Recipe } from "@/lib/supabase/types";
import { RecipeForm } from "./recipe-form";

const isConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getRecipes(): Promise<{ recipes: Recipe[]; error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { recipes: [], error: error.message };
  }
  return { recipes: (data as Recipe[]) ?? [] };
}

export default async function Home() {
  const { recipes, error } = isConfigured
    ? await getRecipes()
    : { recipes: [] as Recipe[], error: undefined };

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Recipe</h1>
        <p className="mt-1 text-sm opacity-70">
          A recipe app built with Next.js and Supabase.
        </p>
      </header>

      {!isConfigured ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm">
          <p className="font-medium">Supabase is not configured yet.</p>
          <p className="mt-1 opacity-80">
            Copy <code>.env.example</code> to <code>.env.local</code> and set
            <code> NEXT_PUBLIC_SUPABASE_URL</code> and
            <code> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see <code>README.md</code>).
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <RecipeForm />

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              Recipes {recipes.length > 0 ? `(${recipes.length})` : ""}
            </h2>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Could not load recipes: {error}
              </p>
            ) : recipes.length === 0 ? (
              <p className="text-sm opacity-70">
                No recipes yet. Add your first one above.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {recipes.map((recipe) => (
                  <li
                    key={recipe.id}
                    className="rounded-xl border border-black/10 dark:border-white/15 p-4"
                  >
                    <h3 className="font-medium">{recipe.title}</h3>
                    {recipe.description ? (
                      <p className="mt-1 text-sm opacity-75">
                        {recipe.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
