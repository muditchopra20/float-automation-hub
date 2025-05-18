
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Database, Search } from "lucide-react";

export const BuilderSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState("agents");

  return (
    <div className="w-64 border-r border-gray-100 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="font-medium">Flo Builder</h2>
      </div>
      <Tabs
        defaultValue="agents"
        className="flex-1 flex flex-col"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 p-2">
          <TabsTrigger value="agents" className="text-xs">
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs">
            Integrations
          </TabsTrigger>
          <TabsTrigger value="prompts" className="text-xs">
            Prompts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="agents" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-sm text-neutral-gray mb-2">
              Reusable AI agents to add to your workflow
            </div>
            <AgentCard
              name="Text Summarizer"
              description="Condenses long texts into concise summaries"
              icon={<Bot className="h-4 w-4" />}
            />
            <AgentCard
              name="Data Extractor"
              description="Pulls structured data from emails, PDFs and more"
              icon={<Database className="h-4 w-4" />}
            />
            <AgentCard
              name="Research Assistant"
              description="Searches and compiles information on a topic"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </TabsContent>
        <TabsContent value="integrations" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-sm text-neutral-gray mb-2">
              Connect your favorite apps
            </div>
            <IntegrationCard name="Gmail" connected={true} />
            <IntegrationCard name="Slack" connected={false} />
            <IntegrationCard name="Notion" connected={true} />
            <IntegrationCard name="Google Sheets" connected={false} />
          </div>
        </TabsContent>
        <TabsContent value="prompts" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-sm text-neutral-gray mb-2">
              Prompt templates to get started
            </div>
            <PromptCard
              title="Schedule social posts"
              prompt="Create a workflow to schedule social media posts from a Google Sheet"
            />
            <PromptCard
              title="Monitor mentions"
              prompt="Track brand mentions on Twitter and summarize daily"
            />
            <PromptCard
              title="Expense approval"
              prompt="Set up an expense approval workflow with manager notifications"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AgentCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, icon }) => {
  return (
    <div className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-gray-100 p-1.5 rounded-md">{icon}</div>
        <div className="font-medium text-sm">{name}</div>
      </div>
      <p className="text-xs text-neutral-gray">{description}</p>
    </div>
  );
};

interface IntegrationCardProps {
  name: string;
  connected: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, connected }) => {
  return (
    <div className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{name}</div>
        <div
          className={`text-xs px-2 py-0.5 rounded-full ${
            connected
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-neutral-gray"
          }`}
        >
          {connected ? "Connected" : "Connect"}
        </div>
      </div>
    </div>
  );
};

interface PromptCardProps {
  title: string;
  prompt: string;
}

const PromptCard: React.FC<PromptCardProps> = ({ title, prompt }) => {
  return (
    <div className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors">
      <div className="font-medium text-sm mb-1">{title}</div>
      <p className="text-xs text-neutral-gray">{prompt}</p>
    </div>
  );
};
