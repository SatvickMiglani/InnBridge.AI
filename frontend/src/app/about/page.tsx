"use client";

import { Zap, Brain, Newspaper, Code2, Flame, FileText, Sparkles, Users, BookmarkCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Feed",
    description: "Personalized research papers, repos, and discussions curated by AI based on your interests and skill level.",
    variant: "default",
  },
  {
    icon: Sparkles,
    title: "Project Blueprints",
    description: "Generate 6 radically different project ideas from any prompt — each with full tech stacks, roadmaps, and problem statements.",
    variant: "success",
  },
  {
    icon: Newspaper,
    title: "Trending Tech News",
    description: "Real-time aggregation of developer news from top sources, filtered and ranked for relevance.",
    variant: "purple",
  },
  {
    icon: FileText,
    title: "Research Papers",
    description: "ArXiv papers with AI-generated summaries at multiple depth levels — from 1-minute overviews to deep dives.",
    variant: "secondary",
  },
  {
    icon: Code2,
    title: "GitHub Discovery",
    description: "Discover trending and relevant open-source repositories matched to your technical interests.",
    variant: "primary",
  },
  {
    icon: Flame,
    title: "Developer Pulse",
    description: "Curated HackerNews discussions and developer community insights so you never miss what's trending.",
    variant: "warning",
  },
  {
    icon: BookmarkCheck,
    title: "Enroll & Save",
    description: "Enroll in project blueprints to save them to your profile. Build your personal project portfolio over time.",
    variant: "success",
  },
  {
    icon: Users,
    title: "Skill-Aligned",
    description: "Everything adapts to your skill level — beginner to expert. Projects, papers, and recommendations stay relevant.",
    variant: "default",
  },
];

const techStack = [
  { label: "Frontend", items: "Next.js 16, React, Tailwind CSS" },
  { label: "Backend", items: "FastAPI, Python, SQLAlchemy" },
  { label: "Database", items: "PostgreSQL, Qdrant (Vector DB)" },
  { label: "AI / LLM", items: "Groq (Llama 3.1), Sentence Transformers" },
  { label: "APIs", items: "ArXiv, GitHub, NewsAPI, HackerNews" },
];

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20 animate-fade-in transition-all">

      {/* HERO SECTION */}
      <section className="pt-8 text-center space-y-6 animate-slide-up">
        <div className="flex flex-col items-center">
            <Badge variant="purple" className="mb-4 uppercase tracking-tighter">Mission Statement</Badge>
            <h1>
              The <span className="text-primary italic">InnoBridge</span> Vision
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We condense the vast landscape of research papers, trending repositories, and developer discussions into a personalized stream of actionable technical intelligence.
            </p>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between border-l-2 border-primary pl-4">
          <h2 className="text-label">Capabilities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="group hover:border-primary/50 transition-all flex flex-col p-6">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-base font-bold mb-2 group-hover:text-primary transition-colors">{f.title}</CardTitle>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* STACK SECTION */}
      <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Card className="p-0 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border p-8">
                <h2 className="flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-primary" /> Technical Architecture
                </h2>
            </CardHeader>
            <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                {techStack.map((t) => (
                    <div key={t.label} className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t.label}</p>
                    <p className="text-sm text-foreground font-bold leading-snug">{t.items}</p>
                    </div>
                ))}
                </div>
            </CardContent>
        </Card>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="space-y-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between border-l-2 border-primary pl-4">
          <h2 className="text-label">The Experience</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Technical Profile", desc: "Define your interests and proficiency. Our engine adapts all recommendations and Blueprint depth to your stack." },
            { step: "2", title: "Ecosystem Scan", desc: "Browse a unified feed of arXiv papers, GitHub repos, and industry news ranked by contextual relevance." },
            { step: "3", title: "Actionable Blueprints", desc: "Convert technical concepts into development roadmaps. Generate fully spec'd project ideas and save them to your workspace." },
          ].map((s) => (
            <Card key={s.step} className="p-8 text-center group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg mx-auto mb-6 group-hover:scale-110 transition-transform">{s.step}</div>
              <h3>{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="text-center space-y-6 pt-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="space-y-2">
            <p className="text-label">Ready to build something unique?</p>
            <h2>Start your innovation journey.</h2>
        </div>
        <Link href="/projects" className="inline-block">
            <Button size="lg" className="h-12 px-10 rounded-full font-bold shadow-lg shadow-primary/10 gap-3 group">
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" /> Launch Project Hub <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </Link>
      </section>

    </div>
  );
}
