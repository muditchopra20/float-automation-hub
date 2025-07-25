
import React from "react";
import { Bot, MessageSquare, Database, Search } from "lucide-react";

export const WhyFloSection: React.FC = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/95 relative overflow-hidden transition-colors">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-mint/20 dark:bg-urban-blue/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet/10 dark:bg-violet/10 rounded-full blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Why Flo</h2>
          <p className="text-neutral-gray text-lg max-w-xl mx-auto dark:text-gray-400">
            Flo AI is designed to make automation accessible to everyone, from
            technical experts to complete beginners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Bot className="h-6 w-6 text-urban-blue" />}
            title="Smart AI Agents"
            description="Create reusable AI agents that learn from your data and improve over time."
            delay={0.1}
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6 text-violet" />}
            title="Chat-first UX"
            description="Build and edit workflows through natural conversations, not complex interfaces."
            delay={0.2}
          />
          <FeatureCard
            icon={<Database className="h-6 w-6 text-green-500" />}
            title="Instant Integrations"
            description="Connect with your favorite apps and services in seconds, no API keys needed."
            delay={0.3}
          />
          <FeatureCard
            icon={<Search className="h-6 w-6 text-amber-500" />}
            title="Reusable Logic Blocks"
            description="Save and reuse common workflow patterns across your automation projects."
            delay={0.4}
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  return (
    <div 
      className="floating-card p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in dark:hover:shadow-xl dark:hover:shadow-black/20 dark:card-highlight" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg w-fit mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2 dark:text-white">{title}</h3>
      <p className="text-neutral-gray text-sm">{description}</p>
    </div>
  );
};
