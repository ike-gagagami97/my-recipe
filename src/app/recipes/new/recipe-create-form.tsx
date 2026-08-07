"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createRecipe, type CreateRecipeState } from "../actions";

const emptyValues = {
  title: "",
  cooking_time_minutes: "",
  ingredients: "",
  steps: "",
  notes: "",
};

const inputClass =
  "block w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30";

const labelClass = "block text-sm font-medium";

export default function RecipeCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createRecipe,
    null as CreateRecipeState,
  );
  const values = state?.values ?? emptyValues;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="title" className={labelClass}>
          タイトル <span className="opacity-50">（必須）</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={values.title}
          className={inputClass}
          placeholder="例: 基本の肉じゃが"
          aria-invalid={!!state?.fieldErrors?.title}
          aria-describedby={
            state?.fieldErrors?.title ? "title-error" : undefined
          }
        />
        {state?.fieldErrors?.title && (
          <p
            id="title-error"
            role="alert"
            className="text-sm text-red-700 dark:text-red-300"
          >
            {state.fieldErrors.title}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="cooking_time_minutes" className={labelClass}>
          所要時間（分）
        </label>
        <input
          id="cooking_time_minutes"
          name="cooking_time_minutes"
          type="text"
          inputMode="numeric"
          defaultValue={values.cooking_time_minutes}
          className={`${inputClass} max-w-[12rem]`}
          placeholder="例: 30"
          aria-invalid={!!state?.fieldErrors?.cooking_time_minutes}
          aria-describedby={
            state?.fieldErrors?.cooking_time_minutes
              ? "cooking-time-error"
              : undefined
          }
        />
        {state?.fieldErrors?.cooking_time_minutes && (
          <p
            id="cooking-time-error"
            role="alert"
            className="text-sm text-red-700 dark:text-red-300"
          >
            {state.fieldErrors.cooking_time_minutes}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="ingredients" className={labelClass}>
          材料
        </label>
        <textarea
          id="ingredients"
          name="ingredients"
          rows={6}
          defaultValue={values.ingredients}
          className={`${inputClass} resize-y min-h-[8rem]`}
          placeholder={"1行に1項目\n例: じゃがいも 3個"}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="steps" className={labelClass}>
          手順
        </label>
        <textarea
          id="steps"
          name="steps"
          rows={6}
          defaultValue={values.steps}
          className={`${inputClass} resize-y min-h-[8rem]`}
          placeholder={"1行に1ステップ\n例: 野菜を切る"}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="notes" className={labelClass}>
          メモ
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={values.notes}
          className={`${inputClass} resize-y`}
          placeholder="任意のメモ"
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

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-black dark:bg-white px-5 py-2 text-sm font-medium text-white dark:text-black transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? "保存中…" : "保存"}
        </button>
        <Link
          href="/recipes"
          className="inline-flex items-center rounded-lg border border-black/15 px-5 py-2 text-sm font-medium transition-opacity hover:opacity-70 dark:border-white/20"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
