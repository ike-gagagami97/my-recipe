import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "./logout-button";
import RecipeControls from "./recipe-controls";
import {
  formatCookingTime,
  formatDate,
  makeSortHref,
  makePageHref,
  makeDetailHref,
  parseSortColumn,
  parseSortDir,
  parseCookingTime,
} from "@/lib/recipes";
import type { SortColumn, SortDir } from "@/lib/recipes";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function SortIndicator({
  col,
  currentSort,
  currentDir,
}: {
  col: SortColumn;
  currentSort: SortColumn;
  currentDir: SortDir;
}) {
  if (currentSort !== col) return <span className="opacity-30 ml-1">↕</span>;
  return (
    <span className="ml-1">{currentDir === "asc" ? "↑" : "↓"}</span>
  );
}

export default async function RecipesPage({
  searchParams,
}: {
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

  const sp = await searchParams;
  const keyword =
    typeof sp.keyword === "string" ? sp.keyword.trim() : "";
  const cookingTime = parseCookingTime(
    typeof sp.cooking_time === "string" ? sp.cooking_time : "",
  );
  const sort = parseSortColumn(
    typeof sp.sort === "string" ? sp.sort : "",
  );
  const sortDir = parseSortDir(
    typeof sp.sort_dir === "string" ? sp.sort_dir : "",
  );
  const page = Math.max(
    1,
    parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1,
  );

  let query = supabase
    .from("recipes")
    .select("id, title, cooking_time_minutes, updated_at", {
      count: "exact",
    });

  if (keyword) {
    query = query.ilike("title", `%${keyword}%`);
  }

  if (cookingTime) {
    switch (cookingTime) {
      case "under10":
        query = query
          .not("cooking_time_minutes", "is", null)
          .lt("cooking_time_minutes", 10);
        break;
      case "10to20":
        query = query
          .gte("cooking_time_minutes", 10)
          .lt("cooking_time_minutes", 20);
        break;
      case "20to30":
        query = query
          .gte("cooking_time_minutes", 20)
          .lt("cooking_time_minutes", 30);
        break;
      case "over30":
        query = query.gte("cooking_time_minutes", 30);
        break;
    }
  }

  query = query.order(sort, {
    ascending: sortDir === "asc",
    nullsFirst: false,
  });

  const from = (page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const { data: recipes, count, error } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  const baseParams = new URLSearchParams({
    ...(keyword ? { keyword } : {}),
    ...(cookingTime ? { cooking_time: cookingTime } : {}),
    ...(sort !== "updated_at" ? { sort } : {}),
    ...(sortDir !== "desc" ? { sort_dir: sortDir } : {}),
  });

  const isEmpty = !error && (!recipes || recipes.length === 0);
  const hasFilter = !!(keyword || cookingTime);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Recipe</h1>
          <p className="mt-1 text-sm opacity-60">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-6">レシピ一覧</h2>

        <Suspense fallback={<div className="mb-6 h-10" />}>
          <RecipeControls />
        </Suspense>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
          >
            レシピの取得に失敗しました。ページを再読み込みしてください。
          </p>
        ) : isEmpty ? (
          <p className="rounded-xl border border-black/10 dark:border-white/15 px-6 py-8 text-center text-sm opacity-60">
            {hasFilter
              ? "条件に一致するレシピがありません。"
              : "まだレシピがありません。"}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/15 bg-black/2 dark:bg-white/2">
                    <th className="px-4 py-3 text-left font-medium">
                      タイトル
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      <Link
                        href={makeSortHref(
                          "cooking_time_minutes",
                          sort,
                          sortDir,
                          baseParams,
                        )}
                        className="hover:opacity-70 transition-opacity"
                      >
                        所要時間
                        <SortIndicator
                          col="cooking_time_minutes"
                          currentSort={sort}
                          currentDir={sortDir}
                        />
                      </Link>
                    </th>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      <Link
                        href={makeSortHref(
                          "updated_at",
                          sort,
                          sortDir,
                          baseParams,
                        )}
                        className="hover:opacity-70 transition-opacity"
                      >
                        更新日時
                        <SortIndicator
                          col="updated_at"
                          currentSort={sort}
                          currentDir={sortDir}
                        />
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recipes!.map((recipe) => (
                    <tr
                      key={recipe.id}
                      className="border-b border-black/5 dark:border-white/8 last:border-0 hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={makeDetailHref(recipe.id, baseParams, page)}
                          className="font-medium text-blue-700 dark:text-blue-400 underline decoration-blue-700/40 dark:decoration-blue-400/40 underline-offset-2 transition-colors hover:decoration-current"
                        >
                          {recipe.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {formatCookingTime(recipe.cooking_time_minutes)}
                      </td>
                      <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                        {formatDate(recipe.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="ページネーション"
                className="mt-6 flex justify-center gap-1"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={makePageHref(p, baseParams)}
                      aria-current={p === page ? "page" : undefined}
                      className={`min-w-8 rounded-lg px-3 py-1.5 text-center text-sm transition-colors ${
                        p === page
                          ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                          : "hover:bg-black/8 dark:hover:bg-white/8 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {p}
                    </Link>
                  ),
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
