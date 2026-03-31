"use client";

import { Zap, Github, Brain, Newspaper, Code2, Flame, FileText, Sparkles, Users, BookmarkCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Feed",
    description: "Personalized research papers, repos, and discussions curated by AI based on your interests and skill level.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: Sparkles,
    title: "Project Blueprints",
    description: "Generate 6 radically different project ideas from any prompt — each with full tech stacks, roadmaps, and problem statements.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Newspaper,
    title: "Trending Tech News",
    description: "Real-time aggregation of developer news from top sources, filtered and ranked for relevance.",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    icon: FileText,
    title: "Research Papers",
    description: "ArXiv papers with AI-generated summaries at multiple depth levels — from 1-minute overviews to deep dives.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Code2,
    title: "GitHub Discovery",
    description: "Discover trending and relevant open-source repositories matched to your technical interests.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Flame,
    title: "Developer Pulse",
    description: "Curated HackerNews discussions and developer community insights so you never miss what's trending.",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: BookmarkCheck,
    title: "Enroll & Save",
    description: "Enroll in project blueprints to save them to your profile. Build your personal project portfolio over time.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: Users,
    title: "Skill-Aligned",
    description: "Everything adapts to your skill level — beginner to expert. Projects, papers, and recommendations stay relevant.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
];

const techStack = [
  { label: "Frontend", items: "Next.js 15, React, Tailwind CSS" },
  { label: "Backend", items: "FastAPI, Python, SQLAlchemy" },
  { label: "Database", items: "PostgreSQL, Qdrant (Vector DB)" },
  { label: "AI / LLM", items: "Groq (Llama 3.1), Sentence Transformers" },
  { label: "APIs", items: "ArXiv, GitHub, NewsAPI, HackerNews" },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-20 animate-in fade-in duration-500 relative z-10">

      {/* Hero */}
      <div className="pt-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
          <Zap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
          About <span className="text-primary">InnoBridge AI</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your AI-powered innovation feed. We aggregate research papers, trending repos, developer discussions, and tech news — then generate custom project blueprints tailored to your skill level.
        </p>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-display font-medium text-center">What It Does</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 group">
                <div className={`w-10 h-10 rounded-xl ${f.bg} border flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-panel rounded-3xl p-8 md:p-10 space-y-6">
        <h2 className="text-2xl font-display font-medium flex items-center gap-3">
          <Code2 className="w-6 h-6 text-primary" /> Built With
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {techStack.map((t) => (
            <div key={t.label} className="p-4 rounded-xl bg-card border border-border/60">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.label}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{t.items}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <h2 className="text-2xl font-display font-medium text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Set Your Profile", desc: "Sign up with your interests, skill level, and designation. The AI uses this to personalize everything." },
            { step: "2", title: "Explore Your Feed", desc: "Browse curated papers, repos, news, and discussions — all ranked and filtered for your technical profile." },
            { step: "3", title: "Generate & Enroll", desc: "Describe what you want to build. Get 6 unique blueprints with roadmaps. Enroll to save them to your profile." },
          ].map((s) => (
            <div key={s.step} className="relative p-6 rounded-2xl bg-card border border-border/50 text-center group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-lg mx-auto mb-4">{s.step}</div>
              <h3 className="font-display font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-muted-foreground text-sm">Ready to start building?</p>
        <Link href="/projects" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
          <Sparkles className="w-5 h-5" /> Go to Project Hub <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
