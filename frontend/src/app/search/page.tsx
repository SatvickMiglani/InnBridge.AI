"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Loader2, BookOpen, Zap, Github, MessageSquare, Terminal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const userId = localStorage.getItem("user_id") || "guest";
    try {
      const res = await fetch(`${API}/feed/${userId}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      
      // Flatten results as in the reference logic
      const flatResults = [
        ...(data.results?.papers || []).map((p: any) => ({ ...p, type: 'paper' })),
        ...(data.results?.repos || []).map((r: any) => ({ ...r, type: 'repo' })),
        ...(data.results?.banner || []).map((b: any) => ({ ...b, type: 'news' })),
        ...(data.results?.discussions || []).map((d: any) => ({ ...d, type: 'discussion' })),
      ];
      setResults(flatResults);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
      switch (type) {
          case 'paper': return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
          case 'repo': return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
          case 'news': return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
          case 'discussion': return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
          default: return "bg-muted text-muted-foreground";
      }
  };

  const getIcon = (type: string) => {
      switch (type) {
          case 'paper': return <BookOpen size={18} />;
          case 'repo': return <Terminal size={18} />;
          case 'news': return <Zap size={18} />;
          case 'discussion': return <MessageSquare size={18} />;
          default: return <SearchIcon size={18} />;
      }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background -mt-4 md:-mt-8 lg:-mt-12">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Deep Search
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Semantic search across all sources with AI-powered discovery tailored to your technical profile.
          </p>
        </div>
      </div>

      {/* Search Input Section */}
      <div className="border-b border-border bg-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search research, code, and breakthroughs..."
                className="w-full pl-6 pr-14 py-4 rounded-xl border border-border bg-background text-foreground text-lg placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <SearchIcon size={24} />}
              </button>
            </div>
            
            {!query && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center">
                    {["Generative AI", "Rust Performance", "Vector Databases", "WebAssembly", "Distributed Systems"].map(tag => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => { setQuery(tag); setTimeout(() => handleSearch(), 0); }}
                            className="px-4 py-2 rounded-full bg-card border border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        {results.length > 0 ? (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                    Matches for "{query}"
                </h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                    {results.length} results found
                </Badge>
            </div>

            {results.map((result, idx) => (
              <div
                key={idx}
                className="professional-card p-6 md:p-8 hover:shadow-lg transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className={cn("text-[10px] font-bold uppercase", getTypeColor(result.type))}>
                           <span className="flex items-center gap-1.5">
                                {getIcon(result.type)}
                                {result.type}
                           </span>
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{result.published_at ? new Date(result.published_at).toLocaleDateString() : 'Active'}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                      {result.type === 'paper' ? (
                          <Link href={`/paper/${result.id}`}>{result.title}</Link>
                      ) : (
                          <a href={result.url || result.hn_url} target="_blank" rel="noreferrer">{result.title}</a>
                      )}
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={20} className="text-primary" />
                  </Button>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                   {result.summary_one_min || result.description || "Synthesizing technical details... Find more information by examining the full source or deep-diving into the research."}
                </p>
                
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{result.field || result.publisher || result.language || "Semantically Relevant"}</span>
                    {result.type === 'paper' ? (
                        <Link href={`/paper/${result.id}`} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View Analysis</Link>
                    ) : (
                        <a href={result.url || result.hn_url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Open Source</a>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-32 border border-dashed border-border rounded-2xl animate-fade-in">
             <SearchIcon size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
             <h3 className="text-xl font-semibold text-foreground mb-2">No matches found</h3>
             <p className="text-muted-foreground italic">AI-powered search couldn't find exact matches for "{query}". Try broadening your terms.</p>
          </div>
        ) : !query && (
            <div className="text-center py-32 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <SearchIcon size={32} className="text-primary opacity-40" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Discovery Hub</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Type a query above to scan the global technology landscape for research, code, and discussions.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
