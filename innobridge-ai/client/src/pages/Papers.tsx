import { useState } from "react";
import { BookOpen, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Papers() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const difficulties = [
    { id: "all", label: "All Levels" },
    { id: "beginner", label: "Beginner" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];

  const papers = [
    {
      id: 1,
      title: "Attention is All You Need",
      authors: "Vaswani et al.",
      abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration.",
      difficulty: "advanced",
      citations: 89234,
      published: "2017",
    },
    {
      id: 2,
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin et al.",
      abstract: "We introduce BERT, a new method of pre-training language representations which obtains state-of-the-art results on a wide array of NLP tasks.",
      difficulty: "advanced",
      citations: 67891,
      published: "2018",
    },
    {
      id: 3,
      title: "GPT-3: Language Models are Few-Shot Learners",
      authors: "Brown et al.",
      abstract: "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task.",
      difficulty: "advanced",
      citations: 45123,
      published: "2020",
    },
    {
      id: 4,
      title: "Vision Transformers: An Image is Worth 16x16 Words",
      authors: "Dosovitskiy et al.",
      abstract: "While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited.",
      difficulty: "intermediate",
      citations: 23456,
      published: "2020",
    },
    {
      id: 5,
      title: "Introduction to Neural Networks",
      authors: "Goodfellow et al.",
      abstract: "Neural networks are a set of algorithms inspired by biological neural networks that constitute animal brains.",
      difficulty: "beginner",
      citations: 12345,
      published: "2016",
    },
  ];

  const filteredPapers = selectedDifficulty === "all"
    ? papers
    : papers.filter(p => p.difficulty === selectedDifficulty);

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
    <DashboardLayout currentPage="papers">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Research Papers
            </h1>
            <p className="text-muted-foreground">
              Latest papers from ArXiv with AI-generated summaries
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Filter size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filter by difficulty:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedDifficulty === diff.id
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Papers List */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredPapers.map((paper, idx) => (
              <div
                key={paper.id}
                className="professional-card p-6 hover:shadow-md transition-all duration-200 animate-slide-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 pt-1">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {paper.authors}
                    </p>
                    <p className="text-muted-foreground text-sm mb-4">
                      {paper.abstract}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(paper.difficulty)}
                  >
                    {paper.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Published: {paper.published}</span>
                    <span>{paper.citations.toLocaleString()} citations</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10"
                  >
                    Read Paper →
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredPapers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No papers found at this difficulty level.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
