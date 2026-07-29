import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../logout-button";
import {
  formatCookingTime,
  formatDate,
  listHref,
  pickListParams,
  splitLines,
} from "@/lib/recipes";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-lg font-semibold">{children}</h2>;
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="text-sm opacity-50">{children}</p>;
}

export default async function RecipeDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
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
  const backHref = listHref(pickListParams(await searchParams));

  // A malformed id would make Postgres raise instead of returning zero rows.
  if (!UUID_PATTERN.test(id)) notFound();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, cooking_time_minutes, ingredients, steps, notes, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <Link
          href={backHref}
          className="text-sm opacity-60 transition-opacity hover:opacity-100"
        >
          ← 一覧に戻る
        </Link>
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          レシピの取得に失敗しました。ページを再読み込みしてください。
        </p>
      </main>
    );
  }

  // RLS keeps other users' rows out of the result, so they land here too.
  if (!recipe) notFound();

  const ingredients = splitLines(recipe.ingredients);
  const steps = splitLines(recipe.steps);
  const notes = recipe.notes?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <Link
          href={backHref}
          className="text-sm opacity-60 transition-opacity hover:opacity-100"
        >
          ← 一覧に戻る
        </Link>
        <LogoutButton />
      </header>

      <article>
        <h1 className="text-3xl font-bold tracking-tight break-words">
          {recipe.title}
        </h1>

        <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm opacity-70">
          <div className="flex gap-2">
            <dt>所要時間</dt>
            <dd className="tabular-nums">
              {recipe.cooking_time_minutes === null
                ? "未設定"
                : formatCookingTime(recipe.cooking_time_minutes)}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt>更新日時</dt>
            <dd className="tabular-nums">{formatDate(recipe.updated_at)}</dd>
          </div>
        </dl>

        <section className="mt-10">
          <SectionHeading>材料</SectionHeading>
          {ingredients.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {ingredients.map((ingredient, i) => (
                <li key={i} className="break-words">
                  {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>材料は登録されていません。</EmptyNote>
          )}
        </section>

        <section className="mt-10">
          <SectionHeading>手順</SectionHeading>
          {steps.length > 0 ? (
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {steps.map((step, i) => (
                <li key={i} className="break-words">
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <EmptyNote>手順は登録されていません。</EmptyNote>
          )}
        </section>

        <section className="mt-10">
          <SectionHeading>メモ</SectionHeading>
          {notes ? (
            <p className="text-sm whitespace-pre-wrap break-words">{notes}</p>
          ) : (
            <EmptyNote>メモはありません。</EmptyNote>
          )}
        </section>
      </article>
    </main>
  );
}
