
import React, { useState } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { ChatInput } from "@/components/builder/chat-input";
import { ChatMessage } from "@/components/builder/chat-message";
import { useWorkflowConversion } from "@/hooks/use-workflow-conversion";
import { useExecutions } from "@/hooks/use-executions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useWorkflows } from "@/hooks/use-workflows";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  workflowId?: string;
  requiresInfo?: {
    type: 'credentials' | 'trigger' | 'actions' | 'conditions';
    fields: string[];
  };
  actions?: Array<{
    type: 'activate' | 'execute' | 'edit' | 'provide_info';
    label: string;
    workflowId?: string;
  }>;
}

const Builder = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [workflowContext, setWorkflowContext] = useState<any>({});
  const { convertMessageToWorkflow, converting } = useWorkflowConversion();
  const { executeWorkflow } = useExecutions();
  const { workflows, createWorkflow } = useWorkflows();
  const { toast } = useToast();

  const isGreetingOrCasual = (message: string) => {
    const casualPatterns = /^(hi|hello|hey|sup|yo|good morning|good afternoon|good evening|how are you|what's up|whats up)$/i;
    const helpPatterns = /^(help|what can you do|how does this work|what is this)$/i;
    return casualPatterns.test(message.trim()) || helpPatterns.test(message.trim());
  };

  const isWorkflowRequest = (message: string) => {
    const workflowKeywords = /\b(automate|workflow|when|if|send|create|update|delete|trigger|schedule|email|notification|slack|webhook|api|integrate)\b/i;
    return workflowKeywords.test(message) && message.length > 10; // Avoid short casual messages
  };

  const analyzeWorkflowRequirements = (message: string) => {
    const requirements = {
      needsCredentials: /\b(api|key|token|auth|login|password)\b/i.test(message),
      needsTrigger: /\b(when|if|trigger|start|begin|schedule)\b/i.test(message),
      needsActions: /\b(send|create|update|delete|post|get|call)\b/i.test(message),
      needsConditions: /\b(if|when|condition|check|validate)\b/i.test(message),
      hasEmail: /\b(email|mail|@)\b/i.test(message),
      hasWebhook: /\b(webhook|http|api|endpoint)\b/i.test(message),
      hasSchedule: /\b(daily|weekly|monthly|hourly|schedule|cron)\b/i.test(message)
    };

    const missing = [];
    if (requirements.needsCredentials && !workflowContext.credentials) {
      missing.push('API credentials or authentication details');
    }
    if (requirements.needsTrigger && !workflowContext.trigger) {
      missing.push('trigger conditions (when should this run?)');
    }
    if (requirements.needsActions && !workflowContext.actions) {
      missing.push('specific actions to perform');
    }
    if (requirements.hasEmail && !workflowContext.emailConfig) {
      missing.push('email configuration (from/to addresses)');
    }
    if (requirements.hasWebhook && !workflowContext.webhookConfig) {
      missing.push('webhook endpoint details');
    }

    return { requirements, missing };
  };

  const getConversationalResponse = (message: string) => {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
      return "Hi there! 👋 I'm here to help you automate repetitive tasks and create powerful workflows. What kind of work are you trying to make easier or more efficient?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you create automated workflows to save time and reduce manual work! Here are some things I can automate for you:\n\n• Email notifications when events happen\n• Data sync between different apps\n• Scheduled tasks and reminders\n• Form submissions and responses\n• Social media posting\n• File processing and organization\n\nWhat specific task would you like to automate?";
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "I work by having a conversation with you about what you want to automate. Just describe your workflow in plain English, like:\n\n• \"Send me an email when someone fills out my contact form\"\n• \"Post to Slack when a new order comes in\"\n• \"Update my spreadsheet when I get new leads\"\n\nI'll ask follow-up questions to understand exactly what you need, then create the automation for you. What would you like to automate?";
    }

    return "I'm here to help you automate tasks and create workflows! What specific process or task would you like to make easier? Just describe it in your own words.";
  };

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
      // Handle casual greetings and help requests conversationally
      if (isGreetingOrCasual(message)) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getConversationalResponse(message),
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Only proceed with workflow creation if it's actually a workflow request
      if (!isWorkflowRequest(message)) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'd love to help you create an automation! Could you describe what specific task or process you'd like to automate? For example, you might want to send notifications, sync data between apps, or schedule regular tasks.",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Update workflow context with user input
      setWorkflowContext(prev => ({ ...prev, lastMessage: message }));

      // Analyze what information is still needed
      const { requirements, missing } = analyzeWorkflowRequirements(message);

      if (missing.length > 0) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I understand you want to automate this process. To create the perfect workflow, I need a bit more information about:\n\n${missing.map(item => `• ${item}`).join('\n')}\n\nCould you provide these details? For example:\n- What specific trigger should start this workflow?\n- What exact actions should be performed?\n- Do you need any API keys or credentials?`,
          timestamp: new Date(),
          requiresInfo: {
            type: missing.includes('trigger') ? 'trigger' : missing.includes('actions') ? 'actions' : 'credentials',
            fields: missing
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Convert natural language to workflow when we have enough info
        const result = await convertMessageToWorkflow(message, {
          agentMentions: message.match(/@[\w_]+/g) || [],
          workflowContext
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
        setWorkflowContext({}); // Reset context after successful creation
      }
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


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col md:flex-row pt-16">
        <div className="hidden md:block">
          <BuilderSidebar onAgentSelect={handleAgentSelect} />
        </div>
        <div className="flex-1 bg-gray-50 flex flex-col dark:bg-gray-900/90 transition-colors">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold dark:text-white">
                    Chat with Flo
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Describe what you want to automate - I'll guide you through the setup
                  </p>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-urban-blue" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <div className="space-y-4">
                    <p className="text-lg">Start building your automation workflow!</p>
                    <div className="text-sm space-y-2">
                      <p>Try saying things like:</p>
                      <div className="space-y-1 text-left max-w-md mx-auto">
                        <p>• "Send me an email when someone fills out my contact form"</p>
                        <p>• "Create a Slack notification when a new user signs up"</p>
                        <p>• "Update a spreadsheet every time I get a new order"</p>
                      </div>
                    </div>
                  </div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Builder;
