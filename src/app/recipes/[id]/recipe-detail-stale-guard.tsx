"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refetch detail when the user returns via browser back/forward or bfcache.
 * Next.js client router cache can otherwise show a deleted recipe until refresh.
 */
export default function RecipeDetailStaleGuard() {
  const router = useRouter();

  useEffect(() => {
    function refresh() {
      router.refresh();
    }

    window.addEventListener("pageshow", refresh);
    window.addEventListener("popstate", refresh);
    return () => {
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("popstate", refresh);
    };
  }, [router]);

  return null;
}
