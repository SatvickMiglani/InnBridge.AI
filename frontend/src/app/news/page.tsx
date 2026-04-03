"use client";

import { useEffect, useState } from "react";
import { Newspaper, Clock, ArrowRight, Filter, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000";

function Loader2({ className }: { className?: string }) {
    return <div className={cn("w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin", className)} />;
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
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-border bg-card mb-12 -mx-4 md:-mx-8 lg:-mx-12 rounded-3xl overflow-hidden">
          <div className="container mx-auto px-6 py-16 max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Badge variant="purple" className="mb-2">Innovation Pulse</Badge>
              <h1>
                {searchContext ? `Results: "${searchContext}"` : "Technical News"}
                {searching && <Loader2 className="inline ml-4 w-6 h-6 animate-spin text-primary" />}
              </h1>
              <p className="text-subheading max-w-2xl">
                Latest developments in AI, research, and disruptive technology aggregated in real-time.
              </p>
            </div>
            {searchContext && (
              <Button onClick={fetchTrending} variant="outline" className="font-bold border-border hover:bg-muted">
                Back to Trending
              </Button>
            )}
          </div>
        </div>

        {/* News List */}
        <div className="container mx-auto max-w-5xl px-0 py-6">
          <div className="space-y-6 animate-slide-up">
            {displayNews.length === 0 && (
              <div className="text-center py-24 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground italic">No news discovered matching your criteria.</p>
              </div>
            )}
            {displayNews.map((item, idx) => (
              <div
                key={idx}
                className="professional-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-8">
                    {item.image_url && (
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="space-y-2">
                             <div className="flex items-center gap-3">
                                 <Badge variant="secondary" className="text-[10px] font-bold uppercase">{item.publisher || "Global Tech"}</Badge>
                                 <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Recent'}</span>
                             </div>
                             <h3 className="leading-tight group-hover:text-primary transition-colors">
                              <a href={item.url} target="_blank" rel="noreferrer" className="cursor-pointer">
                                {item.title}
                              </a>
                            </h3>
                          </div>
                          <Zap size={20} className="text-primary opacity-40 shrink-0 mt-1" />
                      </div>

                      <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">
                          {item.description || "Stay updated with the latest technological shifts and AI breakthroughs aggregated specifically for developers and engineers."}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Artificial Intelligence
                          </div>
                          <a href={item.url} target="_blank" rel="noreferrer">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:bg-primary/10 font-bold text-xs uppercase group-hover:translate-x-1 transition-transform"
                              >
                                  Read Full Report →
                              </Button>
                          </a>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
