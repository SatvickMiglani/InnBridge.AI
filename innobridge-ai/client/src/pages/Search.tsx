import { useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const suggestions = [
    "Machine Learning",
    "Web Development",
    "DevOps",
    "Cloud Computing",
    "Data Science",
  ];

  const searchResults = searchQuery ? [
    {
      id: 1,
      title: "Deep Learning Fundamentals",
      description: "Comprehensive guide to neural networks and deep learning",
      type: "paper",
      source: "ArXiv",
    },
    {
      id: 2,
      title: "TensorFlow Documentation",
      description: "Official TensorFlow guide and API reference",
      type: "repo",
      source: "GitHub",
    },
    {
      id: 3,
      title: "Latest ML Breakthroughs",
      description: "News roundup of recent machine learning advances",
      type: "news",
      source: "TechCrunch",
    },
  ] : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 800);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "paper":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "repo":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "news":
        return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout currentPage="search">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Deep Search
            </h1>
            <p className="text-muted-foreground">
              Semantic search across all sources with AI-powered discovery
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for papers, repositories, news..."
                  className="w-full px-6 py-4 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {isSearching ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <SearchIcon size={20} />
                  )}
                </button>
              </div>
            </form>

            {/* Suggestions */}
            {!searchQuery && (
              <div className="max-w-2xl mx-auto mt-8">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Popular searches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setSearchQuery(suggestion)}
                      className="px-4 py-2 rounded-full bg-card border border-border text-foreground hover:border-primary hover:text-primary transition-all text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Results for "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">
                  Found {searchResults.length} relevant items
                </p>
              </div>

              <div className="space-y-4">
                {searchResults.map((result, idx) => (
                  <div
                    key={result.id}
                    className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {result.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {result.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getTypeColor(result.type)}
                      >
                        {result.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Source: {result.source}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10"
                      >
                        View →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && searchResults.length === 0 && (
          <div className="container mx-auto px-4 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <SearchIcon size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Start searching
              </h3>
              <p className="text-muted-foreground">
                Enter a query to search across all sources with semantic understanding
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
