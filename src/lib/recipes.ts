export function formatCookingTime(minutes: number | null): string {
  return minutes === null ? "−" : `${minutes}分`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  const currentYear = new Date().getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const time = `${mm}/${dd} ${hh}:${min}`;
  return date.getFullYear() === currentYear
    ? time
    : `${date.getFullYear()}/${time}`;
}

/** Newline separated text -> trimmed, non-empty lines. */
export function splitLines(text: string | null): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const LIST_PARAM_KEYS = [
  "keyword",
  "cooking_time",
  "sort",
  "sort_dir",
  "page",
] as const;

type RawSearchParams = { [key: string]: string | string[] | undefined };

/**
 * Keeps only the list-view state so it can round-trip through the detail URL
 * and restore the list exactly as the user left it.
 */
export function pickListParams(sp: RawSearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of LIST_PARAM_KEYS) {
    const value = sp[key];
    if (typeof value === "string" && value !== "") {
      params.set(key, value);
    }
  }
  return params;
}

export function listHref(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `/recipes?${query}` : "/recipes";
}
