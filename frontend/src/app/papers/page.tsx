"use client";

import { useEffect, useState } from "react";
import { BookOpen, ArrowRight, Filter, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (score <= 6) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  const displayPapers = (searchQuery && !searchContext)
    ? papers.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.abstract?.toLowerCase().includes(searchQuery.toLowerCase()) || p.field?.toLowerCase().includes(searchQuery.toLowerCase()))
    : papers;

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
              <Badge variant="purple" className="mb-2">Science & Research</Badge>
              <h1>
                {searchContext ? `Research for "${searchContext}"` : "Technical Papers"}
                {searching && <Loader2 className="inline ml-4 w-6 h-6 animate-spin text-primary" />}
              </h1>
              <p className="text-subheading max-w-2xl">
                Academic breakthroughs and technical preprints digested and prioritized for your tech stack.
              </p>
            </div>
            {searchContext && (
              <Button onClick={fetchTrending} variant="outline" className="font-bold border-border hover:bg-muted">
                Clear Results
              </Button>
            )}
          </div>
        </div>

        {/* Papers Grid */}
        <div className="container mx-auto max-w-7xl px-0 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {displayPapers.length === 0 && (
              <div className="md:col-span-2 text-center py-24 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground italic">No research papers found matching your query.</p>
              </div>
            )}
            {displayPapers.map((item, idx) => (
              <div
                key={idx}
                className="professional-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                  <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-2">
                          <div className="flex items-center gap-3">
                             <Badge variant="secondary" className="text-[10px] font-bold uppercase">{item.field || "General Research"}</Badge>
                             <Badge 
                                  variant="secondary" 
                                  className={cn("text-[10px] font-bold uppercase", getDifficultyColor(item.difficulty_score || 5))}
                              >
                                  {item.difficulty_score <= 3 ? "Beginner" : item.difficulty_score <= 6 ? "Intermediate" : "Advanced"}
                              </Badge>
                          </div>
                          <h3 className="leading-tight group-hover:text-primary transition-colors">
                              <Link href={`/paper/${item.id}`} className="cursor-pointer">
                                {item.title}
                              </Link>
                          </h3>
                      </div>
                      <BookOpen size={20} className="text-primary opacity-40 shrink-0 mt-1" />
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-3">
                      {item.summary_one_min || item.abstract || "Detailed scientific analysis of emerging technological patterns and theoretical breakthroughs in the field of computer science."}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-border">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Recent Publication'}</span>
                      <Link href={`/paper/${item.id}`}>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:bg-primary/10 font-bold text-xs uppercase group-hover:translate-x-1 transition-transform"
                          >
                              View Deep Insight →
                          </Button>
                      </Link>
                  </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
