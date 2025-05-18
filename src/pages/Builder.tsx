
import React, { useState } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { WorkflowCard } from "@/components/builder/workflow-card";
import { ChatInput } from "@/components/builder/chat-input";

interface WorkflowStep {
  step: number;
  app: string;
  action: string;
}

const Builder = () => {
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([
    {
      step: 1,
      app: "Gmail",
      action: "Monitor inbox for emails with subject containing 'Invoice'",
    },
    {
      step: 2,
      app: "Flo AI",
      action: "Extract invoice number, amount, and due date from email body",
    },
    {
      step: 3,
      app: "Google Sheets",
      action: "Add extracted data to 'Invoices' spreadsheet",
    },
  ]);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);
    // In a real app, you'd process this with AI and update the workflow
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row pt-16">
        <div className="hidden md:block">
          <BuilderSidebar />
        </div>
        <div className="flex-1 bg-gray-50 flex flex-col">
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Current Workflow</h1>
              {workflow.map((step) => (
                <WorkflowCard
                  key={step.step}
                  step={step.step}
                  app={step.app}
                  action={step.action}
                />
              ))}
            </div>
          </div>
          <ChatInput onSend={handleSendMessage} />
        </div>
      </main>
    </div>
  );
};

export default Builder;
