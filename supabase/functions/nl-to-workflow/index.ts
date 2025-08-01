import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced Workflow Definition matching our new DSL
interface WorkflowNode {
  id: string;
  type: string;
  typeVersion: number;
  name: string;
  parameters: Record<string, any>;
  credentials?: {
    id: string;
    name: string;
    type: string;
  };
  position?: { x: number; y: number };
  next?: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: Record<string, WorkflowNode>;
  connections: Record<string, any>;
  settings?: {
    executionOrder?: 'v1' | 'v2';
    timezone?: string;
    maxRetries?: number;
    timeout?: number;
  };
  staticData?: Record<string, any>;
  active: boolean;
  start?: string;
}

interface RequirementAnalysis {
  needsCredentials: boolean;
  needsTrigger: boolean;
  needsActions: boolean;
  needsConditions: boolean;
  needsEmailConfig: boolean;
  needsWebhookConfig: boolean;
  needsScheduling: boolean;
  requiredFields: string[];
  suggestedCredentials: string[];
}

// Helper functions
function analyzeWorkflowRequirements(message: string): RequirementAnalysis {
  const lowerMessage = message.toLowerCase();
  
  return {
    needsCredentials: /\b(api|key|token|auth|login|password|credential)\b/i.test(message),
    needsTrigger: /\b(when|if|trigger|webhook|schedule|event)\b/i.test(message),
    needsActions: /\b(send|create|update|delete|post|get|call|execute)\b/i.test(message),
    needsConditions: /\b(if|condition|check|validate|filter|only if)\b/i.test(message),
    needsEmailConfig: /\b(email|mail|notify|notification)\b/i.test(message),
    needsWebhookConfig: /\b(webhook|callback|url|endpoint)\b/i.test(message),
    needsScheduling: /\b(daily|weekly|monthly|schedule|every|recurring)\b/i.test(message),
    requiredFields: extractRequiredFields(message),
    suggestedCredentials: suggestCredentials(message)
  };
}

function extractRequiredFields(message: string): string[] {
  const fields: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('email')) fields.push('email_address', 'email_subject', 'email_body');
  if (lowerMessage.includes('api') || lowerMessage.includes('http')) fields.push('api_url', 'http_method');
  if (lowerMessage.includes('slack')) fields.push('slack_channel', 'slack_message');
  if (lowerMessage.includes('webhook')) fields.push('webhook_url');
  
  return fields;
}

function suggestCredentials(message: string): string[] {
  const credentials: string[] = [];
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('email') || lowerMessage.includes('smtp')) credentials.push('smtp');
  if (lowerMessage.includes('slack')) credentials.push('slack_api');
  if (lowerMessage.includes('openai') || lowerMessage.includes('gpt')) credentials.push('openai_api');
  if (lowerMessage.includes('github')) credentials.push('github_api');
  if (lowerMessage.includes('google')) credentials.push('google_api');
  
  return credentials;
}

const ENHANCED_WORKFLOW_PROMPT = `You are an expert workflow automation engine. Convert user requests into structured workflow definitions using our advanced DSL.

WORKFLOW DSL STRUCTURE:
{
  "id": "unique_workflow_id",
  "name": "Human Readable Name",
  "nodes": {
    "node-1": {
      "id": "node-1",
      "type": "trigger.manual|trigger.webhook|trigger.schedule|action.http_request|action.gpt_prompt|action.email|condition.if|utility.delay",
      "typeVersion": 1,
      "name": "Human readable node name",
      "parameters": { /* node-specific parameters */ },
      "next": "node-2" // or undefined for final nodes
    }
  },
  "connections": {},
  "settings": {
    "executionOrder": "v1",
    "maxRetries": 3,
    "timeout": 300000
  },
  "active": false,
  "start": "node-1"
}

AVAILABLE NODE TYPES:

TRIGGERS:
- "trigger.manual": Manual execution (parameters: {})
- "trigger.webhook": HTTP webhook (parameters: { "path": "/webhook-path", "method": "POST" })
- "trigger.schedule": Scheduled execution (parameters: { "interval": "daily|weekly|monthly", "time": "09:00" })

ACTIONS:
- "action.http_request": HTTP API calls (parameters: { "method": "GET|POST|PUT|DELETE", "url": "https://...", "headers": {}, "body": {} })
- "action.gpt_prompt": AI text generation (parameters: { "prompt": "text with {{ variables }}", "model": "gpt-4o-mini", "temperature": 0.7 })
- "action.email": Send emails (parameters: { "to": "email@example.com", "subject": "Subject", "body": "Email body with {{ variables }}" })

CONDITIONS:
- "condition.if": Conditional branching (parameters: { "condition": "{{ variable }} === 'value'", "trueBranch": "node-id", "falseBranch": "node-id" })

UTILITIES:
- "utility.delay": Wait/pause (parameters: { "duration": 5000 })
- "utility.set_variable": Set workflow variable (parameters: { "name": "variable_name", "value": "{{ expression }}" })

VARIABLE TEMPLATING:
Use {{ }} syntax for dynamic values:
- {{ $prev.json }} - Output from previous node
- {{ $prev.json.field }} - Specific field from previous node
- {{ user.email }} - User context variables
- {{ workflow.variable_name }} - Workflow variables

EXAMPLES:

User: "Send me an email every day at 9am with weather updates"
{
  "id": "daily_weather_email",
  "name": "Daily Weather Email",
  "nodes": {
    "schedule-trigger": {
      "id": "schedule-trigger", 
      "type": "trigger.schedule",
      "typeVersion": 1,
      "name": "Daily Trigger",
      "parameters": { "interval": "daily", "time": "09:00" },
      "next": "get-weather"
    },
    "get-weather": {
      "id": "get-weather",
      "type": "action.http_request", 
      "typeVersion": 1,
      "name": "Get Weather Data",
      "parameters": {
        "method": "GET",
        "url": "https://api.openweathermap.org/data/2.5/weather?q={{ user.city }}&appid={{ credentials.weather_api_key }}"
      },
      "next": "format-weather"
    },
    "format-weather": {
      "id": "format-weather",
      "type": "action.gpt_prompt",
      "typeVersion": 1, 
      "name": "Format Weather Report",
      "parameters": {
        "prompt": "Create a friendly weather summary for today based on this data: {{ $prev.json }}",
        "model": "gpt-4o-mini",
        "temperature": 0.7
      },
      "next": "send-email"
    },
    "send-email": {
      "id": "send-email",
      "type": "action.email",
      "typeVersion": 1,
      "name": "Send Weather Email", 
      "parameters": {
        "to": "{{ user.email }}",
        "subject": "Your Daily Weather Update",
        "body": "{{ $prev.json }}"
      }
    }
  },
  "connections": {},
  "settings": { "executionOrder": "v1", "maxRetries": 3, "timeout": 300000 },
  "active": false,
  "start": "schedule-trigger"
}

IMPORTANT RULES:
1. Always use the exact node type strings from the list above
2. Each node must have a unique ID
3. Use "next" property for linear flows  
4. Final nodes should not have a "next" property
5. Use {{ }} templating for dynamic values
6. Keep node names human-readable
7. Return only valid JSON, no additional text
8. Set "active": false initially (user will activate manually)

Convert this user request to a workflow:`;

function validateGeneratedWorkflow(workflow: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!workflow.id) errors.push('Missing workflow id');
  if (!workflow.name) errors.push('Missing workflow name');
  if (!workflow.nodes || typeof workflow.nodes !== 'object') errors.push('Missing or invalid nodes object');
  if (!workflow.start) errors.push('Missing start node');
  
  if (workflow.nodes) {
    for (const [nodeId, node] of Object.entries(workflow.nodes)) {
      const n = node as any;
      if (!n.id) errors.push(`Node ${nodeId} missing id`);
      if (!n.type) errors.push(`Node ${nodeId} missing type`);
      if (!n.name) errors.push(`Node ${nodeId} missing name`);
      if (!n.parameters) errors.push(`Node ${nodeId} missing parameters`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

serve(async (req) => {
  console.log('NL-to-workflow function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing workflow conversion request...');
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('API_OPENAI');
    
    console.log('Environment check - SUPABASE_URL:', !!supabaseUrl);
    console.log('Environment check - SERVICE_KEY:', !!supabaseServiceKey);
    console.log('Environment check - OPENAI_KEY:', !!openAIApiKey);
    
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(JSON.stringify({ 
        error: 'Authorization header required'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not found in environment');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        requiresApiKey: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token present:', !!jwt);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    console.log('User authentication result:', !!user, 'Error:', !!authError);
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      throw new Error('Unauthorized');
    }

    console.log('Parsing request body...');
    const requestBody = await req.json();
    console.log('Request body parsed:', requestBody);
    
    const { message, context = {} } = requestBody;
    
    if (!message) {
      console.log('No message provided in request body');
      throw new Error('Message is required');
    }

    console.log('Converting message to workflow:', message);
    
    // Analyze workflow requirements first
    const requirements = analyzeWorkflowRequirements(message);
    console.log('Workflow requirements analysis:', requirements);
    
    // Enhanced context with user info and requirements
    const enhancedContext = {
      ...context,
      user: { id: user.id, email: user.email },
      requirements,
      timestamp: new Date().toISOString()
    };

    // Generate workflow using OpenAI with enhanced prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Use the latest flagship model
        messages: [
          {
            role: 'system',
            content: ENHANCED_WORKFLOW_PROMPT
          },
          {
            role: 'user',
            content: `User request: "${message}"\n\nContext: ${JSON.stringify(enhancedContext)}\n\nAnalyzed requirements: ${JSON.stringify(requirements)}\n\nGenerate a complete workflow definition in JSON format.`
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent structure
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const workflowJson = aiResponse.choices[0].message.content;
    
    console.log('Generated workflow JSON:', workflowJson);

    let workflowDefinition: WorkflowDefinition;
    try {
      workflowDefinition = JSON.parse(workflowJson);
    } catch (error) {
      console.error('Failed to parse workflow JSON:', error);
      throw new Error('Failed to parse generated workflow JSON');
    }

    // Enhanced validation
    const validation = validateGeneratedWorkflow(workflowDefinition);
    if (!validation.isValid) {
      console.error('Workflow validation failed:', validation.errors);
      throw new Error(`Invalid workflow structure: ${validation.errors.join(', ')}`);
    }

    // Ensure the workflow has the correct structure
    if (!workflowDefinition.connections) {
      workflowDefinition.connections = {};
    }
    if (!workflowDefinition.settings) {
      workflowDefinition.settings = {
        executionOrder: 'v1',
        maxRetries: 3,
        timeout: 300000
      };
    }

    // Generate human-readable summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate a friendly, human-readable summary of what this workflow will do. Keep it conversational and easy to understand.'
          },
          {
            role: 'user',
            content: `Workflow: ${JSON.stringify(workflowDefinition)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content;

    // Save workflow to database
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name: workflowDefinition.name,
        description: summary,
        json_definition: workflowDefinition,
        status: 'draft',
        is_active: false
      })
      .select()
      .single();

    if (workflowError) {
      console.error('Error saving workflow:', workflowError);
      throw new Error('Failed to save workflow');
    }

    console.log('Workflow saved successfully:', workflow.id);

    return new Response(JSON.stringify({
      workflowId: workflow.id,
      workflow: workflowDefinition,
      summary,
      message: `I've created a workflow called "${workflowDefinition.name}". ${summary} Ready to activate it?`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in NL to workflow conversion:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});