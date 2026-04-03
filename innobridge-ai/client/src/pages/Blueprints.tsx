import { useState } from "react";
import { Code2, Zap, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Blueprints() {
  const [selectedBlueprint, setSelectedBlueprint] = useState<typeof blueprints[0] | null>(null);

  const blueprints = [
    {
      id: 1,
      title: "AI Chatbot Platform",
      description: "Build a conversational AI system with real-time interactions",
      difficulty: "advanced",
      summary: "A full-stack chatbot platform using LLMs, vector databases, and real-time WebSocket connections for seamless conversations.",
      techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Qdrant", "OpenAI API"],
      features: [
        "Real-time chat interface with WebSocket support",
        "Vector-based semantic search for context retrieval",
        "Multi-user support with authentication",
        "Conversation history and analytics",
        "Custom model fine-tuning capabilities",
      ],
    },
    {
      id: 2,
      title: "Data Pipeline & Analytics",
      description: "ETL system for processing and analyzing large datasets",
      difficulty: "intermediate",
      summary: "Scalable data pipeline for ingesting, transforming, and analyzing data with real-time dashboards.",
      techStack: ["Python", "Apache Airflow", "PostgreSQL", "Grafana", "Docker", "Kubernetes"],
      features: [
        "Automated ETL workflows with Airflow",
        "Real-time data ingestion from multiple sources",
        "Data quality checks and validation",
        "Interactive dashboards with Grafana",
        "Scalable infrastructure with Kubernetes",
      ],
    },
    {
      id: 3,
      title: "Mobile App MVP",
      description: "Rapid prototype for iOS and Android applications",
      difficulty: "intermediate",
      summary: "Cross-platform mobile application with offline support and cloud synchronization.",
      techStack: ["React Native", "TypeScript", "Firebase", "Redux", "Expo"],
      features: [
        "Cross-platform iOS and Android support",
        "Offline-first architecture with local storage",
        "Cloud synchronization with Firebase",
        "Push notifications",
        "Analytics and crash reporting",
      ],
    },
    {
      id: 4,
      title: "Microservices Architecture",
      description: "Scalable backend system with independent services",
      difficulty: "advanced",
      summary: "Production-ready microservices with service mesh, API gateway, and distributed tracing.",
      techStack: ["Go", "Kubernetes", "Istio", "gRPC", "PostgreSQL", "Redis"],
      features: [
        "Service-to-service communication with gRPC",
        "API Gateway for request routing",
        "Service mesh with Istio for traffic management",
        "Distributed tracing with Jaeger",
        "Horizontal scaling and auto-recovery",
      ],
    },
    {
      id: 5,
      title: "Static Website",
      description: "Fast, SEO-optimized website with minimal infrastructure",
      difficulty: "beginner",
      summary: "Modern static site with excellent performance and SEO optimization.",
      techStack: ["Next.js", "React", "Tailwind CSS", "Vercel", "MDX"],
      features: [
        "Static site generation for performance",
        "SEO optimization with meta tags",
        "Responsive design with Tailwind CSS",
        "Markdown content support",
        "One-click deployment to Vercel",
      ],
    },
  ];

  return (
    <DashboardLayout currentPage="blueprints">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-semibold text-foreground mb-2">
              Project Blueprints
            </h1>
            <p className="text-muted-foreground">
              Instant project specifications with suggested tech stacks
            </p>
          </div>
        </div>

        {/* Blueprints Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map((blueprint, idx) => (
              <div
                key={blueprint.id}
                className="professional-card p-6 hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` }}
                onClick={() => setSelectedBlueprint(blueprint)}
              >
                <div className="flex items-start justify-between mb-4">
                  <Code2 size={24} className="text-primary" />
                  <Badge
                    variant="secondary"
                    className={
                      blueprint.difficulty === "beginner"
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : blueprint.difficulty === "intermediate"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    }
                  >
                    {blueprint.difficulty}
                  </Badge>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {blueprint.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {blueprint.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {blueprint.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 rounded text-xs bg-muted text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                  {blueprint.techStack.length > 3 && (
                    <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                      +{blueprint.techStack.length - 3} more
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedBlueprint(blueprint)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-primary hover:bg-primary/10"
                >
                  View Details →
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {selectedBlueprint && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-card">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {selectedBlueprint.title}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {selectedBlueprint.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBlueprint(null)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap size={20} className="text-primary" />
                    One-Minute Summary
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedBlueprint.summary}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Code2 size={20} className="text-primary" />
                    Suggested Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlueprint.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-muted text-foreground"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {selectedBlueprint.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="flex gap-3 pt-6 border-t border-border">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  >
                    Start Project
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-border hover:bg-muted"
                    onClick={() => setSelectedBlueprint(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
