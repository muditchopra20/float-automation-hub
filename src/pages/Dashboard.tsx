
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Bot, Workflow, Zap, BarChart3 } from "lucide-react";
import { useWorkflows } from "@/hooks/use-workflows";
import { useAgents } from "@/hooks/use-agents";

const Dashboard = () => {
  const { workflows, loading: workflowsLoading } = useWorkflows();
  const { agents, loading: agentsLoading } = useAgents();

  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.last_run_at ? 1 : 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-neutral-gray mt-1">Welcome back to your automation hub</p>
          </div>
          <Button className="bg-urban-blue hover:bg-urban-blue/90" asChild>
            <Link to="/builder">
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowsLoading ? '...' : workflows.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeWorkflows} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agentsLoading ? '...' : agents.length}</div>
              <p className="text-xs text-muted-foreground">
                Ready to automate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExecutions}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>Your latest automation workflows</CardDescription>
            </CardHeader>
            <CardContent>
              {workflowsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : workflows.length > 0 ? (
                <div className="space-y-4">
                  {workflows.slice(0, 5).map(workflow => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        workflow.status === 'active' ? 'bg-green-100 text-green-700' : 
                        workflow.status === 'draft' ? 'bg-gray-100 text-gray-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No workflows yet</p>
                  <Button className="mt-4" asChild>
                    <Link to="/builder">Create Your First Workflow</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Agents</CardTitle>
              <CardDescription>Your intelligent automation assistants</CardDescription>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.slice(0, 5).map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{agent.name}</h4>
                        <p className="text-sm text-gray-600">{agent.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        agent.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No agents configured</p>
                  <Button className="mt-4" asChild>
                    <Link to="/agents">Configure Agents</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
