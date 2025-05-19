
import React from "react";
import { ButtonWithGlow } from "@/components/ui/button-with-glow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <div className="relative pt-24 pb-16 md:pb-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern -z-10"></div>
      <div className="absolute top-40 left-0 w-40 h-40 bg-urban-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-60 h-60 bg-violet/5 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Automation.{" "}
              <span className="bg-gradient-to-r from-urban-blue to-violet text-transparent bg-clip-text">Just by talking.</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-gray max-w-md">
              Build workflows and AI agents using natural language. Flo builds it all.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <ButtonWithGlow size="lg">
                <Link to="/builder" className="flex items-center">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </ButtonWithGlow>
              <Button size="lg" variant="outline">
                <Link to="#" className="flex items-center">
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
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
    <div className="bg-gray-50 rounded-lg p-3 flex gap-3 border border-gray-100 hover:border-urban-blue/30 transition-colors">
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
