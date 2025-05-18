
import React from "react";
import { ButtonWithGlow } from "@/components/ui/button-with-glow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { WorkflowCard } from "@/components/builder/workflow-card";

export const HeroSection: React.FC = () => {
  return (
    <div className="pt-24 pb-16 md:pb-24">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Automation.{" "}
              <span className="gradient-text">Just by talking.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray max-w-md">
              Build workflows and AI agents using natural language. Flo builds it all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <ButtonWithGlow size="lg" asChild>
                <Link to="/builder">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </ButtonWithGlow>
              <Button size="lg" variant="outline" asChild>
                <Link to="#">Watch Demo</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-urban-blue/10 to-violet/10 rounded-2xl -z-10"></div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg p-6 animate-float">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Prompt</h3>
                <p className="text-sm text-gray-600">
                  "Create a workflow that sends me a daily summary of new feature requests from our feedback form and adds them to Notion."
                </p>
              </div>
              <div className="space-y-3">
                <HeroWorkflowCard
                  number={1}
                  app="Gmail"
                  action="Monitor responses from feedback@company.com"
                />
                <HeroWorkflowCard
                  number={2}
                  app="Flo AI"
                  action="Extract feature requests and summarize"
                />
                <HeroWorkflowCard
                  number={3}
                  app="Notion"
                  action="Add to 'Feature Requests' database"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 grid-pattern -z-10"></div>
    </div>
  );
};

// Create a separate component to prevent naming conflicts with the imported WorkflowCard
const HeroWorkflowCard: React.FC<{
  number: number;
  app: string;
  action: string;
}> = ({ number, app, action }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex gap-3 border border-gray-100">
      <div className="w-6 h-6 bg-urban-blue rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
        {number}
      </div>
      <div>
        <div className="text-xs font-medium text-urban-blue">{app}</div>
        <div className="text-sm text-gray-700">{action}</div>
      </div>
    </div>
  );
};
