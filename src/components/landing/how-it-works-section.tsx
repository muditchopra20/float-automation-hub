
import React from "react";
import { MessageSquare, Zap, Play } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  return (
    <div className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-neutral-gray text-lg max-w-xl mx-auto">
            Building workflows with Flo AI is as simple as having a conversation.
            Just describe what you need, and we'll handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            step={1}
            title="Type a prompt"
            description="Describe what you want to automate in natural language, just like chatting with a colleague."
            icon={<MessageSquare className="h-6 w-6 text-urban-blue" />}
          />
          <StepCard
            step={2}
            title="Flo builds it"
            description="Our AI instantly creates your workflow, connecting apps and adding logic blocks where needed."
            icon={<Zap className="h-6 w-6 text-violet" />}
          />
          <StepCard
            step={3}
            title="You run or save it"
            description="Execute your workflow immediately or save it to run later, on a schedule, or triggered by events."
            icon={<Play className="h-6 w-6 text-green-500" />}
          />
        </div>
      </div>
    </div>
  );
};

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, icon }) => {
  return (
    <div className="floating-card p-6 animate-pulse-glow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {step}
        </div>
        <div className="bg-gray-100 p-2 rounded-md">{icon}</div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-neutral-gray">{description}</p>
    </div>
  );
};
