"use client";

import { useState, useEffect } from "react";
import { Sparkles, Code2, BookmarkPlus, BookmarkCheck, Clock, Target, ArrowRight, ArrowLeft, Loader2, FileText, Flame, Terminal, Zap, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const API = "http://localhost:8000";

export default function ProjectsPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Workspace overlay state
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<string>("idle");

  // Check if navigated from profile with a project to view
  useEffect(() => {
    const stored = localStorage.getItem("view_project");
    if (stored) {
      localStorage.removeItem("view_project");
      try {
        const projectData = JSON.parse(stored);
        if (projectData && projectData.title) {
          setSelectedProject(projectData);
          setWorkspaceLoading(true);
          setEnrollStatus("already");

          // Fetch related workspace data
          const userId = localStorage.getItem("user_id");
          if (userId) {
            fetch(`${API}/feed/${userId}/project-detail?project_description=${encodeURIComponent(projectData.title)}`)
              .then(res => res.ok ? res.json() : null)
              .then(data => { if (data) setWorkspaceData(data.related); })
              .catch(() => {})
              .finally(() => setWorkspaceLoading(false));
          } else {
            setWorkspaceLoading(false);
          }
        }
      } catch (e) {
        console.error("Failed to parse view_project from localStorage", e);
      }
    }
  }, []);

  const generateProjects = async () => {
    if (!prompt.trim()) return;
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setProjects([]);
    setSelectedProject(null);
    setError(null);

    try {
      const res = await fetch(`${API}/projects/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, prompt: prompt })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      const fetched = data.projects || [];
      if (fetched.length === 0) {
        setError("No projects were generated. Try rephrasing your prompt or try again.");
      }
      setProjects(fetched);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate project blueprints. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProjects = async () => {
    if (!prompt.trim() || projects.length === 0) return;
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    setLoadingMore(true);
    // Gather existing AI project titles to exclude
    const existingTitles = projects.filter(p => p.type === 'ai').map(p => p.title);

    try {
      const res = await fetch(`${API}/projects/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, prompt: prompt, exclude_titles: existingTitles })
      });
      if (!res.ok) throw new Error("Failed to load more projects");
      const data = await res.json();
      setProjects(prev => [...prev, ...(data.projects || [])]);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load more projects: " + (err.message || "Unknown error"));
    } finally {
      setLoadingMore(false);
    }
  };

  const openWorkspace = async (project: any) => {
    setSelectedProject(project);
    setWorkspaceData(null);
    setWorkspaceLoading(true);
    setEnrollStatus("idle");

    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
        // Use strictly the project title to ensure Qdrant hits precise technical scientific terms
        const searchQuery = project.title;
        const res = await fetch(`${API}/feed/${userId}/project-detail?project_description=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
            const data = await res.json();
            setWorkspaceData(data.related);
        }
    } catch (err) {
        console.error("Failed to load workspace data", err);
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

  if (selectedProject) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in slide-in-from-right duration-500 relative z-10">
         <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Blueprints
         </button>

         <div className="p-8 md:p-12 glass-panel rounded-3xl relative overflow-hidden">
             <div className={cn("absolute top-0 left-0 w-full h-2", selectedProject.type === 'ai' ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-blue-400 to-indigo-500")} />
             
             <div className="flex flex-col md:flex-row gap-8 justify-between">
                 <div className="max-w-3xl">
                     <span className={cn("px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border mb-6 inline-flex items-center gap-2", 
                         selectedProject.type === 'ai' ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10" : "border-blue-500/20 text-blue-400 bg-blue-500/10"
                     )}>
                        {selectedProject.type === 'ai' ? <Sparkles className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                        {selectedProject.type === 'ai' ? 'AI Generated Roadmap' : 'Industry Open Source'}
                     </span>
                     <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-4 text-foreground">{selectedProject.title}</h1>
                     {selectedProject.type === 'ai' ? (
                         <div className="space-y-8 mt-8">
                             {selectedProject.problem_statement && (
                                 <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm shadow-black/5 animate-in fade-in duration-500">
                                     <h3 className="text-xl font-serif font-bold text-foreground mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-red-400" /> Problem Statement</h3>
                                     <div className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.problem_statement}</div>
                                 </div>
                             )}
                             
                             {selectedProject.target_audience && (
                                 <div className="animate-in fade-in duration-500 delay-75">
                                     <h3 className="text-lg font-serif font-bold text-foreground mb-2 flex items-center gap-2"><Network className="w-5 h-5 text-indigo-400" /> Target Audience</h3>
                                     <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.target_audience}</div>
                                 </div>
                             )}

                             {selectedProject.proposed_solution && (
                                 <div className="p-6 rounded-3xl bg-card border border-border/60 shadow-sm shadow-black/5 animate-in fade-in duration-500 delay-100">
                                     <h3 className="text-xl font-serif font-bold text-foreground mb-3 flex items-center gap-2"><Code2 className="w-5 h-5 text-blue-400" /> Proposed Solution</h3>
                                     <div className="text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.proposed_solution}</div>
                                 </div>
                             )}

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500 delay-150">
                                 {selectedProject.core_features && Array.isArray(selectedProject.core_features) && (
                                     <div className="p-6 rounded-3xl glass-panel">
                                         <h3 className="text-lg font-serif font-bold text-foreground mb-4">Core Features</h3>
                                         <ul className="space-y-3">
                                             {selectedProject.core_features.map((feat: string, i: number) => (
                                                 <li key={i} className="flex gap-3 text-sm text-foreground/80">
                                                     <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                                     <span className="leading-relaxed">{feat}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}

                                 {selectedProject.tech_stack && Array.isArray(selectedProject.tech_stack) && (
                                     <div className="p-6 rounded-3xl glass-panel">
                                         <h3 className="text-lg font-serif font-bold text-foreground mb-4">Technical Stack Options</h3>
                                         <ul className="space-y-3">
                                             {selectedProject.tech_stack.map((stack: string, i: number) => (
                                                 <li key={i} className="flex gap-3 text-sm text-foreground/80">
                                                     <Terminal className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                                     <span className="leading-relaxed">{stack}</span>
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                 )}
                             </div>

                             {selectedProject.novelty && (
                                 <div className="animate-in fade-in duration-500 delay-200">
                                     <h3 className="text-lg font-serif font-bold text-foreground mb-2 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Engineering Novelty</h3>
                                     <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.novelty}</div>
                                 </div>
                             )}

                             {selectedProject.pitch && (
                                 <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl mt-6 shadow-lg shadow-emerald-500/5 animate-in fade-in duration-500 delay-300">
                                     <h3 className="text-xl font-serif font-bold text-emerald-400 mb-3 flex items-center gap-2"><Flame className="w-6 h-6" /> Why You Need To Build This</h3>
                                     <div className="text-lg text-emerald-300/90 leading-relaxed font-medium whitespace-pre-wrap">{selectedProject.pitch}</div>
                                 </div>
                             )}
                         </div>
                     ) : (
                         <div className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedProject.description}</div>
                     )}
                 </div>
                 <div className="flex flex-col gap-4 shrink-0">
                     <button
                       disabled={enrollStatus !== "idle"}
                       onClick={enrollInProject}
                       className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 justify-center transition-all shadow-lg disabled:cursor-not-allowed ${
                         enrollStatus === "enrolled" || enrollStatus === "already"
                           ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10"
                           : enrollStatus === "failed"
                             ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-red-500/10"
                             : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                       }`}
                     >
                       {enrollStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
                       {enrollStatus === "idle" && <BookmarkPlus className="w-4 h-4" />}
                       {(enrollStatus === "enrolled" || enrollStatus === "already") && <BookmarkCheck className="w-4 h-4" />}
                       {enrollStatus === "failed" && <Zap className="w-4 h-4" />}
                       {enrollStatus === "idle" && "Enroll in Project"}
                       {enrollStatus === "saving" && "Saving..."}
                       {enrollStatus === "enrolled" && "Enrolled ✓"}
                       {enrollStatus === "already" && "Already Enrolled ✓"}
                       {enrollStatus === "failed" && "Failed — Retry"}
                     </button>
                     {selectedProject.type === 'github' && selectedProject.url && (
                        <a href={selectedProject.url} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full border border-border bg-card font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-all">
                            View on GitHub <ArrowRight className="w-4 h-4" />
                        </a>
                     )}
                 </div>
             </div>
             
             <div className="flex flex-wrap items-center gap-6 mt-8 font-medium">
                 <div className="flex items-center gap-2 text-muted-foreground"><Target className="w-5 h-5 text-amber-500" /> Difficulty {selectedProject.difficulty_score}/10</div>
                 <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-5 h-5 text-blue-500" /> Est. {selectedProject.estimated_time || "Variable"}</div>
                 {selectedProject.stars && <div className="flex items-center gap-2 text-muted-foreground text-yellow-500 font-bold">★ {selectedProject.stars.toLocaleString()} Stars</div>}
             </div>
         </div>

         <div className="space-y-12 pb-10">
             <div className="space-y-6">
                 <h2 className="text-2xl font-serif text-foreground flex items-center gap-3"><Terminal className="w-6 h-6 text-primary" /> Project Roadmap</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {selectedProject.roadmap?.map((step: string, i: number) => (
                         <div key={i} className="flex gap-4 p-6 glass-panel rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-display shrink-0 mt-0.5">{i+1}</div>
                           <p className="text-muted-foreground leading-relaxed">{step}</p>
                         </div>
                     ))}
                 </div>
             </div>

             <div className="space-y-6">
                 <h2 className="text-2xl font-serif text-foreground flex items-center gap-3"><Network className="w-6 h-6 text-primary" /> Related Knowledge Ecosystem</h2>
                 {workspaceLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 text-muted-foreground glass-panel rounded-3xl">
                         <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" /> Scanning ArXiv, GitHub, and HackerNews...
                     </div>
                 ) : workspaceData ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Papers */}
                         <div className="flex flex-col gap-4 p-6 glass-panel rounded-3xl">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-2 text-emerald-400"><FileText className="w-5 h-5" /> Research Papers</h3>
                            {workspaceData.papers?.length ? workspaceData.papers.slice(0, 3).map((p: any, idx: number) => (
                               <Link href={`/paper/${p.id}`} key={p.id || idx} className="p-4 rounded-2xl bg-card border border-border hover:border-emerald-500/50 transition-colors group">
                                  <h4 className="font-semibold text-sm group-hover:text-emerald-400 transition-colors line-clamp-2">{p.title}</h4>
                               </Link>
                            )) : <p className="text-muted-foreground text-sm">No papers found.</p>}
                         </div>

                         {/* Github */}
                         <div className="flex flex-col gap-4 p-6 glass-panel rounded-3xl">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-2 text-blue-400"><Terminal className="w-5 h-5" /> Open Source Repos</h3>
                            {workspaceData.repos?.length ? workspaceData.repos.slice(0, 3).map((r: any, idx: number) => (
                               <a href={r.html_url || r.url} target="_blank" rel="noreferrer" key={r.full_name || r.id || idx} className="p-4 rounded-2xl bg-card border border-border hover:border-blue-500/50 transition-colors group">
                                  <h4 className="font-semibold text-sm group-hover:text-blue-400 transition-colors line-clamp-2">{r.full_name || r.title}</h4>
                               </a>
                            )) : <p className="text-muted-foreground text-sm">No repos found.</p>}
                         </div>

                         {/* HN Discussions */}
                         <div className="flex flex-col gap-4 p-6 glass-panel rounded-3xl">
                            <h3 className="text-lg font-medium flex items-center gap-2 mb-2 text-orange-400"><Flame className="w-5 h-5" /> HN Discussions</h3>
                            {workspaceData.stories?.length ? workspaceData.stories.slice(0, 3).map((s: any, idx: number) => (
                               <a href={s.url || s.hn_url} target="_blank" rel="noreferrer" key={s.id || s.url || idx} className="p-4 rounded-2xl bg-card border border-border hover:border-orange-500/50 transition-colors group">
                                  <h4 className="font-semibold text-sm group-hover:text-orange-400 transition-colors line-clamp-2">{s.title}</h4>
                               </a>
                            )) : <p className="text-muted-foreground text-sm">No discussions found.</p>}
                         </div>
                     </div>
                 ) : (
                     <div className="glass-panel p-12 rounded-3xl text-muted-foreground text-center">No related context found.</div>
                 )}
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500 relative z-10">
      
      {/* HEADER / INPUT */}
      <div className="pt-4 border-b border-border/50 pb-12 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight flex items-center gap-4 mb-6">
          <Code2 className="w-10 h-10 md:w-12 md:h-12 text-primary" /> Project Hub
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
          Describe what you want to build. We'll generate custom blueprints and fetch trending industry-level architectures for you to clone.
        </p>

        <div className="w-full max-w-3xl relative group">
           <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="e.g. A real-time chat application using WebSockets with a focus on privacy..."
               className="w-full bg-card/60 backdrop-blur-xl border border-border/60 rounded-3xl p-6 md:p-8 text-lg font-medium text-foreground placeholder:text-muted-foreground/50 resize-none outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-xl shadow-black/5 min-h-[160px]"
           />
           <button 
               onClick={generateProjects}
               disabled={!prompt.trim() || loading}
               className="absolute bottom-6 right-6 p-4 rounded-2xl bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/95 transition-all shadow-lg hover:-translate-y-1 hover:shadow-primary/20"
           >
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
           </button>
        </div>
      </div>

      {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-6">
              <div className="relative">
                 <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                 </div>
              </div>
              <p className="font-display font-medium text-lg uppercase tracking-widest text-primary/80 animate-pulse">Generating Blueprints & Scanning open Source...</p>
          </div>
      )}

      {hasSearched && !loading && (
          <div className="space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
              {error && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 animate-in fade-in duration-300">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Generation Error</p>
                    <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
                  </div>
                  <button onClick={() => { setError(null); generateProjects(); }} className="px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-xs font-bold transition-colors">
                    Retry
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-serif text-foreground">Found <span className="text-primary font-bold">{projects.length}</span> Project Options</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p, i) => (
                      <div key={i} onClick={() => openWorkspace(p)} className="group flex flex-col bg-card border border-border/50 rounded-3xl p-6 md:p-8 cursor-pointer hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                          <div className={cn("absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity", 
                              p.type === 'ai' ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-blue-400 to-indigo-500"
                          )} />
                          
                          <div className="flex items-center justify-between mb-6">
                             <span className={cn("px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full border flex items-center gap-1.5",
                                p.type === 'ai' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/10" : "border-blue-500/20 text-blue-500 bg-blue-500/10"
                             )}>
                                {p.type === 'ai' ? <Sparkles className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                                {p.type === 'ai' ? "AI Blueprint" : "Open Source"}
                             </span>
                             {p.stars && <span className="text-xs font-bold text-yellow-500">★ {p.stars.toLocaleString()}</span>}
                          </div>

                          <h3 className="text-2xl font-serif font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{p.description}</p>
                          {p.proposed_solution && (
                            <p className="text-xs text-foreground/50 leading-relaxed mb-6 flex-1 line-clamp-2 italic border-l-2 border-primary/20 pl-3">{p.proposed_solution}</p>
                          )}
                          {!p.proposed_solution && <div className="flex-1" />}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                              <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-amber-500" /> Lvl {p.difficulty_score}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> {p.estimated_time || "Var"}</span>
                          </div>
                      </div>
                  ))}
              </div>

              {projects.length > 0 && (
                  <div className="flex justify-center pt-10">
                      <button 
                          onClick={loadMoreProjects} 
                          disabled={loadingMore}
                          className="px-8 py-3 rounded-full border border-border bg-card/50 backdrop-blur hover:bg-muted font-medium flex items-center gap-2 transition-all disabled:opacity-50 hover:shadow-lg shadow-black/5"
                      >
                          {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flame className="w-5 h-5 text-orange-500" />}
                          {loadingMore ? "Synthesizing More Ideas..." : "Load More Projects"}
                      </button>
                  </div>
              )}
          </div>
      )}

    </div>
  );
}
