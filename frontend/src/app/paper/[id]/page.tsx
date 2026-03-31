"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, BookOpen, Clock, Brain, Rocket, Code2, ExternalLink, ChevronRight, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Enriching Technical Context...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <h2 className="text-2xl font-display font-bold">Paper Not Found</h2>
        <p className="text-muted-foreground">The resource you are looking for does not exist or has been moved.</p>
        <Link href="/papers" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Research
        </Link>
      </div>
    );
  }

  const activeSummary = viewMode === "1min" ? paper.summary_one_min : 
                        viewMode === "5min" ? paper.summary_five_min : 
                        paper.summary_deep;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* HEADER NAVIGATION */}
      <nav className="flex items-center justify-between mb-12">
        <Link href="/papers" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Research
        </Link>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-full border border-border hover:bg-muted transition-colors"><Share2 className="w-4 h-4" /></button>
          <a href={paper.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            View on ArXiv <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-2 space-y-12">
          
          <header className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                    {paper.field}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {new Date(paper.published_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight text-foreground">
                {paper.title}
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                By {paper.authors?.join(", ") || "Unknown Authors"}
              </p>
          </header>

          {/* AI SUMMARY CONTROL */}
          <section className="glass-panel p-8 rounded-[2rem] space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Sparkles className="w-12 h-12" /></div>
            
            <div className="flex items-center justify-between border-b border-border/50 pb-6">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
                    <Brain className="w-5 h-5" /> AI ENRICHMENT
                </h2>
                <div className="flex p-1 bg-muted/50 rounded-full border border-border/50">
                    {["1min", "5min", "deep"].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode as any)}
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                            viewMode === mode ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {mode === "deep" ? "Architectural" : mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {activeSummary}
                </p>
            </div>
          </section>

          {/* BUILD IDEAS */}
          <section className="space-y-8">
             <h2 className="flex items-center gap-3 text-lg font-display font-medium">
                <Rocket className="w-6 h-6 text-primary" /> Project Implementation Concepts
             </h2>
             <div className="grid grid-cols-1 gap-4">
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-muted-foreground leading-relaxed italic relative z-10">
                        {paper.build_ideas}
                    </p>
                </div>
             </div>
          </section>
        </div>

        {/* RIGHT COLUMN: TECHNICAL SPECS & RELATED */}
        <aside className="space-y-10">
          
          {/* TECHNICAL SPEC CARD */}
          <div className="p-8 rounded-[2rem] bg-card border border-border/50 shadow-sm space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-4">
                Technical Intelligence
            </h3>
            
            <div className="space-y-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Difficulty Rating</p>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xl font-display font-bold",
                            paper.difficulty_score <= 3 ? "text-emerald-500" : paper.difficulty_score <= 6 ? "text-amber-500" : "text-rose-500"
                        )}>
                            {paper.difficulty_score}/10
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    paper.difficulty_score <= 3 ? "bg-emerald-500" : paper.difficulty_score <= 6 ? "bg-amber-500" : "bg-rose-500"
                                )}
                                style={{ width: `${paper.difficulty_score * 10}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Estimated Build</p>
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <Clock className="w-4 h-4" /> {paper.estimated_build_time}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Suggested Stack</p>
                    <div className="flex flex-wrap gap-2">
                        {paper.suggested_stack?.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 bg-muted/50 rounded-lg text-xs font-semibold border border-border/50 flex items-center gap-1.5">
                                <Code2 className="w-3 h-3 text-primary/60" /> {s}
                            </span>
                        )) || <span className="text-xs text-muted-foreground">General Technical Focus</span>}
                    </div>
                </div>
            </div>
          </div>

          {/* RELATED RESEARCH */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground px-4">
                Related Research
            </h3>
            <div className="space-y-4">
                {paper.related_papers?.map((rp) => (
                    <Link key={rp.id} href={`/paper/${rp.id}`} className="block p-5 rounded-2xl border border-transparent hover:border-border hover:bg-card transition-all group">
                        <h4 className="text-sm font-bold leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">{rp.title}</h4>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{rp.field}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    </Link>
                )) || <p className="text-xs text-muted-foreground px-4">No related research found.</p>}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
