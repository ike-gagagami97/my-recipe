import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../logout-button";
import RecipeCreateForm from "./recipe-create-form";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <Link
            href="/recipes"
            className="text-sm opacity-60 transition-opacity hover:opacity-100"
          >
            ← 一覧に戻る
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            レシピを追加
          </h1>
        </div>
        <LogoutButton />
      </header>

      <RecipeCreateForm />
    </main>
  );
}
