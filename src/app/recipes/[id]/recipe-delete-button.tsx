"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteRecipe } from "../actions";

function DeletePendingOverlay() {
  const { pending } = useFormStatus();
  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-neutral-950"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm opacity-70">削除中…</p>
    </div>
  );
}

function DeleteCancelButton({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={pending}
      className="inline-flex items-center rounded-lg border border-black/15 dark:border-white/20 px-5 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      キャンセル
    </button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-lg border border-red-600 bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 dark:border-red-500 dark:bg-red-600"
    >
      {pending ? "削除中…" : "削除する"}
    </button>
  );
}

export default function RecipeDeleteButton({ recipeId }: { recipeId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction] = useActionState(deleteRecipe, null);

  function openDialog() {
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex shrink-0 items-center rounded-lg border border-red-600 px-5 py-2 text-sm font-medium text-red-700 transition-opacity hover:opacity-80 dark:border-red-400 dark:text-red-300"
      >
        削除
      </button>

      {state?.error && !dialogOpen && (
        <p
          role="alert"
          className="mt-4 w-full rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      {dialogOpen && (
        <form action={formAction}>
          <input type="hidden" name="id" value={recipeId} />
          <DeletePendingOverlay />
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="presentation"
          >
            <div
              role="alertdialog"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
              aria-modal="true"
              className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-900 p-6 shadow-lg"
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
              {state?.error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-300"
                >
                  {state.error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <DeleteCancelButton onCancel={() => setDialogOpen(false)} />
                <DeleteSubmitButton />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
