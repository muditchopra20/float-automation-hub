import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Database, Search, Plus, Settings, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgents } from "@/hooks/use-agents";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const BuilderSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState("agents");
  const { toast } = useToast();
  const { agents, createAgent } = useAgents();
  const { user } = useAuth();

  const handleAgentClick = async (agentName: string, agentType: any) => {
    try {
      await createAgent(agentName, agentType, `Configured ${agentName} for workflow automation`);
      toast({
        title: "Agent Added",
        description: `${agentName} has been added to your workflow canvas.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add agent to workflow",
        variant: "destructive",
      });
    }
  };

  const handleIntegrationToggle = async (integrationName: string, isConnected: boolean) => {
    if (!user) return;

    try {
      if (isConnected) {
        // Disconnect integration
        await supabase
          .from('integrations')
          .update({ status: 'disconnected' })
          .eq('name', integrationName)
          .eq('user_id', user.id);
        
        toast({
          title: "Integration Disconnected",
          description: `${integrationName} has been disconnected.`,
          variant: "destructive",
        });
      } else {
        // Connect integration
        await supabase
          .from('integrations')
          .upsert({
            user_id: user.id,
            name: integrationName,
            type: integrationName.toLowerCase(),
            status: 'connected'
          });
        
        toast({
          title: "Integration Connected",
          description: `${integrationName} has been successfully connected.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
    }
  };

  const handlePromptClick = async (promptTitle: string, prompt: string) => {
    if (!user) return;

    try {
      // Update usage count for the prompt
      await supabase
        .from('prompt_templates')
        .update({ usage_count: supabase.sql`usage_count + 1` })
        .eq('title', promptTitle);

      toast({
        title: "Prompt Used",
        description: `"${promptTitle}" has been applied to the chat.`,
      });
    } catch (error) {
      console.error('Error updating prompt usage:', error);
      toast({
        title: "Prompt Used",
        description: `"${promptTitle}" has been applied to the chat.`,
      });
    }
  };

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
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-gray">
                Reusable AI agents to add to your workflow
              </div>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <AgentCard
              name="Text Summarizer"
              description="Condenses long texts into concise summaries"
              icon={<Bot className="h-4 w-4" />}
              onClick={() => handleAgentClick("Text Summarizer", "text_summarizer")}
            />
            <AgentCard
              name="Data Extractor"
              description="Pulls structured data from emails, PDFs and more"
              icon={<Database className="h-4 w-4" />}
              onClick={() => handleAgentClick("Data Extractor", "data_extractor")}
            />
            <AgentCard
              name="Research Assistant"
              description="Searches and compiles information on a topic"
              icon={<Search className="h-4 w-4" />}
              onClick={() => handleAgentClick("Research Assistant", "research_assistant")}
            />
          </div>
        </TabsContent>
        <TabsContent value="integrations" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="text-sm text-neutral-gray mb-2">
              Connect your favorite apps
            </div>
            <IntegrationCard 
              name="Gmail" 
              connected={true} 
              onToggle={(isConnected) => handleIntegrationToggle("Gmail", isConnected)}
            />
            <IntegrationCard 
              name="Slack" 
              connected={false} 
              onToggle={(isConnected) => handleIntegrationToggle("Slack", isConnected)}
            />
            <IntegrationCard 
              name="Notion" 
              connected={true} 
              onToggle={(isConnected) => handleIntegrationToggle("Notion", isConnected)}
            />
            <IntegrationCard 
              name="Google Sheets" 
              connected={false} 
              onToggle={(isConnected) => handleIntegrationToggle("Google Sheets", isConnected)}
            />
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
              onClick={(title, prompt) => handlePromptClick(title, prompt)}
            />
            <PromptCard
              title="Monitor mentions"
              prompt="Track brand mentions on Twitter and summarize daily"
              onClick={(title, prompt) => handlePromptClick(title, prompt)}
            />
            <PromptCard
              title="Expense approval"
              prompt="Set up an expense approval workflow with manager notifications"
              onClick={(title, prompt) => handlePromptClick(title, prompt)}
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
  onClick: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, icon, onClick }) => {
  return (
    <div 
      className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors hover:bg-gray-50"
      onClick={onClick}
    >
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
  onToggle: (isConnected: boolean) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, connected, onToggle }) => {
  const [isConnected, setIsConnected] = useState(connected);

  const handleClick = () => {
    const newState = !isConnected;
    setIsConnected(newState);
    onToggle(isConnected);
  };

  return (
    <div className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors">
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{name}</div>
        <button
          onClick={handleClick}
          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
            isConnected
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-neutral-gray hover:bg-gray-200"
          }`}
        >
          {isConnected ? (
            <>
              <Check className="h-3 w-3" />
              Connected
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface PromptCardProps {
  title: string;
  prompt: string;
  onClick: (title: string, prompt: string) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ title, prompt, onClick }) => {
  return (
    <div 
      className="border border-gray-100 rounded-md p-3 hover:border-urban-blue cursor-pointer transition-colors hover:bg-gray-50"
      onClick={() => onClick(title, prompt)}
    >
      <div className="font-medium text-sm mb-1">{title}</div>
      <p className="text-xs text-neutral-gray">{prompt}</p>
    </div>
  );
};
