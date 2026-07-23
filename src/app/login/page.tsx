"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Recipe</h1>
        <p className="mt-1 text-sm opacity-60">ログインしてレシピを管理する</p>
      </header>

      <form action={formAction} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30"
            placeholder="••••••••"
          />
        </div>

        {state?.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300"
          >
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-black dark:bg-white text-white dark:text-black font-medium py-2 text-sm transition-opacity disabled:opacity-50 hover:opacity-80"
        >
          {isPending ? "ログイン中…" : "ログイン"}
        </button>
      </form>
    </main>
  );
}
