"use client";

import { useEffect, useState } from "react";
import { MessageSquare, ArrowRight, Flame, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
              <Badge variant="warning" className="mb-2 bg-orange-500/10 text-orange-600 border-orange-500/20 uppercase">Developer Pulse</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {searchContext ? `Pulse for "${searchContext}"` : "Dev Discussions"}
                {searching && <Loader2 className="inline ml-4 w-6 h-6 animate-spin text-primary" />}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                  The most relevant engineering discussions and technical shifts parsed from across the developer ecosystem.
              </p>
            </div>
            {searchContext && (
              <Button onClick={fetchTrending} variant="outline" className="font-bold border-border hover:bg-muted">
                Live Pulse
              </Button>
            )}
          </div>
        </div>

        {/* Discussions List */}
        <div className="container mx-auto max-w-4xl px-0 py-6">
          <div className="space-y-4 animate-slide-up">
            {displayDiscussions.length === 0 && (
              <div className="text-center py-24 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground italic">No pulse detected matching your current context.</p>
              </div>
            )}
            {displayDiscussions.map((item, idx) => (
              <div
                key={idx}
                className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up group flex items-start gap-6"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors font-bold text-sm text-muted-foreground">
                      {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors mb-4">
                          <a href={item.url || item.hn_url} target="_blank" rel="noreferrer" className="cursor-pointer">
                              {item.title}
                          </a>
                      </h3>
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              <span className="flex items-center gap-1.5 text-orange-600">
                                  <Flame size={12} className="fill-current" />
                                  {item.score} points
                              </span>
                              <span className="flex items-center gap-1.5">
                                  <MessageSquare size={12} />
                                  {item.comments} comments
                              </span>
                          </div>
                          <a href={item.url || item.hn_url} target="_blank" rel="noreferrer">
                              <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:bg-primary/10 font-bold text-[10px] uppercase group-hover:translate-x-1 transition-transform p-0 h-auto"
                              >
                                  Join Discussion →
                              </Button>
                          </a>
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
