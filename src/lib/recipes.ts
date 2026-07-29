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
