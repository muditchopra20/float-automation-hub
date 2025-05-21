
import React, { useState } from "react";
import { ChatInput } from "@/components/builder/chat-input";
import { WorkflowCard } from "@/components/builder/workflow-card";

export const ChatboxPreview: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [workflow, setWorkflow] = useState([
    {
      step: 1,
      app: "Slack",
      action: "Monitor #customer-support channel for new messages",
    },
  ]);

  const handleSendMessage = (message: string) => {
    setMessages((prev) => [...prev, message]);
    
    // Simulate AI response by adding workflow steps
    setTimeout(() => {
      if (workflow.length === 1) {
        setWorkflow((prev) => [
          ...prev,
          {
            step: 2,
            app: "Flo AI",
            action: "Classify message intent and sentiment",
          },
        ]);
      } else if (workflow.length === 2) {
        setWorkflow((prev) => [
          ...prev,
          {
            step: 3,
            app: "Zendesk",
            action: "Create support ticket with appropriate priority",
          },
        ]);
      }
    }, 1000);
  };

  return (
    <div className="py-20 bg-gray-50 dark:bg-gray-900/90 transition-colors">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Experience the Flo Builder</h2>
          <p className="text-neutral-gray text-lg max-w-xl mx-auto dark:text-gray-300">
            Try the chat interface that powers our automation platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-gray-200 shadow-lg bg-white dark:bg-gray-800/90 dark:border-gray-700 dark:shadow-xl dark:shadow-black/20">
          <div className="h-14 bg-gray-50 border-b border-gray-200 px-6 flex items-center dark:bg-gray-800 dark:border-gray-700">
            <div className="font-medium dark:text-white">Customer Support Automation</div>
          </div>
          
          <div className="flex flex-col h-96">
            <div className="flex-1 p-6 overflow-y-auto space-y-4 dark:bg-gray-800/90">
              {workflow.map((step) => (
                <div key={step.step} className="animate-fade-in" style={{ animationDelay: `${step.step * 0.2}s` }}>
                  <WorkflowCard
                    step={step.step}
                    app={step.app}
                    action={step.action}
                  />
                </div>
              ))}
              
              {messages.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg animate-fade-in dark:bg-gray-700/80 dark:text-gray-200">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{messages[messages.length - 1]}</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-100 dark:border-gray-700">
              <ChatInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
