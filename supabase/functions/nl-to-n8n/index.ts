import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, any>;
  active: boolean;
  settings: {
    executionOrder: string;
  };
}

const N8N_WORKFLOW_PROMPT = `You are an expert n8n workflow automation specialist. Convert natural language requests into n8n workflow JSON format.

IMPORTANT: Your response must be valid JSON only, no markdown or explanations.

For each request, create a workflow with these components:
1. A clear, descriptive name
2. Properly structured n8n nodes with correct types
3. Valid connections between nodes
4. Appropriate parameters for each node

Common n8n node types:
- "n8n-nodes-base.manualTrigger" - Manual trigger
- "n8n-nodes-base.webhook" - Webhook trigger  
- "n8n-nodes-base.cron" - Schedule trigger
- "n8n-nodes-base.httpRequest" - HTTP requests
- "n8n-nodes-base.sendEmail" - Send emails
- "n8n-nodes-base.slack" - Slack integration
- "n8n-nodes-base.googleSheets" - Google Sheets
- "n8n-nodes-base.function" - Code execution
- "n8n-nodes-base.if" - Conditional logic

Example response format:
{
  "name": "Workflow Name",
  "summary": "Brief description of what this workflow does",
  "message": "Confirmation message for user",
  "nodes": [
    {
      "id": "trigger",
      "name": "Manual Trigger", 
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [100, 100],
      "parameters": {}
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Next Node",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}

Rules:
- Always start with a trigger node
- Use realistic node positions (spaced 300px apart horizontally)
- Include proper error handling when needed
- Use appropriate authentication parameters for external services
- Make connections logical and complete`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context } = await req.json();

    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add it to your secrets.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the prompt with user's request
    const fullPrompt = `${N8N_WORKFLOW_PROMPT}

User Request: "${message}"
Context: ${JSON.stringify(context)}

Generate the n8n workflow JSON:`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert n8n workflow specialist. Return only valid JSON responses.'
          },
          {
            role: 'user', 
            content: fullPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${error}`);
    }

    const openaiResult = await openaiResponse.json();
    const workflowContent = openaiResult.choices[0].message.content;

    let workflowData;
    try {
      workflowData = JSON.parse(workflowContent);
    } catch (parseError) {
      throw new Error('Failed to parse workflow JSON from AI response');
    }

    // Validate the workflow structure
    if (!workflowData.name || !workflowData.nodes || !Array.isArray(workflowData.nodes)) {
      throw new Error('Invalid workflow structure generated');
    }

    // Generate a summary if not provided
    if (!workflowData.summary) {
      workflowData.summary = `This workflow automates: ${message}`;
    }

    if (!workflowData.message) {
      workflowData.message = `I've created a workflow to ${message.toLowerCase()}. It's ready to be deployed to n8n!`;
    }

    return new Response(JSON.stringify(workflowData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nl-to-n8n function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to convert message to n8n workflow' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});