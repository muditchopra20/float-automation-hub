
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  const [conversationState, setConversationState] = useState<{
    phase: 'greeting' | 'understanding' | 'tools_check' | 'building' | 'preview' | 'complete';
    tools: string[];
    toolsConfirmed: boolean;
  }>({
    phase: 'greeting',
    tools: [],
    toolsConfirmed: false
  });

  const extractToolsFromMessage = (message: string) => {
    const tools = [];
    const lowerMessage = message.toLowerCase();
    
    // Common integrations
    if (lowerMessage.includes('typeform')) tools.push('Typeform');
    if (lowerMessage.includes('notion')) tools.push('Notion');
    if (lowerMessage.includes('slack')) tools.push('Slack');
    if (lowerMessage.includes('gmail') || lowerMessage.includes('email')) tools.push('Gmail');
    if (lowerMessage.includes('google sheets') || lowerMessage.includes('spreadsheet')) tools.push('Google Sheets');
    if (lowerMessage.includes('webhook') || lowerMessage.includes('api')) tools.push('Webhook');
    if (lowerMessage.includes('discord')) tools.push('Discord');
    if (lowerMessage.includes('trello')) tools.push('Trello');
    if (lowerMessage.includes('calendly')) tools.push('Calendly');
    if (lowerMessage.includes('hubspot')) tools.push('HubSpot');
    if (lowerMessage.includes('salesforce')) tools.push('Salesforce');
    
    return tools;
  };

  const isGreetingOrCasual = (message: string) => {
    const casualPatterns = /^(hi|hello|hey|sup|yo|good morning|good afternoon|good evening|how are you|what's up|whats up)$/i;
    const helpPatterns = /^(help|what can you do|how does this work|what is this)$/i;
    return casualPatterns.test(message.trim()) || helpPatterns.test(message.trim());
  };

  const isBusinessConsultingRequest = (message: string) => {
    const consultingKeywords = /\b(suggest|recommendation|advice|help me|what should|ideas|business|ecommerce|consultant|strategies)\b/i;
    const businessKeywords = /\b(business|ecommerce|e-commerce|shop|store|company|startup|saas|agency|marketing|sales|customer|client)\b/i;
    return consultingKeywords.test(message) && (businessKeywords.test(message) || message.includes('what to automate'));
  };

  const isWorkflowRequest = (message: string) => {
    const workflowKeywords = /\b(automate|workflow|when|if|send|create|update|delete|trigger|schedule|email|notification|slack|webhook|api|integrate)\b/i;
    return workflowKeywords.test(message) && message.length > 10; // Avoid short casual messages
  };

  const getBusinessConsultingResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ecommerce') || lowerMessage.includes('e-commerce') || lowerMessage.includes('store') || lowerMessage.includes('shop')) {
      return `As an ecommerce business, you have fantastic automation opportunities! Here are my top recommendations:

**Customer Experience:**
• When someone abandons their cart → Send automated recovery emails with Mailchimp
• When a new order comes in → Notify your team on Slack and create a shipment in your fulfillment system
• When a customer leaves a review → Add them to a VIP customer list in your CRM

**Operations:**
• When inventory runs low → Create purchase orders in your supplier system
• When a refund is processed → Update inventory and notify accounting in Google Sheets
• Daily sales reports → Automatically compile and send to your team

**Marketing:**
• New customers → Add to welcome email sequence and segment in Klaviyo
• High-value customers → Add to special promotions list
• Product page views → Retarget on Facebook/Google Ads

Which area interests you most? I can help you build any of these workflows!`;
    }
    
    if (lowerMessage.includes('saas') || lowerMessage.includes('software') || lowerMessage.includes('app')) {
      return `For SaaS businesses, automation is crucial for scaling! Here are my top recommendations:

**Customer Onboarding:**
• New signups → Send welcome sequence, create user in systems, notify sales team
• Trial users → Send educational emails, track engagement, alert sales for high-value prospects
• Churned users → Send exit surveys, add to win-back campaigns

**Customer Success:**
• Usage drops → Alert customer success team, trigger engagement campaigns
• Feature requests → Log in Notion, notify product team on Slack
• Support tickets → Auto-assign based on priority and expertise

**Sales & Marketing:**
• Demo requests → Create leads in CRM, schedule follow-ups, notify sales
• Webinar signups → Add to email sequences, send calendar invites
• Product qualified leads → Score and route to appropriate sales rep

**Operations:**
• New customers → Provision accounts, update billing systems, create onboarding tasks
• Failed payments → Send dunning emails, alert finance team

What type of SaaS workflow would help you most?`;
    }
    
    if (lowerMessage.includes('agency') || lowerMessage.includes('marketing') || lowerMessage.includes('client')) {
      return `Agencies can save hours daily with smart automation! Here are my top suggestions:

**Client Management:**
• New client onboarding → Create project in Asana, set up Slack channels, send welcome packet
• Project milestones → Auto-notify clients, request feedback, update invoicing
• Client feedback → Log in CRM, create follow-up tasks, route to team leads

**Reporting & Analytics:**
• Weekly client reports → Pull data from Google Analytics, Facebook Ads, compile in branded reports
• Campaign performance alerts → Notify team when metrics hit thresholds
• Monthly billing → Generate invoices based on project hours, send to clients

**Lead Generation:**
• Contact form submissions → Qualify leads, add to CRM, schedule discovery calls
• Proposal requests → Create templated proposals, track in pipeline
• Website visitors → Retarget on social, add to nurture sequences

**Team Management:**
• Project updates → Sync between tools, notify stakeholders
• Time tracking → Compile timesheets, update project budgets
• Resource planning → Alert when team capacity is reaching limits

Which agency workflow would impact your business most?`;
    }
    
    return `I'd love to help you identify automation opportunities! As a business workflow consultant, I can suggest automations based on your industry and pain points.

**Common high-impact automations:**
• Lead management and nurturing
• Customer onboarding sequences  
• Sales and marketing coordination
• Inventory and order management
• Team notifications and reporting
• Data syncing between systems

Tell me more about your business - what industry are you in, and what repetitive tasks are eating up your team's time? I'll give you specific automation recommendations that could save hours each week!`;
  };

  const getConversationalResponse = (message: string) => {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
      return "Hey! I'm Flo — your AI workflow assistant. Just tell me what you want to automate, and I'll build it for you inside your connected tools.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I help you automate tasks by creating workflows using tools like Typeform, Notion, Slack, Gmail, and more. I operate on top of n8n and can build any automation you describe.\n\nJust tell me what you want to automate — like 'When someone submits a Typeform, add their data to Notion and alert my team on Slack' — and I'll build it for you!";
    }
    
    if (lowerMessage.includes('how') && lowerMessage.includes('work')) {
      return "I understand what you want to automate, check if your tools are connected, then build and send the workflow to your n8n workspace. Just describe your automation in plain English and I'll take care of the rest!";
    }

    return "I'm Flo, your workflow assistant! Just tell me what you want to automate and I'll build it for you. What task would you like to make automatic?";
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
      // 1. Greeting & Onboarding
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

      // 2. Business Consulting 
      if (isBusinessConsultingRequest(message)) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getBusinessConsultingResponse(message),
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // 3. Intent Understanding
      if (isWorkflowRequest(message)) {
        const tools = extractToolsFromMessage(message);
        
        if (tools.length > 0) {
          // Update conversation state
          setConversationState(prev => ({
            ...prev,
            phase: 'tools_check',
            tools: tools
          }));

          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Got it! You want to use ${tools.join(', ')} in this flow. Let's quickly check if you've connected those.\n\nAre these ${tools.length} tools connected to your account? ${tools.join(', ')}?`,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }
      }

      // 3. Tool Integration Check (Handle yes/no responses)
      if (conversationState.phase === 'tools_check') {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('yes') || lowerMessage.includes('connected') || lowerMessage.includes('ready')) {
          setConversationState(prev => ({ ...prev, toolsConfirmed: true, phase: 'building' }));
          
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Awesome. I'll now create a workflow that uses ${conversationState.tools.join(', ')}.`,
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          // 4. Workflow Generation Phase - Convert to n8n workflow
          setTimeout(async () => {
            try {
              const result = await convertMessageToN8nWorkflow(workflowContext.lastMessage || message, {
                tools: conversationState.tools,
                workflowContext
              });

              // 5. Preview
              const previewMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Here's a quick summary of the workflow I'm creating:\n\n• Trigger: ${result.summary.split('\n')[0] || 'Automated trigger'}\n• Actions: ${result.summary.split('\n').slice(1).join('\n') || 'Process and respond'}\n\nReady to push this to your n8n workspace?`,
                timestamp: new Date(),
                actions: [
                  {
                    type: 'provide_info',
                    label: 'Yes, Create It!'
                  }
                ]
              };

              setMessages(prev => [...prev, previewMessage]);
              
              // Auto-proceed after 2 seconds or wait for user confirmation
              setTimeout(async () => {
                // 6. Push to n8n
                const finalMessage: ChatMessage = {
                  id: (Date.now() + 3).toString(),
                  role: 'assistant',
                  content: `✅ Done! The workflow has been created in your n8n dashboard. You can edit or test it from there.\n\n**${result.workflow.name}**\n\n${result.message}`,
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

                setMessages(prev => [...prev, finalMessage]);
                
                // Reset conversation state
                setConversationState({
                  phase: 'complete',
                  tools: [],
                  toolsConfirmed: false
                });
                setWorkflowContext({});
                
                // Refresh workflows list
                const updatedWorkflows = await getWorkflows();
                setWorkflows(updatedWorkflows);
              }, 2000);
              
            } catch (error) {
              console.error('Workflow creation error:', error);
              throw error;
            }
          }, 1000);
          
          setIsLoading(false);
          return;
        }
        
        if (lowerMessage.includes('no') || lowerMessage.includes('not connected')) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "No worries — please connect those in your integrations tab and then come back here!",
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);
          
          // Reset conversation state
          setConversationState({
            phase: 'greeting',
            tools: [],
            toolsConfirmed: false
          });
          
          setIsLoading(false);
          return;
        }
      }

      // Store user message for workflow creation
      setWorkflowContext(prev => ({ ...prev, lastMessage: message }));

      // Default response for non-workflow requests
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'd love to help you create an automation! Could you describe what specific task or process you'd like to automate? For example, you might want to automate form submissions, send notifications, or sync data between apps.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Workflow conversion error:', error);
      
      // 7. Error Handling
      let errorContent = "Hmm, something went wrong while creating your workflow. Can you check if your integrations are active? Or try again in a bit.";
      
      if (error.message.includes('N8N_API_KEY') || error.message.includes('N8N_INSTANCE_URL')) {
        errorContent = "I need your n8n configuration to create workflows. Please add your n8n API key and instance URL in your integrations.";
      } else if (error.message.includes('OpenAI API key')) {
        errorContent = "I need your OpenAI API key to understand and create workflows. Please add it to your credentials first.";
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
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-80' : 'w-0'}
          ${sidebarOpen ? 'block' : 'hidden'}
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
                    <h3 className="text-xl font-semibold mb-2">Hey! I'm Flo</h3>
                    <p className="text-muted-foreground mb-6">
                      Tell me what you want to automate, and I'll build it for you.
                    </p>
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
