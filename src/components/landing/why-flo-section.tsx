
import React from "react";
import { Bot, MessageSquare, Database, Search } from "lucide-react";

export const WhyFloSection: React.FC = () => {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Flo</h2>
          <p className="text-neutral-gray text-lg max-w-xl mx-auto">
            Flo AI is designed to make automation accessible to everyone, from
            technical experts to complete beginners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Bot className="h-6 w-6 text-urban-blue" />}
            title="Smart AI Agents"
            description="Create reusable AI agents that learn from your data and improve over time."
          />
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6 text-violet" />}
            title="Chat-first UX"
            description="Build and edit workflows through natural conversations, not complex interfaces."
          />
          <FeatureCard
            icon={<Database className="h-6 w-6 text-green-500" />}
            title="Instant Integrations"
            description="Connect with your favorite apps and services in seconds, no API keys needed."
          />
          <FeatureCard
            icon={<Search className="h-6 w-6 text-amber-500" />}
            title="Reusable Logic Blocks"
            description="Save and reuse common workflow patterns across your automation projects."
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
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="floating-card p-6">
      <div className="bg-gray-50 p-3 rounded-lg w-fit mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-neutral-gray text-sm">{description}</p>
    </div>
  );
};
