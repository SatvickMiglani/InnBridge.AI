"use client";

import { useEffect, useState } from "react";
import { Code2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

export default function ReposPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const searchQuery = useNavbarSearch();

  const fetchTrending = async () => {
    const userId = localStorage.getItem("user_id") || "guest";
    setLoading(true);
    setSearchContext(null);
    try {
      const res = await fetch(`${API}/feed/${userId}/unified`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      setRepos((json.feed || json).repos || []);
    } catch (err: any) {
      console.error("Repos error:", err);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query: string) => {
    const userId = localStorage.getItem("user_id") || "guest";
    setSearching(true);
    setSearchContext(query);
    try {
      const res = await fetch(`${API}/feed/${userId}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const json = await res.json();
      setRepos(json.results?.repos || []);
    } catch (err: any) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchTrending();
    const handleSearchSubmit = (e: any) => {
      if (e.detail) fetchSearch(e.detail);
    };
    window.addEventListener("navbar-search-submit", handleSearchSubmit);
    return () => window.removeEventListener("navbar-search-submit", handleSearchSubmit);
  }, []);

  const displayRepos = (searchQuery && !searchContext)
    ? repos.filter(r => r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase()) || r.language?.toLowerCase().includes(searchQuery.toLowerCase()))
    : repos;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="pt-4 border-b border-border/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight flex items-center gap-3">
            <Code2 className="w-8 h-8 text-primary" /> 
            {searchContext ? `Narrowing Code: "${searchContext}"` : "GitHub Repos"}
            {searching && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            {searchContext 
              ? `We've narrowed open source repositories to your query and interests.`
              : "Open source repositories matching your interests."}
          </p>
        </div>
        {searchContext && (
          <button 
            onClick={fetchTrending}
            className="px-6 py-2 rounded-full border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-xl shadow-black/5"
          >
            Back to Trending
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {displayRepos.map((r: any) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 mt-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-bold text-lg md:text-xl tracking-tight group-hover:text-primary transition-colors">{r.title}</h3>
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed max-w-3xl">{r.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-500">
                  ★ {r.stars_total?.toLocaleString() || r.stars_today?.toLocaleString() || 0} stars
                </span>
                {r.language && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{r.language}</span>}
              </div>
            </div>
            <div className="hidden md:flex items-center self-center justify-center shrink-0 w-12 h-12 rounded-full border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        ))}
        {displayRepos.length === 0 && (
           <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">No repos match your search context.</div>
        )}
      </div>
    </div>
  );
}
