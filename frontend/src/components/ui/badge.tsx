import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "error" | "purple" | "outline" | "destructive" | "primary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-muted text-muted-foreground border-border",
    success: "bg-[#D1F2E1] text-[#1A7F64] border-[#1A7F64]/20 dark:bg-emerald-500/10 dark:text-emerald-500",
    warning: "bg-[#FFF4D1] text-[#B08500] border-[#B08500]/20 dark:bg-amber-500/10 dark:text-amber-500",
    error: "bg-[#FFEBE9] text-[#DA3633] border-[#DA3633]/20 dark:bg-rose-500/10 dark:text-rose-500",
    purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
    outline: "bg-transparent text-foreground border-border",
    destructive: "bg-destructive text-destructive-foreground border-transparent",
    primary: "bg-primary text-white border-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
