
import React, { useState } from "react";
import { ChatInput } from "@/components/builder/chat-input";
import { WorkflowCard } from "@/components/builder/workflow-card";
import { ChatMessage } from "@/components/builder/chat-message";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChatboxPreview: React.FC = () => {
  const { user } = useAuth();
  const { messages, sendMessage, sending } = useChat();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState([
    {
      step: 1,
      app: "Slack",
      action: "Monitor #customer-support channel for new messages",
    },
  ]);

  const handleSendMessage = async (message: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      await sendMessage(message);
      
      // Simulate workflow progression for demo
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
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
          <div className="h-14 bg-gray-50 border-b border-gray-200 px-6 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
            <div className="font-medium dark:text-white">Customer Support Automation</div>
            {!user && (
              <Button 
                onClick={() => navigate("/auth")} 
                size="sm" 
                className="bg-urban-blue hover:bg-urban-blue/90"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login to Chat
              </Button>
            )}
          </div>
          
          <div className="flex flex-col h-96">
            <div className="flex-1 p-6 overflow-y-auto space-y-4 dark:bg-gray-800/90">
              {/* Show workflow cards */}
              {workflow.map((step) => (
                <div key={step.step} className="animate-fade-in" style={{ animationDelay: `${step.step * 0.2}s` }}>
                  <WorkflowCard
                    step={step.step}
                    app={step.app}
                    action={step.action}
                  />
                </div>
              ))}
              
              {/* Show real chat messages if user is logged in */}
              {user && messages.length > 0 && (
                <div className="space-y-4 border-t pt-4 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Chat History:</h4>
                  {messages.slice(-3).map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={{
                        id: msg.id,
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content,
                        timestamp: new Date(msg.created_at)
                      }} 
                    />
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
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
