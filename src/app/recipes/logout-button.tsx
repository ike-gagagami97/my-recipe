"use client";

import { logout } from "./actions";
import { useTransition } from "react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      logout();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="rounded-lg border border-black/15 dark:border-white/20 px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
    >
      {isPending ? "ログアウト中…" : "ログアウト"}
    </button>
  );
}
