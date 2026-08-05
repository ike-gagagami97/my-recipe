import { describe, it, expect, afterEach, vi } from "vitest";
import {
  formatCookingTime,
  formatDate,
  splitLines,
  pickListParams,
  listHref,
  parseSortColumn,
  parseSortDir,
  parseCookingTime,
  makeSortHref,
  makePageHref,
  makeDetailHref,
} from "./recipes";

// ---------------------------------------------------------------------------
// formatCookingTime
// ---------------------------------------------------------------------------

describe("formatCookingTime", () => {
  it("returns − for null", () => {
    expect(formatCookingTime(null)).toBe("−");
  });

  it("formats a positive integer as N分", () => {
    expect(formatCookingTime(30)).toBe("30分");
    expect(formatCookingTime(5)).toBe("5分");
    expect(formatCookingTime(1)).toBe("1分");
  });

  it("formats zero as 0分", () => {
    expect(formatCookingTime(0)).toBe("0分");
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe("formatDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats current-year timestamps as MM/DD HH:mm (JST)", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    // 2026-08-04T10:30:00+09:00 is the same moment in JST
    expect(formatDate("2026-08-04T01:30:00Z")).toBe("08/04 10:30");
  });

  it("formats past-year timestamps as YYYY/MM/DD HH:mm (JST)", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    expect(formatDate("2025-03-15T05:00:00Z")).toBe("2025/03/15 14:00");
  });

  it("converts UTC to JST by adding 9 hours", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    // 2026-01-02T00:00:00Z UTC → 2026-01-02T09:00:00+09:00 JST
    expect(formatDate("2026-01-02T00:00:00Z")).toBe("01/02 09:00");
  });

  it("handles year boundary in JST (UTC Dec 31 → JST Jan 1 next year)", () => {
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    // 2026-12-31T15:00:00Z → 2027-01-01T00:00:00+09:00 (next year in JST)
    expect(formatDate("2026-12-31T15:00:00Z")).toBe("01/01 00:00");
  });
});

// ---------------------------------------------------------------------------
// splitLines
// ---------------------------------------------------------------------------

describe("splitLines", () => {
  it("returns [] for null", () => {
    expect(splitLines(null)).toEqual([]);
  });

  it("returns [] for an empty string", () => {
    expect(splitLines("")).toEqual([]);
  });

  it("returns [] for whitespace-only input", () => {
    expect(splitLines("   \n  \n  ")).toEqual([]);
  });

  it("splits on newlines and trims each line", () => {
    expect(splitLines("  卵  \n  砂糖  \n  牛乳  ")).toEqual([
      "卵",
      "砂糖",
      "牛乳",
    ]);
  });

  it("removes blank lines in the middle", () => {
    expect(splitLines("卵\n\n砂糖")).toEqual(["卵", "砂糖"]);
  });

  it("returns a single-element array for single-line input", () => {
    expect(splitLines("卵")).toEqual(["卵"]);
  });
});

// ---------------------------------------------------------------------------
// pickListParams
// ---------------------------------------------------------------------------

describe("pickListParams", () => {
  it("keeps known list params", () => {
    const sp = {
      keyword: "パスタ",
      cooking_time: "under10",
      sort: "cooking_time_minutes",
      sort_dir: "asc",
      page: "2",
    };
    const result = pickListParams(sp);
    expect(result.get("keyword")).toBe("パスタ");
    expect(result.get("cooking_time")).toBe("under10");
    expect(result.get("sort")).toBe("cooking_time_minutes");
    expect(result.get("sort_dir")).toBe("asc");
    expect(result.get("page")).toBe("2");
  });

  it("drops unknown keys", () => {
    const result = pickListParams({ keyword: "パスタ", foo: "bar", id: "123" });
    expect(result.get("foo")).toBeNull();
    expect(result.get("id")).toBeNull();
  });

  it("drops empty-string values", () => {
    const result = pickListParams({ keyword: "", sort: "updated_at" });
    expect(result.get("keyword")).toBeNull();
    expect(result.get("sort")).toBe("updated_at");
  });

  it("drops array values", () => {
    const result = pickListParams({ keyword: ["a", "b"] });
    expect(result.get("keyword")).toBeNull();
  });

  it("returns empty URLSearchParams when input is empty", () => {
    expect(pickListParams({}).toString()).toBe("");
  });
});

// ---------------------------------------------------------------------------
// listHref
// ---------------------------------------------------------------------------

describe("listHref", () => {
  it("returns /recipes when params are empty", () => {
    expect(listHref(new URLSearchParams())).toBe("/recipes");
  });

  it("appends query string when params are present", () => {
    const p = new URLSearchParams({ keyword: "パスタ" });
    expect(listHref(p)).toBe("/recipes?keyword=%E3%83%91%E3%82%B9%E3%82%BF");
  });
});

// ---------------------------------------------------------------------------
// parseSortColumn
// ---------------------------------------------------------------------------

describe("parseSortColumn", () => {
  it("returns cooking_time_minutes for that string", () => {
    expect(parseSortColumn("cooking_time_minutes")).toBe("cooking_time_minutes");
  });

  it("returns updated_at for any other value", () => {
    expect(parseSortColumn("updated_at")).toBe("updated_at");
    expect(parseSortColumn("")).toBe("updated_at");
    expect(parseSortColumn(undefined)).toBe("updated_at");
    expect(parseSortColumn("invalid")).toBe("updated_at");
  });
});

// ---------------------------------------------------------------------------
// parseSortDir
// ---------------------------------------------------------------------------

describe("parseSortDir", () => {
  it("returns asc for 'asc'", () => {
    expect(parseSortDir("asc")).toBe("asc");
  });

  it("returns desc for any other value", () => {
    expect(parseSortDir("desc")).toBe("desc");
    expect(parseSortDir("")).toBe("desc");
    expect(parseSortDir(undefined)).toBe("desc");
    expect(parseSortDir("invalid")).toBe("desc");
  });
});

// ---------------------------------------------------------------------------
// parseCookingTime
// ---------------------------------------------------------------------------

describe("parseCookingTime", () => {
  it("returns each valid filter value as-is", () => {
    expect(parseCookingTime("under10")).toBe("under10");
    expect(parseCookingTime("10to20")).toBe("10to20");
    expect(parseCookingTime("20to30")).toBe("20to30");
    expect(parseCookingTime("over30")).toBe("over30");
  });

  it("returns '' for any other value", () => {
    expect(parseCookingTime("")).toBe("");
    expect(parseCookingTime(undefined)).toBe("");
    expect(parseCookingTime("invalid")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// makeSortHref
// ---------------------------------------------------------------------------

describe("makeSortHref", () => {
  const base = new URLSearchParams();

  it("starts ascending when clicking an inactive column", () => {
    const href = makeSortHref("cooking_time_minutes", "updated_at", "desc", base);
    expect(href).toContain("sort=cooking_time_minutes");
    expect(href).toContain("sort_dir=asc");
  });

  it("flips desc → asc when clicking the active column", () => {
    const href = makeSortHref("cooking_time_minutes", "cooking_time_minutes", "desc", base);
    expect(href).toContain("sort_dir=asc");
  });

  it("flips asc → desc when clicking the active column", () => {
    const href = makeSortHref("updated_at", "updated_at", "asc", base);
    expect(href).toContain("sort_dir=desc");
  });

  it("removes page from the query string", () => {
    const withPage = new URLSearchParams({ keyword: "パスタ", page: "3" });
    const href = makeSortHref("updated_at", "updated_at", "asc", withPage);
    expect(href).not.toContain("page=");
    expect(href).toContain("keyword=");
  });

  it("preserves other query params", () => {
    const withFilter = new URLSearchParams({ keyword: "チキン", cooking_time: "under10" });
    const href = makeSortHref("updated_at", "updated_at", "desc", withFilter);
    expect(href).toContain("keyword=");
    expect(href).toContain("cooking_time=under10");
  });
});

// ---------------------------------------------------------------------------
// makePageHref
// ---------------------------------------------------------------------------

describe("makePageHref", () => {
  it("sets the page param", () => {
    const href = makePageHref(3, new URLSearchParams({ keyword: "パスタ" }));
    expect(href).toContain("page=3");
    expect(href).toContain("keyword=");
  });

  it("overwrites an existing page param", () => {
    const href = makePageHref(2, new URLSearchParams({ page: "5" }));
    expect(href).toContain("page=2");
    expect(href).not.toContain("page=5");
  });
});

// ---------------------------------------------------------------------------
// makeDetailHref
// ---------------------------------------------------------------------------

describe("makeDetailHref", () => {
  const id = "abc-123";

  it("returns /recipes/[id] with no query when base is empty and page is 1", () => {
    expect(makeDetailHref(id, new URLSearchParams(), 1)).toBe("/recipes/abc-123");
  });

  it("includes page in the URL when page > 1", () => {
    const href = makeDetailHref(id, new URLSearchParams(), 2);
    expect(href).toBe("/recipes/abc-123?page=2");
  });

  it("preserves list params in the URL", () => {
    const base = new URLSearchParams({ keyword: "パスタ", cooking_time: "under10" });
    const href = makeDetailHref(id, base, 1);
    expect(href).toContain("keyword=");
    expect(href).toContain("cooking_time=under10");
    expect(href).not.toContain("page=1");
  });

  it("includes both list params and page when page > 1", () => {
    const base = new URLSearchParams({ keyword: "パスタ" });
    const href = makeDetailHref(id, base, 2);
    expect(href).toContain("keyword=");
    expect(href).toContain("page=2");
  });
});
