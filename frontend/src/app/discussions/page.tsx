"use client";

import { useEffect, useState } from "react";
import { Flame, ArrowRight, MessageSquare } from "lucide-react";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<any[]>([]);
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
      setDiscussions((json.feed || json).discussions || []);
    } catch (err: any) {
      console.error("Discussions error:", err);
      setDiscussions([]);
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
      setDiscussions(json.results?.discussions || []);
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

  const displayDiscussions = (searchQuery && !searchContext)
    ? discussions.filter(d => d.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : discussions;

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
            <Flame className="w-8 h-8 text-orange-500" /> 
            {searchContext ? `Narrowing Pulse: "${searchContext}"` : "Developer Pulse"}
            {searching && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            {searchContext 
              ? `We've narrowed the industry discussions to your specific query and background.`
              : "The most relevant tech discussions parsed from Hacker News."}
          </p>
        </div>
        {searchContext && (
          <button 
            onClick={fetchTrending}
            className="px-6 py-2 rounded-full border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-xl shadow-black/5"
          >
            Back to Pulse
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {displayDiscussions.map((d: any, i: number) => (
          <a key={d.id} href={d.url || d.hn_url} target="_blank" rel="noreferrer" className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-10 h-10 rounded-full bg-muted flex flex-col items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors font-display font-bold text-lg text-muted-foreground">
              {i + 1}
             </div>
             <div className="flex-1">
               <h3 className="font-bold text-lg leading-snug tracking-tight mb-3 group-hover:text-primary transition-colors">{d.title}</h3>
               <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-500/10 text-orange-500">
                   <Flame className="w-3.5 h-3.5" /> {d.score} pts
                 </span>
                 <span className="flex items-center gap-1.5">
                   <MessageSquare className="w-3.5 h-3.5" /> {d.comments} comments
                 </span>
                 {d.time && (
                   <>
                     <span className="opacity-50">•</span>
                     <span>{new Date(d.time * 1000).toLocaleDateString()}</span>
                   </>
                 )}
               </div>
             </div>
             <div className="hidden md:flex items-center self-center justify-center shrink-0 w-12 h-12 rounded-full border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                 <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
             </div>
          </a>
        ))}
        {displayDiscussions.length === 0 && (
           <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">No discussions match your search context.</div>
        )}
      </div>
    </div>
  );
}
