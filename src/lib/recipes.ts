// ---- URL / sort helpers (shared between list page and unit tests) ----

export type SortColumn = "updated_at" | "cooking_time_minutes";
export type SortDir = "asc" | "desc";
export type CookingTimeFilter =
  | "under10"
  | "10to20"
  | "20to30"
  | "over30"
  | "";

export function parseSortColumn(v: unknown): SortColumn {
  return v === "cooking_time_minutes" ? "cooking_time_minutes" : "updated_at";
}

export function parseSortDir(v: unknown): SortDir {
  return v === "asc" ? "asc" : "desc";
}

export function parseCookingTime(v: unknown): CookingTimeFilter {
  if (
    v === "under10" ||
    v === "10to20" ||
    v === "20to30" ||
    v === "over30"
  ) {
    return v;
  }
  return "";
}

/**
 * Build the href for a sort header click.
 * Clicking an inactive column starts ascending; clicking the active column flips direction.
 */
export function makeSortHref(
  col: SortColumn,
  currentSort: SortColumn,
  currentDir: SortDir,
  base: URLSearchParams,
): string {
  const next = new URLSearchParams(base);
  const newDir: SortDir =
    currentSort === col ? (currentDir === "desc" ? "asc" : "desc") : "asc";
  next.set("sort", col);
  next.set("sort_dir", newDir);
  next.delete("page");
  return `/recipes?${next.toString()}`;
}

export function makePageHref(p: number, base: URLSearchParams): string {
  const next = new URLSearchParams(base);
  next.set("page", String(p));
  return `/recipes?${next.toString()}`;
}

/** Carries current list state into the detail URL so the back-link can restore it. */
export function makeDetailHref(
  id: string,
  base: URLSearchParams,
  page: number,
): string {
  const next = new URLSearchParams(base);
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `/recipes/${id}?${query}` : `/recipes/${id}`;
}

// ---- Display helpers ----

export function formatCookingTime(minutes: number | null): string {
  return minutes === null ? "−" : `${minutes}分`;
}

// Timestamps are rendered in JST regardless of where the server runs
// (Vercel and the local containers are both UTC).
const JST_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type DateParts = { year: string; month: string; day: string; time: string };

function toJstParts(date: Date): DateParts {
  const parts = JST_FORMATTER.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function formatDate(iso: string): string {
  const { year, month, day, time } = toJstParts(new Date(iso));
  const currentYear = toJstParts(new Date()).year;
  return year === currentYear
    ? `${month}/${day} ${time}`
    : `${year}/${month}/${day} ${time}`;
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

// ---- Create-form helpers ----

/** Trim; empty after trim becomes null (optional text columns). */
export function optionalText(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

export type CookingTimeParseResult =
  | { ok: true; value: number | null }
  | { ok: false; error: string };

/**
 * Parse the cooking-time field from the create form.
 * Empty → unset (null). Otherwise only integers ≥ 1 are accepted.
 */
export function parseCookingTimeInput(raw: string): CookingTimeParseResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  if (!/^\d+$/.test(trimmed)) {
    return {
      ok: false,
      error: "所要時間は1以上の整数で入力してください",
    };
  }
  const n = Number(trimmed);
  if (n < 1) {
    return {
      ok: false,
      error: "所要時間は1以上の整数で入力してください",
    };
  }
  return { ok: true, value: n };
}
