"use client";

import { useEffect, useState } from "react";
import { Github, ArrowRight, Star, Code2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
              <Badge variant="purple" className="mb-2">Open Source Pulse</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                {searchContext ? `Code Results: "${searchContext}"` : "GitHub Repositories"}
                {searching && <Loader2 className="inline ml-4 w-6 h-6 animate-spin text-primary" />}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                  The most impactful open-source architectures and developer tools discovered daily across the global ecosystem.
              </p>
            </div>
            {searchContext && (
              <Button onClick={fetchTrending} variant="outline" className="font-bold border-border hover:bg-muted">
                Global Stream
              </Button>
            )}
          </div>
        </div>

        {/* Repos Grid */}
        <div className="container mx-auto max-w-7xl px-0 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {displayRepos.length === 0 && (
              <div className="md:col-span-3 text-center py-24 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground italic">No repositories match your current search criteria.</p>
              </div>
            )}
            {displayRepos.map((item, idx) => (
              <div
                key={idx}
                className="professional-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                  <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                              <Badge variant="warning" className="text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                                  <Star size={10} className="mr-1 fill-current" />
                                  {(item.stars_total || item.stars_today || 0).toLocaleString()}
                              </Badge>
                              {item.language && (
                                  <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
                                      {item.language}
                                  </Badge>
                              )}
                          </div>
                          <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                              <a href={item.url} target="_blank" rel="noreferrer" className="cursor-pointer">
                                {item.title || item.full_name}
                              </a>
                          </h3>
                      </div>
                      <Github size={20} className="text-primary opacity-40 shrink-0 mt-1" />
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-3 h-[4.5rem]">
                      {item.description || "Experimental open-source repository pushing the boundaries of software engineering, distributed systems, and real-time computation."}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <Code2 size={12} />
                          Engineering Asset
                      </span>
                      <a href={item.url} target="_blank" rel="noreferrer">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 font-bold text-xs uppercase group-hover:translate-x-1 transition-transform"
                          >
                              Examine Source →
                          </Button>
                      </a>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
