"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Search, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const PLACEHOLDERS: Record<string, string> = {
  "/": "Search all (Press Enter for deep search)…",
  "/news": "Filter articles or Press Enter to search…",
  "/papers": "Filter papers or Press Enter to search…",
  "/repos": "Filter repositories or Press Enter to search…",
  "/discussions": "Filter discussions or Press Enter to search…",
  "/projects": "Describe what you want to build…",
  "/profile": "Search enrolled projects…",
};

export function Navbar() {
  const [dateStr, setDateStr] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("user_name") || "Guest");
    }
  }, []);

  // Clear search when navigating to a new page
  useEffect(() => {
    setQuery("");
    // Dispatch empty to reset filters on page change
    window.dispatchEvent(new CustomEvent("navbar-search", { detail: "" }));
  }, [pathname]);

  const handleChange = (value: string) => {
    setQuery(value);
    window.dispatchEvent(new CustomEvent("navbar-search", { detail: value }));
  };

  const handleClear = () => {
    setQuery("");
    window.dispatchEvent(new CustomEvent("navbar-search", { detail: "" }));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
    if (e.key === "Enter" && query.trim()) {
      window.dispatchEvent(new CustomEvent("navbar-search-submit", { detail: query }));
    }
  };

  const placeholder = PLACEHOLDERS[pathname] || "Search…";

  return (
    <header className="h-16 border-b border-border glass-panel sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-9 pl-9 pr-9 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1 bg-muted/30">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live Feed
          <span className="mx-2 opacity-30">•</span>
          {dateStr}
        </div>
        <div className="h-6 w-px bg-border mx-1" />
        {userName === "Guest" ? (
          <Link href="/login" className="text-sm font-bold text-primary hover:underline px-3 py-1 bg-primary/10 rounded-full border border-primary/20">Sign In</Link>
        ) : (
          <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">{userName}</Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
