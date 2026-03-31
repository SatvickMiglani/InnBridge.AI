"use client";

import { useEffect, useState } from "react";
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

export default function PapersPage() {
  const [papers, setPapers] = useState<any[]>([]);
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
      setPapers((json.feed || json).papers || []);
    } catch (err: any) {
      console.error("Papers error:", err);
      setPapers([]);
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
      setPapers(json.results?.papers || []);
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

  const displayPapers = (searchQuery && !searchContext)
    ? papers.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) || p.field?.toLowerCase().includes(searchQuery.toLowerCase()))
    : papers;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="pt-4 border-b border-border/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> 
            {searchContext ? `Narrowing Research: "${searchContext}"` : "Research Papers"}
            {searching && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            {searchContext 
              ? `We've narrowed the global research ecosystem to your query and profile.`
              : "The latest arXiv preprints digested for you."}
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

      <div className="flex flex-col gap-6">
        {displayPapers.length === 0 && <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl">No papers match your search.</div>}
        {displayPapers.map((p) => (
          <Link key={p.id} href={`/paper/${p.id}`} className="block p-8 rounded-3xl glass-panel hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-baseline justify-between gap-4 mb-4">
              <h3 className="font-serif text-xl md:text-2xl leading-snug text-foreground group-hover:text-primary transition-colors pr-10">{p.title}</h3>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
            </div>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed max-w-4xl">{p.summary_one_min || p.abstract}</p>
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">{p.field || 'Research'}</span>
              <span className={cn(
                "text-xs px-3 py-1.5 rounded-md font-bold uppercase tracking-wider",
                p.difficulty_score <= 3 ? "bg-emerald-500/10 text-emerald-500" :
                p.difficulty_score <= 6 ? "bg-amber-500/10 text-amber-500" :
                "bg-rose-500/10 text-rose-500"
              )}>
                {p.difficulty_score <= 3 ? "Beginner Friendly" : p.difficulty_score <= 6 ? "Intermediate" : "Advanced"}
              </span>
              <span className="text-[10px] text-muted-foreground ml-auto">{p.published_at ? new Date(p.published_at).toLocaleDateString() : 'Recent'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
