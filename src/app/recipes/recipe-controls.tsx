"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RecipeControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keywordRef = useRef<HTMLInputElement>(null);

  const push = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === "") {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    }
    next.delete("page");
    router.push(`/recipes?${next.toString()}`);
  };

  const handleSearch = () => {
    push({ keyword: keywordRef.current?.value.trim() || undefined });
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex gap-2">
        <input
          ref={keywordRef}
          defaultValue={searchParams.get("keyword") ?? ""}
          placeholder="タイトルで検索"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30 w-52"
        />
        <button
          onClick={handleSearch}
          className="rounded-lg border border-black/15 dark:border-white/20 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          検索
        </button>
      </div>

      <select
        value={searchParams.get("cooking_time") ?? ""}
        onChange={(e) =>
          push({ cooking_time: e.target.value || undefined })
        }
        className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30"
      >
        <option value="">所要時間（すべて）</option>
        <option value="under10">10分未満</option>
        <option value="10to20">10〜20分</option>
        <option value="20to30">20〜30分</option>
        <option value="over30">30分以上</option>
      </select>
    </div>
  );
}
