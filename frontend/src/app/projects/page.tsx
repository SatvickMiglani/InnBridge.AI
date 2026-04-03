"use client";

import { useState, useEffect } from "react";
import { Sparkles, Code2, Zap, X, Target, Clock, ArrowRight, Loader2, BookOpen, Github, Flame, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API = "http://localhost:8000";

export default function ProjectsPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<string>("idle");

  const generateProjects = async () => {
    if (!prompt.trim()) return;
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const res = await fetch(`${API}/projects/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, prompt: prompt })
      });
      if (!res.ok) throw new Error("Failed to generate project blueprints");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openProject = async (project: any) => {
    setSelectedProject(project);
    setWorkspaceLoading(true);
    setEnrollStatus("idle");

    const userId = localStorage.getItem("user_id");
    if (!userId) {
        setWorkspaceLoading(false);
        return;
    }

    try {
        const res = await fetch(`${API}/feed/${userId}/project-detail?project_description=${encodeURIComponent(project.title)}`);
        if (res.ok) {
            const data = await res.json();
            setWorkspaceData(data.related);
        }
    } catch (err) {
        console.error("Workspace error:", err);
    } finally {
        setWorkspaceLoading(false);
    }
  };

  const enrollInProject = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId || !selectedProject) return;

    setEnrollStatus("saving");
    try {
      const res = await fetch(`${API}/projects/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title: selectedProject.title,
          project_data: selectedProject,
        }),
      });
      if (res.status === 409) {
        setEnrollStatus("already");
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setEnrollStatus("enrolled");
    } catch (err) {
      setEnrollStatus("failed");
      setTimeout(() => setEnrollStatus("idle"), 2500);
    }
  };

  const getDifficultyColor = (score: number | string) => {
    const s = typeof score === 'string' ? parseInt(score) : score;
    if (s <= 3) return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (s <= 6) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-b border-border bg-card mb-12 -mx-4 md:-mx-8 lg:-mx-12 rounded-3xl overflow-hidden">
          <div className="container mx-auto px-6 py-16 max-w-7xl">
            <Badge variant="purple" className="mb-4">Project Engine</Badge>
            <h1>
              Project Blueprints
            </h1>
            <p className="text-subheading max-w-2xl">
              Describe your idea to generate instant technical specifications, roadmaps, and industry-grade tech stacks.
            </p>

            <div className="mt-10 flex flex-col md:flex-row gap-3 max-w-4xl">
                <div className="relative flex-1 group">
                   <input 
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateProjects()}
                      placeholder="e.g. A high-performance real-time analytics dashboard..."
                      className="w-full h-12 pl-4 pr-10 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-base"
                   />
                   <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                </div>
                <Button 
                  onClick={generateProjects} 
                  disabled={loading || !prompt.trim()}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold min-w-[200px]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                  Generate Engineering Plan
                </Button>
            </div>
          </div>
        </div>

        {/* Blueprints Grid */}
        <div className="container mx-auto max-w-7xl px-0 animate-fade-in">
          {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-6">
                  <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-widest text-primary animate-pulse">Architecting Your System...</p>
              </div>
          ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 animate-slide-up">
              {projects.map((p, idx) => (
                  <div
                  key={idx}
                  className="professional-card p-6 flex flex-col group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                  onClick={() => openProject(p)}
                  >
                  <div className="flex items-start justify-between mb-4">
                      <Code2 size={24} className="text-primary opacity-60 transition-opacity group-hover:opacity-100" />
                      <Badge
                          variant="secondary"
                          className={cn("text-[10px] font-bold uppercase", getDifficultyColor(p.difficulty_score || 5))}
                      >
                          {p.difficulty_score <= 3 ? "Beginner" : p.difficulty_score <= 6 ? "Intermediate" : "Advanced"}
                      </Badge>
                  </div>

                  <h3 className="mb-2 group-hover:text-primary transition-colors">
                      {p.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
                      {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                      {(p.tech_stack || []).slice(0, 3).map((tech: string) => (
                      <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground"
                      >
                          {tech}
                      </span>
                      ))}
                      {(p.tech_stack || []).length > 3 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground opacity-50">
                          +{(p.tech_stack || []).length - 3} more
                      </span>
                      )}
                  </div>

                  <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-primary hover:bg-primary/10 font-bold text-xs uppercase"
                  >
                      System Specs →
                  </Button>
                  </div>
              ))}
              </div>
          ) : hasSearched && !error ? (
              <div className="text-center py-32 border border-dashed border-border rounded-2xl">
                  <p className="text-muted-foreground italic">No architectures found. Try a different engineering prompt.</p>
              </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      {selectedProject && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 md:p-8 border-b border-border sticky top-0 bg-card z-10">
                <div className="flex-1 pr-8">
                  <Badge variant="purple" className="mb-2 lowercase">{selectedProject.type || 'ai roadmap'}</Badge>
                  <h2>
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 space-y-10">
                {/* Summary */}
                <div>
                  <h3 className="text-label mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-primary" />
                    System Architecture Summary
                  </h3>
                  <p className="text-base text-foreground leading-relaxed">
                    {selectedProject.proposed_solution || selectedProject.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-label mb-4 flex items-center gap-2">
                    <Code2 size={16} className="text-primary" />
                    Technical Specifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.tech_stack || []).map((tech: string) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-muted text-foreground font-semibold px-3 py-1"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Roadmaps / Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-label mb-4">
                            Phase Roadmap
                        </h3>
                        <ul className="space-y-3">
                            {(selectedProject.roadmap || selectedProject.core_features || []).map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-4">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {idx + 1}
                                </span>
                                <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                    {/* Related context from current app logic */}
                    <div>
                        <h3 className="text-label mb-4">
                            Contextual Resources
                        </h3>
                        {workspaceLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-8 bg-muted rounded w-full" />
                                <div className="h-8 bg-muted rounded w-full" />
                            </div>
                        ) : workspaceData ? (
                            <div className="space-y-2">
                                {workspaceData.papers?.slice(0, 2).map((p: any) => (
                                    <Link key={p.id} href={`/paper/${p.id}`} className="block p-3 rounded bg-muted/30 border border-border hover:border-primary/50 text-xs font-semibold truncate transition-colors">
                                        <BookOpen size={14} className="inline mr-2 text-primary" /> {p.title}
                                    </Link>
                                ))}
                                {workspaceData.repos?.slice(0, 2).map((r: any) => (
                                    <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="block p-3 rounded bg-muted/30 border border-border hover:border-primary/50 text-xs font-semibold truncate transition-colors">
                                        <Github size={14} className="inline mr-2 text-primary" /> {r.title || r.full_name}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs italic text-muted-foreground">Generating related technical context...</p>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12"
                    onClick={enrollInProject}
                    disabled={enrollStatus !== "idle"}
                  >
                        {enrollStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {enrollStatus === "idle" && <Flame size={18} className="mr-2" />}
                        {(enrollStatus === "enrolled" || enrollStatus === "already") && <Zap size={18} className="mr-2" />}
                        {enrollStatus === "idle" && "Secure Blueprint"}
                        {enrollStatus === "saving" && "Encoding..."}
                        {enrollStatus === "enrolled" && "Asset Secured ✓"}
                        {enrollStatus === "already" && "Already Secured ✓"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-border hover:bg-muted font-bold h-12"
                    onClick={() => setSelectedProject(null)}
                  >
                    Close Specifications
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
