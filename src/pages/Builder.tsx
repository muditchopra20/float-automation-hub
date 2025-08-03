
import React, { useState } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { BuilderSidebar } from "@/components/builder/builder-sidebar";
import { ChatInput } from "@/components/builder/chat-input";
import { ChatMessage } from "@/components/builder/chat-message";
import { useN8nIntegration } from "@/hooks/use-n8n-integration";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Play, Menu, X } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>();
  const { 
    convertMessageToN8nWorkflow, 
    executeWorkflow, 
    getWorkflows,
    activateWorkflow,
    loading: n8nLoading 
  } = useN8nIntegration();
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
        // Convert natural language to n8n workflow when we have enough info
        const result = await convertMessageToN8nWorkflow(message, {
          agentMentions: message.match(/@[\w_]+/g) || [],
          workflowContext
        });

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✅ **Workflow Created Successfully!**\n\n**${result.workflow.name}**\n\n${result.summary}\n\nYour workflow has been created in n8n and is ready to use. You can activate it to start automating or test it first.`,
          timestamp: new Date(),
          workflowId: result.workflow.id,
          actions: [
            {
              type: 'activate',
              label: 'Activate Workflow',
              workflowId: result.workflow.id
            },
            {
              type: 'execute',
              label: 'Test Run',
              workflowId: result.workflow.id
            }
          ]
        };

        setMessages(prev => [...prev, assistantMessage]);
        setWorkflowContext({}); // Reset context after successful creation
        
        // Refresh workflows list
        const updatedWorkflows = await getWorkflows();
        setWorkflows(updatedWorkflows);
      }
    } catch (error) {
      console.error('Workflow conversion error:', error);
      
      let errorContent = "Sorry, I couldn't create a workflow from that request.";
      
      if (error.message.includes('N8N_API_KEY') || error.message.includes('N8N_INSTANCE_URL')) {
        errorContent = "I need your n8n configuration to create workflows. Please add your n8n API key and instance URL.";
      } else if (error.message.includes('OpenAI API key')) {
        errorContent = "I need your OpenAI API key to create workflows. Please add it to your credentials first.";
      } else {
        errorContent = `Sorry, I couldn't create a workflow from that request. Error: ${error.message}`;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
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
      } else if (action === 'activate') {
        await activateWorkflow(workflowId);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('Workflow action error:', error);
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
      <main className="flex-1 flex pt-16">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'block' : 'hidden'} 
          md:block transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-0 md:w-80'}
        `}>
          <BuilderSidebar onAgentSelect={handleAgentSelect} />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 bg-background flex flex-col relative">
          {/* Header */}
          <div className="border-b border-border bg-card">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden"
                >
                  {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Chat with Flo
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Describe what you want to automate - I'll build it with n8n
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {workflows.length > 0 && (
                  <select 
                    value={selectedWorkflowId || ''} 
                    onChange={(e) => setSelectedWorkflowId(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-md bg-background"
                  >
                    <option value="">Select workflow...</option>
                    {workflows.map(workflow => (
                      <option key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </option>
                    ))}
                  </select>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => selectedWorkflowId && executeWorkflow(selectedWorkflowId, {})}
                  disabled={!selectedWorkflowId}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </Button>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="max-w-2xl mx-auto text-center mt-16">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Welcome to Flo AI</h3>
                    <p className="text-muted-foreground mb-6">
                      Your smart workflow assistant powered by n8n. Just describe what you want to automate!
                    </p>
                  </div>
                  <div className="text-left space-y-3 bg-muted/50 rounded-lg p-6">
                    <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Try examples like:</p>
                    <div className="space-y-2">
                      <p className="text-sm">💧 "Send me an email when someone fills out my contact form"</p>
                      <p className="text-sm">💬 "Create a Slack notification when a new user signs up"</p>
                      <p className="text-sm">📊 "Update a spreadsheet every time I get a new order"</p>
                      <p className="text-sm">🔄 "Sync new leads from my website to my CRM"</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onAction={handleWorkflowAction}
                />
              ))}
              
              {(isLoading || n8nLoading) && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3 max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs text-muted-foreground">Creating workflow...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Input */}
          <ChatInput onSend={handleSendMessage} value={currentMessage} onChange={setCurrentMessage} />
        </div>
      </main>
    </div>
  );
};

export default Builder;
