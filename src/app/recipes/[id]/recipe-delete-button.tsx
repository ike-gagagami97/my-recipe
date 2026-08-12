"use client";

import { useState, useTransition } from "react";
import { deleteRecipe } from "../actions";

export default function RecipeDeleteButton({ recipeId }: { recipeId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openDialog() {
    setError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    if (isPending) return;
    setDialogOpen(false);
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteRecipe(recipeId);
      if (result?.error) {
        setError(result.error);
        setDialogOpen(false);
        return;
      }
      if (result?.success) {
        window.location.replace("/recipes");
        return;
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={openDialog}
        disabled={isPending}
        className="inline-flex shrink-0 items-center rounded-lg border border-red-600 px-5 py-2 text-sm font-medium text-red-700 transition-opacity hover:opacity-80 disabled:opacity-50 dark:border-red-400 dark:text-red-300"
      >
        削除
      </button>

      {error && (
        <p
          role="alert"
          className="mt-4 w-full rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="presentation"
          onClick={closeDialog}
        >
          <div
            role="alertdialog"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            aria-modal="true"
            className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-dialog-title"
              className="text-lg font-semibold text-red-700 dark:text-red-300"
            >
              レシピを削除
            </h2>
            <p id="delete-dialog-desc" className="mt-3 text-sm opacity-80">
              本当に削除しますか？この操作は取り消せません。
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className="inline-flex items-center rounded-lg border border-black/15 dark:border-white/20 px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="inline-flex items-center rounded-lg border border-red-600 bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:border-red-500 dark:bg-red-600"
              >
                {isPending ? "削除中…" : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
