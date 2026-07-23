import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function RecipesPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Recipe</h1>
          <p className="mt-1 text-sm opacity-60">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-xl border border-black/10 dark:border-white/15 p-6">
        <h2 className="text-lg font-semibold">レシピ一覧</h2>
        <p className="mt-2 text-sm opacity-75">
          レシピ機能は準備中です。次のフェーズで追加されます。
        </p>
      </section>
    </main>
  );
}
