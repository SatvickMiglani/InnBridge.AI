"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Flame, Code2, Newspaper, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";

const API = "http://localhost:8000";

interface FeedData {
  banner: any[];
  discussions: any[];
  papers: any[];
  repos: any[];
}

function NewsImage({ src, alt, className, fallbackIconSize = "w-16 h-16" }: { src?: string, alt: string, className?: string, fallbackIconSize?: string }) {
  const [error, setError] = useState(false);
  const isValidSrc = src && src.startsWith('http') && !src.includes("picsum");

  if (!isValidSrc || error) {
    return (
      <div className={cn("w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex flex-col items-center justify-center text-primary/40", className)}>
        <Newspaper className={cn("opacity-30", fallbackIconSize)} />
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

export default function HomeFeed() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const searchQuery = useNavbarSearch();

  const fetchFeed = async () => {
    const userId = localStorage.getItem("user_id") || "guest";
    setLoading(true);
    setSearchContext(null);

    try {
      const res = await fetch(`${API}/feed/${userId}/unified`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      setData(json.feed || json);
    } catch (err: any) {
      console.error("Feed error:", err);
      // fallback empty data to keep UI alive
      setData({ banner: [], discussions: [], papers: [], repos: [] });
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
      setData(json.results);
    } catch (err: any) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    const handleSearchSubmit = (e: any) => {
      if (e.detail) {
        fetchSearch(e.detail);
      }
    };

    window.addEventListener("navbar-search-submit", handleSearchSubmit);
    return () => window.removeEventListener("navbar-search-submit", handleSearchSubmit);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-muted-foreground mt-20">Could not load feed. Is the backend running?</div>;
  }

  const matchText = (text: string | undefined) => !searchQuery || (text?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

  const { banner: rawBanner, discussions: rawDiscussions, papers: rawPapers, repos: rawRepos } = data;
  
  // BIPASS client-side literal filtering if we are in "Deep Search" (searchContext) mode
  const banner = (searchQuery && !searchContext) ? rawBanner.filter(n => matchText(n.title) || matchText(n.publisher)) : rawBanner;
  const discussions = (searchQuery && !searchContext) ? rawDiscussions.filter(d => matchText(d.title)) : rawDiscussions;
  const papers = (searchQuery && !searchContext) ? rawPapers.filter(p => matchText(p.title) || matchText(p.field)) : rawPapers;
  const repos = (searchQuery && !searchContext) ? rawRepos.filter(r => matchText(r.title) || matchText(r.description) || matchText(r.language)) : rawRepos;
  const heroNews = banner[0];
  const restNews = banner.slice(1, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-700 relative z-10 text-foreground">
      {/* GREETING HERO / SEARCH HEADER */}
      <section className="space-y-4 pt-4 border-b border-border/50 pb-10">
        {!searchContext ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-serif italic text-lg leading-none pt-1">✦</span>
              </div>
              <div>
                <p className="font-display text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80">Daily Digest</p>
                <p className="text-sm text-muted-foreground font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mt-6">
              Welcome back <span className="text-primary italic">✦</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Your curated stream of research, trending code, and developer discussions.
            </p>
          </>
        ) : (
          <div className="animate-in slide-in-from-left duration-500">
             <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-[10px] font-bold tracking-[0.2em] uppercase text-primary/80">Deep Search Results</p>
                  <h1 className="text-3xl md:text-4xl font-display font-medium tracking-tight mt-2 flex items-center gap-4">
                    Narrowing for <span className="text-primary italic">"{searchContext}"</span>
                    {searching && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin ml-2" />}
                  </h1>
                </div>
                <button 
                  onClick={fetchFeed}
                  className="px-6 py-2 rounded-full border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-xl shadow-black/5"
                >
                  Clear & Return to Feed
                </button>
             </div>
             <p className="text-muted-foreground mt-4">We've narrowed the global research and industry pulse to your specific query and interests.</p>
          </div>
        )}
      </section>

      {/* HIGHLIGHT NEWS - FULL WIDTH FEATURE */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-center gap-4 font-display font-bold uppercase tracking-[0.15em] text-sm text-foreground">
            <span className="w-8 h-px bg-primary block" /> Innovation & News
          </h2>
          <Link href="/news" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
        </div>

        {banner.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {heroNews && (
              <a href={heroNews.url} target="_blank" rel="noreferrer" className="group block md:col-span-2 rounded-3xl overflow-hidden aspect-video md:aspect-[2.5/1] bg-card border border-border/50 relative shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                <NewsImage src={heroNews.image_url} alt={heroNews.title} className="group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070910] via-[#070910]/80 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary border border-primary/20 backdrop-blur-md text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                    {heroNews.publisher || "News"}
                  </span>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white leading-tight mb-3 group-hover:text-primary/90 transition-colors max-w-4xl">
                    {heroNews.title}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {new Date(heroNews.published_at).toLocaleDateString()}
                  </p>
                </div>
              </a>
            )}

            {restNews.slice(0, 4).map((news, i) => (
              <a key={i} href={news.url} target="_blank" rel="noreferrer" className="group flex flex-col rounded-3xl glass-panel hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
                <div className="aspect-[2/1] w-full relative">
                   <NewsImage src={news.image_url} alt={news.title} fallbackIconSize="w-10 h-10" />
                   <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="p-6 pt-2 flex flex-col flex-1 relative z-10">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">{news.publisher}</span>
                  <h4 className="font-serif text-lg leading-snug mb-auto group-hover:text-primary transition-colors">{news.title}</h4>
                  <div className="mt-6 flex items-center justify-between w-full">
                    <span className="text-xs font-medium text-muted-foreground">{new Date(news.published_at).toLocaleDateString()}</span>
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
           <div className="p-8 text-center text-muted-foreground glass-panel rounded-3xl border-dashed">No recent news highlights.</div>
        )}
      </section>

      {/* 2 COLUMNS: REPOS & HN */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        
        {/* REPOS */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-4 font-display font-bold uppercase tracking-[0.15em] text-sm text-foreground">
              <span className="w-8 h-px bg-primary block" /> GitHub Repos
            </h2>
            <Link href="/repos" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-4">
            {repos.slice(0, 4).map((r: any) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold text-base tracking-tight truncate group-hover:text-primary transition-colors">{r.title}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full shrink-0">
                    ★ {r.stars_total?.toLocaleString()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{r.description}</p>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  {r.language && <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{r.language}</span>}
                  <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5" /> Repository</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* HN */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-4 font-display font-bold uppercase tracking-[0.15em] text-sm text-foreground">
              <span className="w-8 h-px bg-primary block" /> Developer Pulse
            </h2>
            <Link href="/discussions" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {discussions.slice(0, 5).map((s: any, i: number) => (
              <a key={s.id} href={s.url || s.hn_url} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border/50 group">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors font-display font-bold text-sm text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-snug mb-1.5 truncate group-hover:text-primary transition-colors">{s.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md"><Flame className="w-3 h-3" />{s.score} pts</span>
                    <span>{s.comments} comments</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH PAPERS (FULL WIDTH BOTTOM) */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-center gap-4 font-display font-bold uppercase tracking-[0.15em] text-sm text-foreground">
            <span className="w-8 h-px bg-primary block" /> Latest Research
          </h2>
          <Link href="/papers" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {papers.slice(0, 4).map((p: any) => (
             <Link key={p.id} href={`/paper/${p.id}`} className="block p-6 rounded-3xl glass-panel hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="flex items-baseline justify-between gap-4 mb-3">
                 <h3 className="font-serif text-lg leading-snug text-foreground group-hover:text-primary transition-colors">{p.title}</h3>
                 <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
               </div>
               <p className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">{p.summary_one_min || p.abstract}</p>
               <div className="flex items-center gap-3">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">{p.field || 'Research'}</span>
                 <span className={cn(
                   "text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider",
                   p.difficulty_score <= 3 ? "bg-emerald-500/10 text-emerald-500" :
                   p.difficulty_score <= 6 ? "bg-amber-500/10 text-amber-500" :
                   "bg-rose-500/10 text-rose-500"
                 )}>
                   {p.difficulty_score <= 3 ? "Beginner Friendly" : p.difficulty_score <= 6 ? "Intermediate" : "Advanced"}
                 </span>
               </div>
             </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
