"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Refetch detail when restored from bfcache (e.g. browser back after delete). */
export default function RecipeDetailStaleGuard() {
  const router = useRouter();

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) router.refresh();
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router]);

  return null;
}
