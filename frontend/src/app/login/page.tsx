"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

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
        throw new Error(data.detail || "Invalid credentials");
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
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl glass-panel relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">Enter your details to access your personalized feed</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && <div className="p-3 text-sm bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-center font-medium">{error}</div>}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-11 px-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            placeholder="you@example.com"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-11 px-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border flex flex-col items-center gap-2 text-sm text-muted-foreground">
        Don't have an account? 
        <Link href="/signup" className="text-primary font-medium hover:underline flex items-center gap-1">
          Create an account <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
