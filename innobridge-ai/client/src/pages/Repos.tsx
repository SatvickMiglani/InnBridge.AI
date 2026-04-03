import { useState } from "react";
import { Github, Star, GitFork, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function Repos() {
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const languages = [
    { id: "all", label: "All Languages" },
    { id: "python", label: "Python" },
    { id: "javascript", label: "JavaScript" },
    { id: "rust", label: "Rust" },
    { id: "go", label: "Go" },
    { id: "typescript", label: "TypeScript" },
  ];

  const repos = [
    {
      id: 1,
      name: "LangChain",
      description: "Building applications with LLMs through composability",
      language: "python",
      stars: 89234,
      forks: 14567,
      owner: "langchain-ai",
    },
    {
      id: 2,
      name: "Next.js",
      description: "The React framework for production",
      language: "typescript",
      stars: 123456,
      forks: 28901,
      owner: "vercel",
    },
    {
      id: 3,
      name: "Rust",
      description: "A systems programming language that runs blazingly fast",
      language: "rust",
      stars: 98765,
      forks: 13456,
      owner: "rust-lang",
    },
    {
      id: 4,
      name: "TensorFlow",
      description: "An Open Source Machine Learning Framework",
      language: "python",
      stars: 185234,
      forks: 74123,
      owner: "tensorflow",
    },
    {
      id: 5,
      name: "Go",
      description: "The Go programming language",
      language: "go",
      stars: 123456,
      forks: 18234,
      owner: "golang",
    },
  ];

  const filteredRepos = selectedLanguage === "all"
    ? repos
    : repos.filter(r => r.language === selectedLanguage);

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      python: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      javascript: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      typescript: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      rust: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      go: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    };
    return colors[language] || "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <DashboardLayout currentPage="repos">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              GitHub Repositories
            </h1>
            <p className="text-muted-foreground">
              Trending open-source projects and tools
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by language:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedLanguage === lang.id
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Repos List */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredRepos.map((repo, idx) => (
              <div
                key={repo.id}
                className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 pt-1">
                    <Github size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {repo.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLanguageColor(repo.language)}`}>
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {repo.owner}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {repo.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-yellow-500" />
                      <span>{repo.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitFork size={16} className="text-muted-foreground" />
                      <span>{repo.forks.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    View on GitHub →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredRepos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No repositories found in this language.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
