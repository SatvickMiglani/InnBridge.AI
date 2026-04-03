import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  MessageSquare,
  Zap,
} from "lucide-react";

interface FeedCardProps {
  title: string;
  description: string;
  source: "news" | "paper" | "repo" | "discussion";
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  timestamp?: string;
  link?: string;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

const sourceConfig = {
  news: {
    icon: Zap,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    label: "News",
  },
  paper: {
    icon: BookOpen,
    color: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    label: "Paper",
  },
  repo: {
    icon: Code2,
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    label: "Repository",
  },
  discussion: {
    icon: MessageSquare,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    label: "Discussion",
  },
};

const difficultyConfig = {
  beginner: "bg-green-500/20 text-green-300",
  intermediate: "bg-yellow-500/20 text-yellow-300",
  advanced: "bg-red-500/20 text-red-300",
};

export default function FeedCard({
  title,
  description,
  source,
  category,
  difficulty,
  timestamp,
  link,
  stats,
}: FeedCardProps) {
  const config = sourceConfig[source];
  const SourceIcon = config.icon;

  return (
    <div className="neon-card group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${config.color} border`}>
            <SourceIcon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-cyan-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{config.label}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {description}
      </p>

      {/* Tags and Metadata */}
      <div className="flex flex-wrap gap-2 mb-4">
        {category && (
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
            {category}
          </Badge>
        )}
        {difficulty && (
          <Badge className={difficultyConfig[difficulty]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        )}
        {timestamp && (
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        )}
      </div>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-background/50 rounded-lg border border-border">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-sm font-semibold text-cyan-400">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {link && (
        <div className="flex justify-end">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          >
            <a href={link} target="_blank" rel="noopener noreferrer">
              View More
              <ArrowUpRight size={16} />
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
