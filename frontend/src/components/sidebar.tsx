"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, FileText, Code2, Flame, Info, Zap, Sparkles, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/projects", label: "Projects", icon: Sparkles },
  { href: "/news", label: "Trending News", icon: Newspaper },
  { href: "/papers", label: "Research", icon: FileText },
  { href: "/repos", label: "GitHub", icon: Code2 },
  { href: "/discussions", label: "Developer Pulse", icon: Flame },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border glass-panel h-screen sticky top-0 flex flex-col pt-6 hidden md:flex">
      <Link href="/" className="flex items-center gap-3 px-6 mb-8 mt-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight">
          InnoBridge <span className="text-primary">AI</span>
        </span>
      </Link>

      <nav className="flex-1 px-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border space-y-1.5">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
            pathname === "/profile"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <UserCircle className={cn("w-[18px] h-[18px] transition-colors", pathname === "/profile" ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          My Profile
        </Link>
        <Link
          href="/about"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
            pathname === "/about"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Info className="w-[18px] h-[18px] transition-colors" />
          About App
        </Link>
      </div>
    </aside>
  );
}
