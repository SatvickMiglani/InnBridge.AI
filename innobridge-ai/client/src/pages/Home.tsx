import { useState } from "react";
import { Search, Sparkles, Zap, Code2, BookOpen, Github } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const feedItems = [
    {
      id: 1,
      title: "Attention is All You Need: Transformers Explained",
      description: "Deep dive into the architecture that powers modern AI systems",
      source: "paper",
      category: "AI/ML",
      timestamp: "2 hours ago",
      difficulty: "advanced",
    },
    {
      id: 2,
      title: "Next.js 15 Released with New Features",
      description: "Latest updates to the React framework with improved performance",
      source: "news",
      category: "Web Development",
      timestamp: "4 hours ago",
      difficulty: "intermediate",
    },
    {
      id: 3,
      title: "LangChain: Building with LLMs",
      description: "Popular framework for developing applications with language models",
      source: "repo",
      category: "AI/ML",
      timestamp: "6 hours ago",
      difficulty: "intermediate",
    },
    {
      id: 4,
      title: "Rust Performance Optimization Guide",
      description: "Best practices for writing efficient Rust code",
      source: "discussion",
      category: "Systems Programming",
      timestamp: "8 hours ago",
      difficulty: "advanced",
    },
  ];

  const features = [
    {
      icon: "🔍",
      title: "Semantic Search",
      description: "Find exactly what you need with AI-powered semantic understanding",
    },
    {
      icon: "📊",
      title: "Personalized Feed",
      description: "Content tailored to your interests and skill level",
    },
    {
      icon: "⚡",
      title: "Real-time Updates",
      description: "Stay current with the latest innovations and research",
    },
    {
      icon: "🏗️",
      title: "Project Blueprints",
      description: "Instant specifications with suggested tech stacks",
    },
  ];

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
    <DashboardLayout currentPage="home">
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section
          className="relative py-20 px-4 overflow-hidden"
          style={{
            backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/310519663501655055/mu38SLekv6j4Em5pzzQMwk/hero-professional-${
              document.documentElement.classList.contains("dark")
                ? "dark"
                : "light"
            }-djXYNNee3JqExGFKtigVAn.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/40" />

          <div className="relative container mx-auto max-w-4xl text-center">
            <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-medium text-primary flex items-center gap-2">
                <Sparkles size={16} />
                Your Innovation Pulse
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
              Discover Technical Innovation
              <br />
              <span className="text-primary">in Real-Time</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay ahead with AI-powered aggregation of trending research, code, and discussions. Personalized to your interests and expertise level.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Explore Pulse Feed
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-muted"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold text-foreground mb-12 text-center">
              Powerful Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="professional-card p-6 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pulse Feed Preview */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-12">
              <h2 className="text-3xl font-semibold text-foreground mb-2">
                Your Pulse Feed
              </h2>
              <p className="text-muted-foreground">
                Curated innovations tailored to your interests and expertise level
              </p>
            </div>

            <div className="space-y-4">
              {feedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {item.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={getDifficultyColor(item.difficulty)}
                        >
                          {item.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="px-2 py-1 rounded bg-muted text-foreground">
                          {item.category}
                        </span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {item.source === "paper" && (
                        <BookOpen size={20} className="text-primary" />
                      )}
                      {item.source === "news" && (
                        <Zap size={20} className="text-primary" />
                      )}
                      {item.source === "repo" && (
                        <Github size={20} className="text-primary" />
                      )}
                      {item.source === "discussion" && (
                        <Code2 size={20} className="text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-muted"
              >
                View Full Feed
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Ready to Stay Ahead?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start discovering technical innovations tailored to your interests today.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Get Started
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
