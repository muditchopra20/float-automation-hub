
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, User, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";
import { useAgents } from '@/hooks/use-agents';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';


const Agents = () => {
  const { agents, loading, refetch } = useAgents();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Agents</h1>
            <p className="text-neutral-gray mt-1">Create and manage your intelligent AI agents</p>
          </div>
          <CreateAgentDialog onSuccess={refetch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Alert className="my-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You haven't created any agents yet. Create your first agent to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string | null;
    type: 'text_summarizer' | 'data_extractor' | 'research_assistant' | 'custom';
    is_active: boolean | null;
  };
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  // Derive status from is_active
  const status = agent.is_active ? "Active" : "Draft";
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{agent.name}</CardTitle>
          <span 
            className={`text-xs px-2 py-0.5 rounded-full ${
              status === "Active" 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-neutral-gray"
            }`}
          >
            {status}
          </span>
        </div>
        <CardDescription>{agent.description || "No description"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-sm text-neutral-gray">
            <User className="h-4 w-4 mr-1" />
            <span>Personal</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/agents/${agent.id}`}>
              Configure
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Agents;
