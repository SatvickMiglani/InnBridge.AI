import { useState, useEffect } from "react";

/**
 * Hook that listens for the navbar-search custom event and returns the current search query.
 * Each page can use this to filter its own content client-side.
 */
export function useNavbarSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSearchQuery(typeof detail === "string" ? detail : "");
    };
    window.addEventListener("navbar-search", handler);
    return () => window.removeEventListener("navbar-search", handler);
  }, []);

  return searchQuery;
}
