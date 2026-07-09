const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">My Recipe</h1>
        <p className="mt-2 text-sm opacity-70">
          A recipe app built with Next.js and Supabase.
        </p>
      </header>

      <section className="rounded-xl border border-black/10 dark:border-white/15 p-6">
        <h2 className="text-lg font-semibold">Coming soon</h2>
        <p className="mt-2 text-sm opacity-75">
          Recipe browsing and creation are being designed. This is the starting
          screen — the data model and features will be added next.
        </p>
      </section>

      <p className="mt-6 text-xs opacity-60">
        Supabase:{" "}
        <span
          className={
            isSupabaseConfigured
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }
        >
          {isSupabaseConfigured ? "configured" : "not configured"}
        </span>
      </p>
    </main>
  );
}
