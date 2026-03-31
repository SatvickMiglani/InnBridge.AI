"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Rocket, Target, ListChecks, Milestone, Hammer, Code2, ClipboardList, Info, Calendar, Gauge, ExternalLink, Lightbulb } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API = "http://localhost:8000";

interface ProjectDetail {
  enrollment_id: string;
  title: string;
  project_data: {
    title: string;
    description: string;
    problem_statement: string;
    target_audience: string;
    proposed_solution: string;
    core_features: string[];
    tech_stack: string[];
    novelty: string;
    pitch: string;
    difficulty_score: number;
    estimated_time: string;
    roadmap: string[];
    url?: string;
    stars?: number;
    language?: string;
    type?: "ai" | "github";
  };
  enrolled_at: string;
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API}/projects/enrolled/detail/${id}`);
        if (!res.ok) throw new Error("Project not found");
        const json = await res.json();
        setProject(json.data);
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
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Assembling Project Blueprint...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <h2 className="text-2xl font-display font-bold">Blueprint Not Found</h2>
        <p className="text-muted-foreground">The technical specification you are looking for does not exist.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to My Projects
        </Link>
      </div>
    );
  }

  const p = project.project_data;
  const isGithub = p.type === "github";

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* HEADER NAVIGATION */}
      <nav className="flex items-center justify-between mb-12">
        <Link href="/projects" className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to My Projects
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Enrolled on {new Date(project.enrolled_at).toLocaleDateString()}
          </span>
          {isGithub && (
              <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-sm shadow-xl hover:bg-slate-800 transition-all">
                View on GitHub <ExternalLink className="w-4 h-4" />
              </a>
          )}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: PROJECT SPECIFICATION */}
        <div className="lg:col-span-2 space-y-12">
          
          <header className="space-y-6">
              <div className="flex items-center gap-3">
                <span className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border",
                    isGithub ? "bg-slate-500/10 text-slate-500 border-slate-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                    {isGithub ? "Open Source Baseline" : "AI Custom Blueprint"}
                </span>
                {isGithub && p.language && <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.language}</span>}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight tracking-tight text-foreground">
                {p.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 py-2">
                {p.pitch}
              </p>
          </header>

          {/* PROBLEM & MISSION */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary">
                    <Info className="w-4 h-4" /> The Problem
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.problem_statement}</p>
             </div>
             <div className="p-8 rounded-[2rem] bg-card border border-border/50 space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-indigo-500">
                    <Target className="w-4 h-4" /> Target Audience
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.target_audience}</p>
             </div>
          </section>

          {/* SOLUTION DEEP DIVE */}
          <section className="glass-panel p-10 rounded-[2.5rem] space-y-10 border-indigo-500/10">
             <div className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-serif">
                   <Hammer className="w-7 h-7 text-primary" /> Proposed Engineering Solution
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{p.proposed_solution}</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-border/50">
                <div className="space-y-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-foreground">
                        <ListChecks className="w-5 h-5 text-emerald-500" /> Core Build Features
                    </h3>
                    <ul className="space-y-4">
                        {p.core_features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 group">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-500 group-hover:bg-emerald-500 group-hover:text-emerald-950 transition-colors shrink-0 mt-0.5">{i+1}</div>
                                <span className="text-sm text-muted-foreground leading-relaxed">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                {!isGithub && (
                    <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-foreground">
                            <Lightbulb className="w-5 h-5 text-amber-500" /> Architectural Novelty
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed italic p-5 bg-muted/30 rounded-2xl border border-dashed border-border/50">
                            {p.novelty}
                        </p>
                    </div>
                )}
             </div>
          </section>

          {/* ROADMAP */}
          <section className="space-y-10">
             <h2 className="flex items-center gap-3 text-2xl font-serif">
                <Milestone className="w-7 h-7 text-primary" /> Technical Implementation Roadmap
             </h2>
             <div className="space-y-4">
                {p.roadmap.map((step, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border/50 group hover:border-primary/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                            P0{i+1}
                        </div>
                        <p className="text-sm font-medium leading-relaxed group-hover:text-foreground transition-colors">{step}</p>
                    </div>
                ))}
             </div>
          </section>
        </div>

        {/* RIGHT COLUMN: TECHNICAL DASHBOARD */}
        <aside className="space-y-10">
          
          <div className="p-8 rounded-[2rem] bg-card border border-border/50 shadow-sm space-y-8 sticky top-20">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-4 flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Technical Stats
            </h3>
            
            <div className="space-y-8">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><Gauge className="w-3.5 h-3.5" /> Engineering Difficulty</p>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xl font-display font-bold",
                            p.difficulty_score <= 3 ? "text-emerald-500" : p.difficulty_score <= 6 ? "text-amber-500" : "text-rose-500"
                        )}>
                            {p.difficulty_score}/10
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    p.difficulty_score <= 3 ? "bg-emerald-500" : p.difficulty_score <= 6 ? "bg-amber-500" : "bg-rose-500"
                                )}
                                style={{ width: `${p.difficulty_score * 10}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Est. Production Time</p>
                    <div className="flex items-center gap-2 font-bold text-foreground">
                        <Calendar className="w-4 h-4" /> {p.estimated_time}
                    </div>
                </div>

                {!isGithub && (
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Recommended Architecture</p>
                        <div className="space-y-3">
                            {p.tech_stack.map((s, i) => (
                                <div key={i} className="p-3 bg-muted/40 rounded-xl text-xs font-semibold border border-border/50 flex flex-col gap-1">
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">{s.split(': ')[0]}:</span>
                                    <span className="flex items-center gap-2 text-foreground truncate"><Code2 className="w-3 h-3 text-primary/60" /> {s.split(': ')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isGithub && (
                    <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Community Success</p>
                         <div className="p-4 bg-muted/40 rounded-xl border border-border/50 text-amber-500 font-bold flex items-center gap-2 text-lg">
                            ★ {p.stars?.toLocaleString()} GitHub Stars
                         </div>
                    </div>
                )}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
