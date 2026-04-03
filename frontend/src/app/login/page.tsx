"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API = "http://localhost:8000";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Access Denied: Invalid Credentials");
      }

      localStorage.setItem("user_id", data.data.id);
      localStorage.setItem("user_email", data.data.email);
      localStorage.setItem("user_name", data.data.name);

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-6">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20 ring-1 ring-white/10">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Authorize Access</h1>
          <p className="text-muted-foreground font-medium max-w-xs mx-auto">Sync your workspace with the global engineering intelligence network.</p>
        </div>

        <div className="professional-card p-10 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <ShieldCheck size={80} />
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center uppercase tracking-widest animate-shake">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Engineering Node / Email</label>
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-muted/30 focus:bg-background transition-all"
                        placeholder="identity@innobridge.ai"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Vault Key / Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-muted/30 focus:bg-background transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-bold mt-4 shadow-lg shadow-primary/10 group bg-primary hover:bg-primary/90 text-white"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">Initialize Workspace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                    )}
                </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-border flex flex-col items-center gap-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">New Engineering Node?</p>
                <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-11 font-bold border-border hover:bg-muted group">
                        Create Architecture <Cpu size={14} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                </Link>
            </div>
        </div>
        
        <p className="text-center mt-12 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-30 select-none">
            InnoBridge Intelligence Vault • v1.0.4
        </p>
      </div>
    </div>
  );
}
