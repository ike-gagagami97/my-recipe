"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setRecipeFavorite, type SetFavoriteState } from "@/app/recipes/actions";

function FavoriteStar({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 16.9 6.75 19.7l1-5.85L3.5 9.7l5.9-.9L12 3.5z" />
    </svg>
  );
}

function FavoriteSubmitButton({
  isFavorite,
  compact,
}: {
  isFavorite: boolean;
  compact: boolean;
}) {
  const { pending } = useFormStatus();
  const label = isFavorite ? "お気に入りを外す" : "お気に入りにする";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg border transition-opacity disabled:opacity-50 ${
        isFavorite
          ? "border-amber-500/60 text-amber-600 dark:text-amber-400"
          : "border-black/15 text-black/50 dark:border-white/20 dark:text-white/50"
      } ${
        compact
          ? "h-8 w-8"
          : "gap-2 px-3 py-2 text-sm font-medium hover:opacity-80"
      } ${pending ? "opacity-60" : ""}`}
    >
      <FavoriteStar filled={isFavorite} />
      {!compact && <span>{isFavorite ? "お気に入り中" : "お気に入り"}</span>}
    </button>
  );
}

type FavoriteToggleProps = {
  recipeId: string;
  isFavorite: boolean;
  /** Compact icon-only control for list rows. */
  compact?: boolean;
};

export default function FavoriteToggle({
  recipeId,
  isFavorite,
  compact = false,
}: FavoriteToggleProps) {
  const [state, formAction] = useActionState(
    setRecipeFavorite,
    null as SetFavoriteState,
  );

  return (
    <div
      className={
        compact
          ? "inline-flex flex-col items-center"
          : "flex flex-col items-start gap-2"
      }
    >
      <form action={formAction}>
        <input type="hidden" name="id" value={recipeId} />
        <input
          type="hidden"
          name="is_favorite"
          value={isFavorite ? "false" : "true"}
        />
        <FavoriteSubmitButton isFavorite={isFavorite} compact={compact} />
      </form>
      {state?.error && (
        <p
          role="alert"
          className={`text-xs text-red-700 dark:text-red-300 ${
            compact ? "mt-1 max-w-[8rem] text-center" : ""
          }`}
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
