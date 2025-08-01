
import React, { useState } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { ChatInput } from "@/components/builder/chat-input";
import { ChatMessage } from "@/components/builder/chat-message";
import { VisualWorkflowBuilder } from "@/components/workflow-builder/VisualWorkflowBuilder";
import { useWorkflowConversion } from "@/hooks/use-workflow-conversion";
import { useExecutions } from "@/hooks/use-executions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Workflow, Plus } from "lucide-react";
import { useWorkflows } from "@/hooks/use-workflows";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowId?: string;
  actions?: Array<{
    type: 'activate' | 'execute' | 'edit';
    label: string;
    workflowId?: string;
  }>;
}

const Builder = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'visual'>('chat');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>();
  const { convertMessageToWorkflow, converting } = useWorkflowConversion();
  const { executeWorkflow } = useExecutions();
  const { workflows, createWorkflow } = useWorkflows();
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Convert natural language to workflow
      const result = await convertMessageToWorkflow(message, {
        agentMentions: message.match(/@[\w_]+/g) || []
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        workflowId: result.workflowId,
        actions: [
          {
            type: 'activate',
            label: 'Activate Workflow',
            workflowId: result.workflowId
          },
          {
            type: 'execute',
            label: 'Test Run',
            workflowId: result.workflowId
          }
        ]
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Workflow conversion error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message.includes('OpenAI API key') 
          ? "I need your OpenAI API key to create workflows. Please add it to your credentials first."
          : `Sorry, I couldn't create a workflow from that request. Error: ${error.message}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowAction = async (action: string, workflowId: string) => {
    try {
      if (action === 'execute') {
        await executeWorkflow(workflowId, {});
        toast({
          title: "Workflow Executed",
          description: "Your workflow has been started successfully!",
        });
      } else if (action === 'activate') {
        // Update workflow to active status
        toast({
          title: "Workflow Activated",
          description: "Your workflow is now active and ready to run!",
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAgentSelect = (agentName: string) => {
    setCurrentMessage(prev => {
      const mention = `@${agentName.toLowerCase().replace(/\s+/g, '_')}`;
      if (prev.trim()) {
        return `${prev} ${mention} `;
      }
      return `${mention} `;
    });
  };

  const handleCreateNewWorkflow = async () => {
    try {
      const workflow = await createWorkflow('Untitled Workflow', 'New visual workflow');
      setSelectedWorkflowId(workflow.id);
      setActiveMode('visual');
      toast({
        title: "Success",
        description: "New workflow created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row pt-16">
        <div className="hidden md:block">
          <BuilderSidebar onAgentSelect={handleAgentSelect} />
        </div>
        <div className="flex-1 bg-gray-50 flex flex-col dark:bg-gray-900/90 transition-colors">
          <div className="flex-1 flex flex-col">
            {/* Header with mode toggle */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold dark:text-white">
                    {activeMode === 'chat' ? 'Chat with Flo' : 'Visual Workflow Builder'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeMode === 'chat' 
                      ? 'Create workflows by describing what you want to automate'
                      : 'Build workflows visually by dragging and connecting nodes'
                    }
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <Button
                      variant={activeMode === 'chat' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveMode('chat')}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button
                      variant={activeMode === 'visual' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveMode('visual')}
                    >
                      <Workflow className="w-4 h-4 mr-2" />
                      Visual
                    </Button>
                  </div>
                  
                  {activeMode === 'visual' && (
                    <Button onClick={handleCreateNewWorkflow} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Workflow
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {activeMode === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                      <p>Start a conversation with Flo to build your automation workflows!</p>
                    </div>
                  )}
                  
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                      onAction={handleWorkflowAction}
                    />
                  ))}
                  
                  {isLoading && (
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
                <ChatInput onSend={handleSendMessage} value={currentMessage} onChange={setCurrentMessage} />
              </>
            ) : (
              <div className="flex-1">
                <VisualWorkflowBuilder workflowId={selectedWorkflowId} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Builder;
