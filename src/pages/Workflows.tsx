
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Copy, Trash2 } from "lucide-react";

const workflows = [
  {
    id: 1,
    name: "Email Categorizer",
    status: "Active",
    lastRun: "10 minutes ago",
    description: "Automatically categorizes incoming emails by content and sender"
  },
  {
    id: 2,
    name: "Customer Support Router",
    status: "Active",
    lastRun: "1 hour ago",
    description: "Routes support tickets to appropriate teams based on content analysis"
  },
  {
    id: 3,
    name: "Invoice Processor",
    status: "Draft",
    lastRun: "Never",
    description: "Extracts data from invoices and adds to accounting spreadsheet"
  },
  {
    id: 4,
    name: "Content Calendar",
    status: "Active",
    lastRun: "2 days ago",
    description: "Generates and schedules social media content from blog posts"
  },
  {
    id: 5,
    name: "Meeting Summarizer",
    status: "Active",
    lastRun: "Yesterday",
    description: "Transcribes and summarizes meeting recordings"
  }
];

const Workflows = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
            <p className="text-muted-foreground mt-1">Manage your automated workflows</p>
          </div>
          <Button className="bg-urban-blue hover:bg-urban-blue/90" asChild>
            <Link to="/builder">
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {workflows.map((workflow) => (
            <WorkflowItem key={workflow.id} workflow={workflow} />
          ))}
        </div>
      </main>
    </div>
  );
};

interface WorkflowItemProps {
  workflow: {
    id: number;
    name: string;
    status: string;
    lastRun: string;
    description: string;
  };
}

const WorkflowItem: React.FC<WorkflowItemProps> = ({ workflow }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-sm dark:shadow-md transition-all hover:shadow-md dark:hover:shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground">{workflow.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                workflow.status === "Active"
                  ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {workflow.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
          <div className="text-xs text-muted-foreground">Last run: {workflow.lastRun}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/builder?workflow=${workflow.id}`}>Open</Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Workflows;
