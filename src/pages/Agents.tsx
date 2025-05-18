
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const agents = [
  {
    id: 1,
    name: "Email Assistant",
    description: "Helps draft and categorize emails based on context",
    status: "Active"
  },
  {
    id: 2,
    name: "Data Analyzer",
    description: "Analyzes data sets and provides insights",
    status: "Active"
  },
  {
    id: 3,
    name: "Customer Support",
    description: "Handles basic customer inquiries and routes complex issues",
    status: "Draft"
  },
  {
    id: 4,
    name: "Content Creator",
    description: "Generates blog posts and social media content",
    status: "Active"
  }
];

const Agents = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Agents</h1>
            <p className="text-neutral-gray mt-1">Create and manage your intelligent AI agents</p>
          </div>
          <Button className="bg-urban-blue hover:bg-urban-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </main>
    </div>
  );
};

interface AgentCardProps {
  agent: {
    id: number;
    name: string;
    description: string;
    status: string;
  };
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{agent.name}</CardTitle>
          <span 
            className={`text-xs px-2 py-0.5 rounded-full ${
              agent.status === "Active" 
                ? "bg-green-100 text-green-700" 
                : "bg-gray-100 text-neutral-gray"
            }`}
          >
            {agent.status}
          </span>
        </div>
        <CardDescription>{agent.description}</CardDescription>
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
