"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, BookOpen, Clock, Brain, Rocket, Code2, ExternalLink, ChevronRight, Share2, Sparkles, Loader2, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API = "http://localhost:8000";

interface PaperDetail {
  id: string;
  title: string;
  authors: string[];
  field: string;
  published_date: string;
  source_url: string;
  abstract: string;
  summary_one_min: string;
  summary_five_min: string;
  summary_deep: string;
  build_ideas: string;
  suggested_stack: string[];
  difficulty_score: number;
  estimated_build_time: string;
  related_papers: any[];
}

export default function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"1min" | "5min" | "deep">("1min");

  useEffect(() => {
    const fetchDetail = async () => {
      const userId = localStorage.getItem("user_id") || "00000000-0000-0000-0000-000000000000";
      try {
        const res = await fetch(`${API}/feed/${userId}/paper/${id}`);
        if (!res.ok) throw new Error("Paper not found");
        const json = await res.json();
        setPaper(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
        <p className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">Decoding Scientific Patterns...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-8 animate-fade-in">
        <h2 className="text-4xl font-bold tracking-tight">Intelligence Gap</h2>
        <p className="text-muted-foreground text-lg">The research asset you're requesting is currently offline or unauthorized.</p>
        <Link href="/papers">
            <Button variant="outline" className="gap-2 font-bold border-border">
                <ArrowLeft className="w-4 h-4" /> Back to Research
            </Button>
        </Link>
      </div>
    );
  }

  const activeSummary = viewMode === "1min" ? paper.summary_one_min : 
                        viewMode === "5min" ? paper.summary_five_min : 
                        paper.summary_deep;

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (score <= 6) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  return (
    <div className="min-h-screen bg-background -mt-4 md:-mt-8 lg:-mt-12">
      {/* Detail Header */}
      <div className="border-b border-border bg-card mb-12 -mx-4 md:-mx-8 lg:-mx-12">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <Link href="/papers">
            <Button variant="ghost" size="sm" className="mb-8 p-0 h-auto gap-2 text-muted-foreground hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest group">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Return to Research Index
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                 <Badge variant="purple" className="lowercase">{paper.field}</Badge>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(paper.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-4xl">
                {paper.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                 <span className="w-4 h-px bg-muted-foreground opacity-30" />
                 By {paper.authors?.join(", ") || "Technical Research Team"}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
               <Button variant="outline" className="border-border hover:bg-muted font-bold h-11 px-6">
                  <Share2 className="w-4 h-4 mr-2" /> Share
               </Button>
               <a href={paper.source_url} target="_blank" rel="noreferrer">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6">
                      View Source <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
               </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto max-w-7xl px-0 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left: Detail Content */}
            <div className="lg:col-span-2 space-y-16 animate-slide-up">
                
                {/* Synthesis Mode Switcher */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                           <Brain size={16} /> Technical Synthesis
                        </h2>
                        <div className="flex p-1 bg-muted rounded-lg border border-border shadow-inner">
                            {["1min", "5min", "deep"].map((mode) => (
                                <button
                                  key={mode}
                                  onClick={() => setViewMode(mode as any)}
                                  className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                                    viewMode === mode ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {mode === "deep" ? "Full Insight" : mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="professional-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-card to-background">
                         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles size={120} className="text-primary" />
                         </div>
                         <div className="relative z-10 leading-relaxed text-foreground/90 text-lg whitespace-pre-wrap selection:bg-primary/20">
                            {activeSummary}
                         </div>
                    </div>
                </section>

                {/* Implementation / Build Ideas */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2 border-b border-border pb-4">
                        <Rocket size={16} /> Experimental Implementation
                    </h2>
                    <div className="p-8 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
                        <p className="text-lg text-foreground font-medium leading-relaxed italic border-l-4 border-primary pl-6">
                           "{paper.build_ideas}"
                        </p>
                    </div>
                </section>

                {/* Abstract Fallback */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-border pb-4">
                        Scientific Abstract
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {paper.abstract}
                    </p>
                </section>
            </div>

            {/* Right: Sidebar Specs */}
            <aside className="space-y-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
                
                <div className="professional-card overflow-hidden">
                    <div className="p-6 bg-muted/30 border-b border-border">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Engineering Specs</h3>
                    </div>
                    <div className="p-8 space-y-10">
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Complexity Index</p>
                            <div className="flex items-center gap-4">
                                <span className={cn("text-3xl font-bold", paper.difficulty_score > 6 ? "text-purple-600" : paper.difficulty_score > 3 ? "text-blue-600" : "text-green-600")}>
                                    {paper.difficulty_score}/10
                                </span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", paper.difficulty_score > 6 ? "bg-purple-500" : paper.difficulty_score > 3 ? "bg-blue-500" : "bg-green-500")}
                                        style={{ width: `${paper.difficulty_score * 10}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Est. Implementation Time</p>
                            <div className="flex items-center gap-3 font-bold text-foreground">
                                <Clock size={18} className="text-primary" />
                                {paper.estimated_build_time || "4-8 Engineering Weeks"}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Suggested Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {(paper.suggested_stack || ["Research Focus"]).map((s, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 font-bold text-[10px] uppercase bg-muted text-foreground">
                                        <Code2 size={12} className="mr-1.5 text-primary" /> {s}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Research */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-l-2 border-primary pl-4">Lateral Insights</h3>
                    <div className="space-y-3">
                        {(paper.related_papers || []).map((rp, idx) => (
                            <Link key={rp.id || idx} href={`/paper/${rp.id}`} className="block">
                                <div className="professional-card p-5 group hover:border-primary/50 transition-all">
                                    <h4 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors mb-4 line-clamp-2">{rp.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] border-border lowercase">{rp.field}</Badge>
                                        <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </aside>
        </div>
      </div>
    </div>
  );
}
