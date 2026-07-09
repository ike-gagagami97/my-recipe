"use client";

import { useActionState, useEffect, useRef } from "react";
import { addRecipe, type AddRecipeState } from "./actions";

const initialState: AddRecipeState = {};

export function RecipeForm() {
  const [state, formAction, pending] = useActionState(addRecipe, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-black/10 dark:border-white/15 p-5"
    >
      <h2 className="text-lg font-semibold">Add a recipe</h2>
      <input
        name="title"
        placeholder="Recipe title (e.g. Miso Soup)"
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:focus:border-white/50"
      />
      <textarea
        name="description"
        placeholder="Short description or ingredients"
        rows={3}
        className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:focus:border-white/50"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save recipe"}
      </button>
      {state.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-600 dark:text-green-400">
          Recipe saved!
        </p>
      ) : null}
    </form>
  );
}
