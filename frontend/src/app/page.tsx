"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Sparkles, Zap, Code2, BookOpen, Github, Twitter, ArrowRight, LayoutDashboard, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNavbarSearch } from "@/lib/use-navbar-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = "http://localhost:8000";

interface FeedData {
  discussions: any[];
  papers: any[];
  repos: any[];
  banner: any[];
}

export default function HomeFeed() {
  const [data, setData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchContext, setSearchContext] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const searchQuery = useNavbarSearch();

  const fetchWithTimeout = async (url: string, options = {}, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === "AbortError") {
        throw new Error("Neural synchronization timed out. Check connection.");
      }
      throw error;
    }
  };

  const fetchFeed = useCallback(async () => {
    const userId = localStorage.getItem("user_id") || "guest";
    setIsAuth(!!localStorage.getItem("user_id"));
    setLoading(true);
    setSearchContext(null);

    try {
      const res = await fetchWithTimeout(`${API}/feed/${userId}/unified`);
      if (!res.ok) throw new Error(`Fetch protocol failed: ${res.status}`);
      const json = await res.json();
      setData(json.feed || json);
    } catch (err: any) {
      console.warn("Feed synchronization alert:", err.message);
      setData({ banner: [], discussions: [], papers: [], repos: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = async (query: string) => {
    const userId = localStorage.getItem("user_id") || "guest";
    setSearching(true);
    setSearchContext(query);

    try {
      const res = await fetchWithTimeout(`${API}/feed/${userId}/search?q=${encodeURIComponent(query)}`);
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
  }, [fetchFeed]);

  const features = [
    {
      image: "/assets/features/github-explorer.jpg",
      title: "GitHub Explorer",
      description: "Discover trending technical repositories filtered by your interests.",
      link: "/repos"
    },
    {
      image: "/assets/features/innovation-pulse.jpg",
      title: "Innovation Pulse",
      description: "Aggregated news and research breakthroughs for deep learning.",
      link: "/news"
    },
    {
      image: "/assets/features/realtime-updates.jpg",
      title: "Real-time Updates",
      description: "Stay synchronized with live architectural shifts and discussions.",
      link: "/discussions"
    },
    {
      image: "/assets/features/project-engine.jpg",
      title: "Project Engine",
      description: "Instant technical specifications and AI project blueprints.",
      link: "/projects"
    },
  ];

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (score <= 6) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Pulse Feed...</p>
      </div>
    );
  }

  const unifiedFeed = [
    ...(data?.papers || []).map(p => ({ ...p, type: 'paper', date: new Date(p.published_at || Date.now()) })),
    ...(data?.repos || []).map(r => ({ ...r, type: 'repo', date: new Date() })),
    ...(data?.discussions || []).map(d => ({ ...d, type: 'discussion', date: new Date() })),
    ...(data?.banner || []).map(b => ({ ...b, type: 'news', date: new Date(b.published_at || Date.now()) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="min-h-screen bg-background -mt-4 md:-mt-8 lg:-mt-12 selection:bg-primary/20 selection:text-primary">
      {/* Hero Section - Full Width 'Neural Infrastructure' */}
      <section className="relative py-32 md:py-48 px-6 overflow-hidden group border-b border-border/50">
        {/* Technical Grid Infrastructure */}
        <div className="technical-grid opacity-20 dark:opacity-40" />
        
        {/* Mechanical Details - Corner Markers */}
        <div className="coordinate-mark top-0 left-0">NW-NODE [40.7128, -74.0060]</div>
        <div className="coordinate-mark top-0 right-0 font-bold">STATUS: SYNC_ACTIVE</div>
        <div className="coordinate-mark bottom-0 left-0 opacity-10">CORE_V: 2.41.0</div>
        <div className="coordinate-mark bottom-0 right-0 opacity-10 font-bold">DISCOVERY_LAYER_01</div>

        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105 group-hover:scale-100 transition-transform duration-1000 opacity-30 grayscale contrast-125"
          style={{ backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663501655055/mu38SLekv6j4Em5pzzQMwk/hero-professional-dark-djXYNNee3JqExGFKtigVAn.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/91 via-background/60 to-background z-1" />
        
        {/* Neural Flow Layer - High Fidelity Atmospheric Depth */}
        <div className="neural-mesh-layer" style={{ backgroundImage: 'url("/assets/neural-wave.jpg")' }} />

        <div className="relative container mx-auto max-w-5xl text-center z-10 px-6">
          {/* Floating Node Metadata */}
          <div className="absolute -top-12 left-10 md:left-20 animate-pulse opacity-40 hidden md:block">
            <div className="text-[10px] font-mono text-primary border-l border-primary/30 pl-2">
              NODE_ID: 0x7F42 <br />
              LATENCY: 12ms
            </div>
          </div>
          <div className="absolute top-20 right-0 md:right-10 animate-pulse opacity-30 hidden md:block" style={{ animationDelay: '1s' }}>
            <div className="text-[10px] font-mono text-primary border-r border-primary/30 pr-2 text-right">
              SYNC_TYPE: SEMANTIC <br />
              ENCRYPTION: AES-256
            </div>
          </div>

          <div className="tech-badge inline-block mb-10 animate-fade-in">
            <span className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Intelligence Synchronization Active
            </span>
          </div>

          <h1 className="animate-slide-up">
            Architecting the
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-primary text-glow">Future Workspace</span>
          </h1>

          <p className="text-subheading mb-14 max-w-2xl mx-auto animate-slide-up opacity-80" style={{ animationDelay: '100ms' }}>
            The premier neural workspace for technical discovery.
            <br className="hidden md:block" />
            AI-powered aggregation of research, code, and developer pulse.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            {isAuth ? (
                <Link href="/projects">
                    <button className="tech-button group min-w-[240px]">
                        <LayoutDashboard size={20} className="group-hover:rotate-12 transition-transform opacity-70" /> 
                        <span>RESUME WORKSPACE</span>
                    </button>
                </Link>
            ) : (
                <Link href="/signup">
                    <button className="tech-button group min-w-[240px]">
                        <Rocket size={20} className="group-hover:-translate-y-1 transition-transform opacity-70" /> 
                        <span>BEGIN INTEGRATION</span>
                    </button>
                </Link>
            )}
            <Link href="/about">
                <button className="px-8 py-4 rounded-xl font-bold border border-border/50 bg-muted/20 backdrop-blur-md hover:bg-muted/40 transition-all min-w-[240px] text-muted-foreground hover:text-foreground">
                    TECHNICAL BLUEPRINT
                </button>
            </Link>
          </div>

          {/* Mouse Scroll Indicator */}
          <div className="mt-20 flex justify-center animate-bounce opacity-40">
            <div className="w-6 h-10 border-2 border-primary/40 rounded-full flex justify-center p-1">
                <div className="w-1 h-2 bg-primary/60 rounded-full animate-scroll" />
            </div>
          </div>
        </div>
      </section>

      {/* Features & Pulse Feed - Centered Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Features Section - Premium Upscale */}
        {!searchContext && (
          <section className="py-32 px-4 border-y border-border/50 mb-16 bg-muted/5 -mx-4 md:-mx-8 lg:-mx-12 lg:px-12 relative overflow-hidden rounded-[3rem]">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full opacity-50" />
            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col items-center mb-24 text-center">
                    <Badge variant="purple" className="mb-6 uppercase tracking-[0.2em] px-6 py-2">System Integrations</Badge>
                    <h2 className="animate-slide-up">
                        Neural Capabilities
                    </h2>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {features.map((feature, idx) => (
                    <Link href={feature.link} key={idx} className="block group">
                        <div
                            className="relative h-[480px] rounded-[2.5rem] overflow-hidden border border-border/50 transition-all duration-700 hover:border-primary/60 shadow-2xl hover:scale-[1.01]"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            {/* Feature Background Image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url(${feature.image})` }}
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
                            
                            {/* Content */}
                            <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                <div className="space-y-4">
                                    <div className="w-12 h-1 bg-primary/60 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                                    <h3 className="text-3xl font-bold text-foreground tracking-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                                        {feature.description}
                                    </p>
                                    <div className="pt-4 flex items-center gap-2 text-primary font-bold text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        INITIALIZE_MODULE 0x{idx}F <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                </div>
            </div>
          </section>
        )}

        {/* Pulse Feed Preview / Search Results */}
        <section className="py-16">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <Badge variant={searchContext ? "primary" : "success"} className="uppercase tracking-widest text-[10px]">
                    {searchContext ? "Search Active" : "Operational"}
                </Badge>
                <h2 className="animate-slide-up">
                    {searchContext ? `Results for "${searchContext}"` : "Innovation Pulse"}
                </h2>
                <p className="text-muted-foreground font-medium">
                    {searchContext 
                        ? `AI-powered semantic search generated ${unifiedFeed.length} knowledge nodes.` 
                        : "Personalized intelligence feed curated from verified technical sources."}
                </p>
            </div>
            {searchContext && (
                <Button onClick={fetchFeed} variant="outline" size="sm" className="font-bold border-border">
                    Reset Node State
                </Button>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {unifiedFeed.slice(0, searchContext ? 20 : 8).map((item, idx) => {
            const isInternal = item.type === 'paper';
            const Wrapper = isInternal ? Link : 'a';
            const wrapperProps = isInternal 
                ? { href: `/paper/${item.id}` } 
                : { href: item.url || item.hn_url, target: "_blank", rel: "noreferrer" };

            return (
              <Wrapper
                key={item.id || item.url || idx}
                {...wrapperProps}
                className="professional-card p-6 flex items-start gap-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 animate-slide-up group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                  <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-xl bg-muted/40 items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    {item.type === "paper" && <BookOpen size={24} />}
                    {item.type === "news" && <Zap size={24} />}
                    {item.type === "repo" && <Github size={24} />}
                    {item.type === "discussion" && <Code2 size={24} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {item.title}
                      </h3>
                      {item.difficulty_score && (
                          <Badge
                              variant="secondary"
                              className={cn("text-[9px] font-bold uppercase tracking-widest px-2", getDifficultyColor(item.difficulty_score))}
                          >
                              {item.difficulty_score <= 3 ? "Beginner" : item.difficulty_score <= 6 ? "Intermediate" : "Advanced"}
                          </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed opacity-80">
                      {item.summary_one_min || item.description || item.abstract || "Aggregating multi-source intelligence for technical decision makers."}
                    </p>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {item.field || item.category || item.language || item.type}
                      </span>
                      <span className="opacity-40">•</span>
                      <span>{item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Synchronized"}</span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">
                      <ArrowRight className="text-primary" size={20} />
                  </div>
              </Wrapper>
            );
          })}

          {unifiedFeed.length === 0 && !loading && (
              <div className="text-center py-24 border border-dashed border-border rounded-3xl bg-muted/5">
                  <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <Zap size={32} className="text-muted-foreground opacity-30" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Signal Lost</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium">No knowledge nodes detected in current coordinate. Check again soon.</p>
              </div>
          )}
        </div>

        {!searchContext && unifiedFeed.length > 0 && (
            <div className="mt-16 text-center">
                <Link href="/news">
                    <Button
                        size="lg"
                        variant="outline"
                        className="group border-border hover:bg-muted font-bold min-w-[200px] h-12 rounded-xl"
                    >
                        Access Full Signal
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </div>
        )}
      </section>

      </div>

      {/* CTA Section */}
      {!isAuth && (
          <section className="py-24 px-4 bg-muted/5 border-t border-border mt-12 overflow-hidden relative">
            <div className="container mx-auto max-w-3xl text-center relative z-10">
                <Badge variant="success" className="mb-6 uppercase">Integration Gateway</Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
                    Ready to Secure Your Edge?
                </h2>
                <p className="text-lg text-muted-foreground mb-10 font-medium">
                    Initialize your professional node today and begin synchronized discovery.
                </p>
                <Link href="/signup">
                    <button className="tech-button group min-w-[240px] h-14 mx-auto">
                        <Rocket size={20} className="mr-2 group-hover:-translate-y-1 transition-transform opacity-70" /> 
                        <span>CREATE ENGINEERING NODE</span>
                    </button>
                </Link>
            </div>
          </section>
      )}

      {/* Technical Footer - 'Neural Infrastructure' Bottom Header */}
      <footer className="py-20 px-6 border-t border-border/50 bg-background relative overflow-hidden">
        <div className="technical-grid opacity-10" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <span className="text-xl font-bold tracking-tight text-foreground">InnoBridge<span className="text-primary opacity-80">.AI</span></span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                The premier neural workspace for technical discovery. Architecting the future of intelligence synchronization.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Discovery Hub</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/repos" className="text-muted-foreground hover:text-primary transition-colors">GitHub Explorer</Link></li>
                <li><Link href="/news" className="text-muted-foreground hover:text-primary transition-colors">Innovation Pulse</Link></li>
                <li><Link href="/papers" className="text-muted-foreground hover:text-primary transition-colors">Research Papers</Link></li>
                <li><Link href="/discussions" className="text-muted-foreground hover:text-primary transition-colors">Developer Sync</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Infrastructure</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Technical Blueprint</Link></li>
                <li><Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors">System Profile</Link></li>
                <li><Link href="/projects" className="text-muted-foreground hover:text-primary transition-colors">AI Project Engine</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Security & Nodes</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li className="text-[10px] font-mono opacity-40 uppercase">CORE_VERSION: 2.41.0</li>
                <li className="text-[10px] font-mono opacity-40 uppercase">NODE_STATUS: OPERATIONAL</li>
                <li className="text-[10px] font-mono opacity-40 uppercase">ENCRYPTION: AES-256-GCM</li>
              </ul>
              <div className="pt-4 flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted/20 border border-border/50 flex items-center justify-center cursor-not-allowed grayscale opacity-30">
                  <Github size={16} />
                </div>
                <div className="w-8 h-8 rounded-full bg-muted/20 border border-border/50 flex items-center justify-center cursor-not-allowed grayscale opacity-30">
                  <Twitter size={16} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              © 2026 INNOBRIDGE.AI // ALL PROTOCOLS RESERVED
            </p>
            <div className="flex gap-6 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Sync</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
