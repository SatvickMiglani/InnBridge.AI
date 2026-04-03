"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, X, Sun, Moon, Search, Zap, UserCircle, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("Guest");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const protectedPages = ["/profile", "/projects"];

  const navItems = [
    { label: "Home", href: "/", id: "home" },
    { label: "Projects", href: "/projects", id: "projects" },
    { label: "News", href: "/news", id: "news" },
    { label: "Papers", href: "/papers", id: "papers" },
    { label: "Repos", href: "/repos", id: "repos" },
    { label: "Discussions", href: "/discussions", id: "discussions" },
    { label: "Search", href: "/search", id: "search" },
  ];

  useEffect(() => {
    setMounted(true);
    const userId = localStorage.getItem("user_id");
    const storedName = localStorage.getItem("user_name");
    setUserName(storedName || "Guest");

    const isProtected = protectedPages.some(p => pathname?.startsWith(p));
    
    if (!userId && isProtected) {
      router.push("/login");
    } else {
      setIsAuth(true);
    }
  }, [pathname, router]);


  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    router.push("/login");
  };

  if (!mounted) return null;

  if (isAuth === null && !isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthPage) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground animate-fade-in">{children}</div>;
  }

  const currentId = navItems.find(item => item.href === pathname)?.id || (pathname === "/profile" ? "profile" : "");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar/80 backdrop-blur-md border-r border-sidebar-border transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity overflow-hidden">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <div className="text-xl font-semibold text-primary whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                  InnoBridge<span className="text-muted-foreground font-light ml-0.5">.AI</span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-sidebar-accent rounded-md transition-colors"
            >
              <X size={20} className="text-sidebar-foreground" />
            </button>
            <button 
              onClick={toggleCollapse}
              className="hidden lg:flex p-1.5 hover:bg-sidebar-accent rounded-md transition-colors text-sidebar-foreground/60 hover:text-primary"
            >
              <Menu size={16} className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = item.label === "Home" ? Zap : 
                           item.label === "Projects" ? Zap : 
                           item.label === "News" ? Zap : 
                           item.label === "Papers" ? Zap : 
                           item.label === "Repos" ? Zap : 
                           item.label === "Discussions" ? Zap : Search;
              
              // I'll use real icons based on ID later if needed, but for now focus on layout
              return (
                <Link key={item.id} href={item.href} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                      currentId === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : ""}
                  >
                    <div className="shrink-0 flex items-center justify-center w-5 h-5">
                        {item.label === "Home" && <Zap size={18} />}
                        {item.label === "Projects" && <Zap size={18} />}
                        {item.label === "News" && <Zap size={18} />}
                        {item.label === "Papers" && <Zap size={18} />}
                        {item.label === "Repos" && <Zap size={18} />}
                        {item.label === "Discussions" && <Zap size={18} />}
                        {item.label === "Search" && <Search size={18} />}
                    </div>
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link href="/profile" onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                currentId === "profile" ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center px-0"
              )} title={isCollapsed ? "My Profile" : ""}>
                <UserCircle size={18} />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">My Profile</span>}
              </div>
            </Link>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm font-medium",
                  isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            {userName !== "Guest" && (
                <button
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-2 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors text-sm font-medium mt-2",
                        isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? "Sign Out" : ""}
                >
                    <LogOut size={18} />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Sign Out</span>}
                </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Unified Neural Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto relative animate-fade-in bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
