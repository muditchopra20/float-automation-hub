
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Plus, Workflow, Bot, Database } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-neutral-gray mt-1">Welcome back to Flo AI</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/builder">
                <Plus className="mr-2 h-4 w-4" />
                New Workflow
              </Link>
            </Button>
            <Button className="bg-urban-blue hover:bg-urban-blue/90" asChild>
              <Link to="/builder">
                <Bot className="mr-2 h-4 w-4" />
                New AI Agent
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Active Workflows"
            value="5"
            icon={<Workflow className="h-5 w-5 text-urban-blue" />}
          />
          <StatsCard
            title="AI Agents"
            value="3"
            icon={<Bot className="h-5 w-5 text-violet" />}
          />
          <StatsCard
            title="Integrations"
            value="7"
            icon={<Database className="h-5 w-5 text-green-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Workflows</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/workflows">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              <WorkflowItem
                name="Email Categorizer"
                status="Active"
                lastRun="10 minutes ago"
              />
              <WorkflowItem
                name="Customer Support Router"
                status="Active"
                lastRun="1 hour ago"
              />
              <WorkflowItem
                name="Invoice Processor"
                status="Draft"
                lastRun="Never"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Agents</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/agents">View All</Link>
              </Button>
            </div>
            <div className="space-y-4">
              <AgentItem
                name="Text Summarizer"
                workflows={3}
                description="Summarizes text content"
              />
              <AgentItem
                name="Data Extractor"
                workflows={2}
                description="Extracts structured data"
              />
              <AgentItem
                name="Email Classifier"
                workflows={1}
                description="Categorizes emails by intent"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-gray">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

interface WorkflowItemProps {
  name: string;
  status: "Active" | "Draft";
  lastRun: string;
}

const WorkflowItem: React.FC<WorkflowItemProps> = ({ name, status, lastRun }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-neutral-gray">Last run: {lastRun}</div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-neutral-gray"
          }`}
        >
          {status}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/builder">Open</Link>
        </Button>
      </div>
    </div>
  );
};

interface AgentItemProps {
  name: string;
  workflows: number;
  description: string;
}

const AgentItem: React.FC<AgentItemProps> = ({ name, workflows, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-neutral-gray">{description}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs px-2 py-1 bg-gray-100 text-neutral-gray rounded-full">
          {workflows} workflow{workflows !== 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/builder">Edit</Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
