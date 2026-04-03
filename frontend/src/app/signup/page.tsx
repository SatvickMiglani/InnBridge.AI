"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowLeft, Check, Sparkles, Target, Cpu, ShieldCheck, Info, Plus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API = "http://localhost:8000";

const DESIGNATIONS = [
  "school student",
  "college student",
  "final year",
  "professional",
  "research aspirant",
];

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [designation, setDesignation] = useState(DESIGNATIONS[1]); // college student
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCustomInterest("");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (password !== confirmPassword) {
        setError("Security Node Mismatch: Passwords do not match.");
        return;
      }
      // Basic strength check (matches backend requirement roughly)
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        setError("Security Compliance Failed: Password does not meet protocol requirements.");
        return;
      }
      setStep(2);
      return;
    }

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
        throw new Error(data.detail || "Authentication sequence failed.");
      }

      localStorage.setItem("user_id", data.data.id);
      localStorage.setItem("user_email", data.data.email);
      localStorage.setItem("user_name", data.data.name);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
      // If it's a backend validation error, maybe drop them back to Step 1 or 2 depending on the error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-6 py-20">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/20 ring-1 ring-white/10">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Join InnoBridge</h1>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">Build your professional identity on the premier architectural knowledge platform.</p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-slide-up">
            <div className={cn("h-1 rounded-full transition-all duration-500", step === 1 ? "bg-primary w-12" : "bg-muted w-4")} />
            <div className={cn("h-1 rounded-full transition-all duration-500", step === 2 ? "bg-primary w-12" : "bg-muted w-4")} />
        </div>

        <div className="professional-card p-10 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles size={80} />
            </div>

            <form onSubmit={handleSignup} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center uppercase tracking-widest animate-shake mb-4">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Identity / Name</label>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-11 bg-muted/30 focus:bg-background transition-all"
                                placeholder="John Doe"
                                autoComplete="name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Contact / Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11 bg-muted/30 focus:bg-background transition-all"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center justify-between">
                                Access Protocol / Password
                                <ShieldCheck size={12} className="text-primary" />
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-11 bg-muted/30 focus:bg-background transition-all"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <div className="p-3 bg-muted/20 border border-border rounded-md mt-2 flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Info size={10} /> Protocol Stability Requirements:</span>
                                <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                                    8+ characters, including at least one uppercase, lowercase, number, and special character.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Verify Protocol / Confirm Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="h-11 bg-muted/30 focus:bg-background transition-all"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 font-bold mt-4 shadow-lg shadow-primary/10 group bg-primary hover:bg-primary/90 text-white"
                        >
                            Next Module <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Domain Designation</label>
                            <select 
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                required
                                className="w-full h-11 px-3 rounded-md border border-border bg-muted/30 focus:bg-background transition-all text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {DESIGNATIONS.map(d => (
                                    <option key={d} value={d} className="bg-background text-foreground uppercase text-xs font-bold">{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Technical Velocity</label>
                            <div className="grid grid-cols-3 gap-2">
                                {SKILL_LEVELS.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setSkillLevel(level)}
                                        className={cn(
                                            "h-9 rounded-sm text-[9px] font-bold uppercase tracking-wider border transition-all",
                                            skillLevel === level
                                                ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Knowledge Nodes / Interests</label>
                            <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                {INTEREST_OPTIONS.map(interest => {
                                    const isSelected = interests.includes(interest);
                                    return (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => toggleInterest(interest)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-md text-[9px] font-bold uppercase border transition-all flex items-center gap-1.5",
                                                isSelected
                                                    ? "bg-primary/5 border-primary text-primary"
                                                    : "bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground"
                                            )}
                                        >
                                            {isSelected && <Check size={10} />}
                                            {interest}
                                        </button>
                                    )
                                })}
                                {/* Custom interests (ones added by user) */}
                                {interests.filter(i => !INTEREST_OPTIONS.includes(i)).map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className="px-3 py-1.5 rounded-md text-[9px] font-bold uppercase border bg-primary text-white border-primary transition-all flex items-center gap-1.5"
                                    >
                                        <X size={10} />
                                        {interest}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Custom Interest Input */}
                            <div className="flex gap-2 pt-1">
                                <Input 
                                    value={customInterest}
                                    onChange={(e) => setCustomInterest(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                                    placeholder="Add custom tech node..."
                                    className="h-9 text-[10px] placeholder:text-[9px] uppercase font-bold tracking-widest bg-muted/10"
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addCustomInterest}
                                    className="h-9 px-3 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                                >
                                    <Plus size={14} />
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="h-12 px-6 font-bold border-border"
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-12 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Authorize Profile Integration"}
                            </Button>
                        </div>
                    </div>
                )}
            </form>

            <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Existing Associate?</p>
                <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full h-11 font-bold text-primary group">
                        Access Neural Vault <ArrowLeft size={14} className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
