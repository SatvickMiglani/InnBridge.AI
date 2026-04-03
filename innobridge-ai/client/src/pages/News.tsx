import { useState } from "react";
import { Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All News" },
    { id: "ai", label: "AI/LLM" },
    { id: "web", label: "Web Development" },
    { id: "devops", label: "DevOps" },
    { id: "security", label: "Security" },
    { id: "ml", label: "Machine Learning" },
  ];

  const newsItems = [
    {
      id: 1,
      title: "OpenAI Releases GPT-5 with Improved Reasoning",
      description: "New model shows significant improvements in complex problem-solving and code generation capabilities.",
      category: "ai",
      source: "TechCrunch",
      timestamp: "2 hours ago",
      difficulty: "intermediate",
    },
    {
      id: 2,
      title: "Kubernetes 1.30 Brings Major Performance Improvements",
      description: "Latest release focuses on scalability and resource optimization for large-scale deployments.",
      category: "devops",
      source: "The New Stack",
      timestamp: "4 hours ago",
      difficulty: "advanced",
    },
    {
      id: 3,
      title: "React 19 Stable Release Available",
      description: "New features include improved server components and better performance optimizations.",
      category: "web",
      source: "React Blog",
      timestamp: "6 hours ago",
      difficulty: "intermediate",
    },
    {
      id: 4,
      title: "Critical Security Vulnerability in Popular Library",
      description: "Developers urged to update immediately to patch critical remote code execution flaw.",
      category: "security",
      source: "Security Advisory",
      timestamp: "8 hours ago",
      difficulty: "advanced",
    },
    {
      id: 5,
      title: "New Transformer Architecture Achieves State-of-the-Art Results",
      description: "Research team publishes breakthrough in efficient attention mechanisms.",
      category: "ml",
      source: "ArXiv",
      timestamp: "10 hours ago",
      difficulty: "advanced",
    },
  ];

  const filteredNews = selectedCategory === "all" 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "advanced":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout currentPage="news">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Technical News
            </h1>
            <p className="text-muted-foreground">
              Latest developments in AI, research, and technology
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredNews.map((item, idx) => (
              <div
                key={item.id}
                className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {item.description}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(item.difficulty)}
                  >
                    {item.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-muted text-foreground font-medium">
                      {item.category.toUpperCase()}
                    </span>
                    <span>{item.source}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    Read More →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
