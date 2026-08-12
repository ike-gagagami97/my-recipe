import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../logout-button";
import RecipeDeleteButton from "./recipe-delete-button";
import RecipeDetailStaleGuard from "./recipe-detail-stale-guard";
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

function DetailHeader({ backHref }: { backHref: string }) {
  return (
    <header className="mb-10 flex items-start justify-between gap-4">
      <Link
        href={backHref}
        className="text-sm opacity-60 transition-opacity hover:opacity-100"
      >
        ← 一覧に戻る
      </Link>
      <LogoutButton />
    </header>
  );
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

  await connection();

  const { id } = await params;
  const backHref = listHref(pickListParams(await searchParams));

  // A malformed id would make Postgres raise instead of returning zero rows.
  if (!UUID_PATTERN.test(id)) notFound();

  // RLS already scopes this to the owner; the filter is defense in depth.
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select(
      "id, title, cooking_time_minutes, ingredients, steps, notes, updated_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <DetailHeader backHref={backHref} />
        <p
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          レシピの取得に失敗しました。ページを再読み込みしてください。
        </p>
      </main>
    );
  }

  // Another user's recipe returns no row, so it lands on the same screen.
  if (!recipe) notFound();

  const ingredients = splitLines(recipe.ingredients);
  const steps = splitLines(recipe.steps);
  const notes = recipe.notes?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <DetailHeader backHref={backHref} />

      <article>
        <h1 className="text-3xl font-bold tracking-tight break-words">
          {recipe.title}
        </h1>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="inline-flex shrink-0 items-center rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
          >
            編集
          </Link>
          <RecipeDeleteButton recipeId={recipe.id} />
        </div>
        <RecipeDetailStaleGuard />

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
