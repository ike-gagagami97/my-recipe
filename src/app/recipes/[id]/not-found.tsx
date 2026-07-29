import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <div className="rounded-xl border border-black/10 dark:border-white/15 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold">レシピが見つかりません</h1>
        <p className="mt-2 text-sm opacity-60">
          削除されたか、URL が正しくない可能性があります。
        </p>
        <Link
          href="/recipes"
          className="mt-6 inline-block rounded-lg border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-70"
        >
          レシピ一覧に戻る
        </Link>
      </div>
    </main>
  );
}
