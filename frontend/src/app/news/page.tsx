"use client";

import { useEffect, useState } from "react";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

function NewsImage({ src, alt, className }: { src?: string, alt: string, className?: string }) {
  const [error, setError] = useState(false);
  const isValidSrc = src && src.startsWith('http') && !src.includes("picsum");

  if (!isValidSrc || error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-primary/40 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
        <Newspaper className="w-12 h-12 opacity-30" />
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setError(true)}
      className={cn("w-full h-full object-cover transition-transform duration-700", className)} 
    />
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
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
      setNews((json.feed || json).banner || []);
    } catch (err: any) {
      console.error("News error:", err);
      setNews([]);
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
      setNews(json.results?.banner || []);
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

  const displayNews = (searchQuery && !searchContext)
    ? news.filter(n => n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.publisher?.toLowerCase().includes(searchQuery.toLowerCase()))
    : news;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="pt-4 border-b border-border/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium tracking-tight flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-primary" /> 
            {searchContext ? `Narrowing: "${searchContext}"` : "Trending News"}
            {searching && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />}
          </h1>
          <p className="text-muted-foreground mt-2">
            {searchContext 
              ? `Showing global results matching your query and interests.`
              : "Latest headlines and articles tailored to your stack."}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayNews.length === 0 && <div className="md:col-span-3 p-8 text-center text-muted-foreground glass-panel rounded-3xl">No articles match your search.</div>}
        {displayNews.map((n: any, i: number) => (
          <a key={i} href={n.url} target="_blank" rel="noreferrer" className="group flex flex-col rounded-3xl glass-panel relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <div className="aspect-video w-full border-b border-border/50 relative bg-muted/20">
               <NewsImage src={n.image_url} alt={n.title} className="group-hover:scale-105" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">{n.publisher}</span>
              <h4 className="font-serif text-lg leading-snug mb-4 group-hover:text-primary transition-colors">{n.title}</h4>
              <div className="mt-auto flex items-center justify-between w-full">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Recent'}</span>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
