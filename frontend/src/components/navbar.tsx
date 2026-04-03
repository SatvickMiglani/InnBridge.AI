"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, Activity } from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [nodeId, setNodeId] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setNodeId(`0x${Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`);

    const updateDateTime = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).toUpperCase()
      );
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("user_name") || "Guest");
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur-xl sticky top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-center px-6 transition-all duration-500">
      {/* Left Section - Mobile Menu & Node Metadata */}
      <div className="flex items-center gap-6 overflow-hidden">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-muted rounded-xl transition-colors border border-border/40 flex-shrink-0"
        >
          <Menu size={18} className="text-foreground" />
        </button>

        <div className="hidden lg:flex flex-col gap-0.5 pointer-events-none select-none overflow-hidden text-nowrap">
          <div className="flex items-center gap-2 text-[13px] font-mono text-primary/80 uppercase tracking-widest leading-none">
            <span className="opacity-60">NW-NODE:</span>
            <span className="font-bold">{nodeId}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em] leading-none mt-0.5">
            <span>DISCO_LATENCY:</span>
            <span className="text-primary/50">12MS</span>
          </div>
        </div>
      </div>

      {/* Center Section - The Neural Pulsar */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-5 px-6 h-16 rounded-none bg-primary/5 border-x border-primary/30 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,197,94,0.06)] group transition-all duration-500 hover:border-primary/50 hover:bg-primary/10">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-[0.25em] uppercase">
            <div className="relative">
              <span className="block w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="absolute inset-0 block w-2 h-2 rounded-full bg-primary animate-ping opacity-40" />
            </div>
            <span className="hidden sm:inline">Discovery Active</span>
            <span className="sm:hidden">Live</span>
          </div>

          <div className="h-5 w-px bg-primary/20" />

          <div className="flex items-center gap-4 font-mono">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold tracking-[0.12em] text-foreground tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] leading-none">
                {timeStr}
              </span>
              <span className="text-[9px] font-bold text-primary/40 tracking-[0.35em] mt-0.5 uppercase">Mission_Time</span>
            </div>

            <div className="h-5 w-px bg-primary/10 hidden md:block" />

            <div className="hidden md:flex flex-col items-center text-center">
              <span className="text-xs font-bold text-foreground/90 tracking-widest uppercase leading-none">
                {dateStr}
              </span>
              <span className="text-[9px] font-bold text-primary/40 tracking-[0.35em] mt-0.5 uppercase">Sync_Proto</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Hub & Profile */}
      <div className="flex items-center justify-end gap-3 overflow-hidden">
        {userName === "Guest" ? (
          <Link href="/login" className="flex-shrink-0">
            <Button size="sm" variant="outline" className="font-bold border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 rounded-xl h-10 px-6 text-[13px] tracking-widest">
              HUB_LOGIN
            </Button>
          </Link>
        ) : (
          <Link href="/profile" className="flex-shrink-0 group/user">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-muted/50 transition-all border border-border/50 hover:border-primary/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/user:border-primary/40 transition-colors">
                <Activity size={15} className="text-primary/80" />
              </div>
              <span className="text-[13px] font-mono font-bold text-foreground/90 uppercase tracking-widest hidden md:inline truncate max-w-[140px]">
                {userName}
              </span>
            </div>
          </Link>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}