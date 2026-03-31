"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API = "http://localhost:8000";

const SKILL_LEVELS = ["beginner", "intermediate", "advanced"];
const INTEREST_OPTIONS = [
  "Artificial Intelligence", 
  "Computer Vision", 
  "Natural Language Processing", 
  "Web Development", 
  "Mobile Development", 
  "Cloud Computing", 
  "Cybersecurity", 
  "Blockchain", 
  "Data Science"
];

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState("college student");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [interests, setInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(2);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          designation, 
          skill_level: skillLevel, 
          interests 
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      // Auto login after signup
      localStorage.setItem("user_id", data.data.id);
      localStorage.setItem("user_email", data.data.email);
      localStorage.setItem("user_name", data.data.name);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setStep(1); // Go back to fix errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-10 rounded-[2.5rem] glass-panel relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-2xl shadow-primary/5 border-primary/10">
      <div className="flex flex-col items-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
          <Zap className="w-7 h-7 text-white fill-white/20" />
        </div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Join InnoBridge AI</h1>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-sm">Create your technical profile and start receiving precision-filtered research and news.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-10">
        <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", step === 1 ? "bg-primary w-8" : "bg-muted")} />
        <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", step === 2 ? "bg-primary w-8" : "bg-muted")} />
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        {error && <div className="p-4 text-sm bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 text-center font-semibold animate-in shake duration-300">{error}</div>}
        
        {step === 1 ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 px-5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/50"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="button" 
              onClick={() => setStep(2)}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 group shadow-xl shadow-primary/10"
            >
              Next Step <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Professional Designation</label>
              <input 
                type="text" 
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                className="w-full h-12 px-5 bg-muted/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all font-medium"
                placeholder="e.g. Senior Backend Engineer"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Skill Level</label>
              <div className="grid grid-cols-3 gap-3">
                {SKILL_LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSkillLevel(level)}
                    className={cn(
                      "h-11 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                      skillLevel === level 
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                        : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 ml-1">Areas of Interest (Select many)</label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => {
                  const isSelected = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center gap-2",
                        isSelected 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-sm" 
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {interest}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
               <button 
                type="button" 
                onClick={() => setStep(1)}
                className="h-14 px-6 bg-muted border border-border font-bold rounded-2xl transition-all"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/10 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Enrollment"}
              </button>
            </div>
          </div>
        )}
      </form>

      <div className="mt-8 pt-8 border-t border-border/50 flex flex-col items-center gap-2 text-sm text-muted-foreground">
        Already have an account? 
        <Link href="/login" className="text-primary font-bold hover:underline flex items-center gap-1">
          Sign In <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
