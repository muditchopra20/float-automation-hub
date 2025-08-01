import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowNode {
  id: string;
  type: 'httpRequest' | 'gptPrompt' | 'email' | 'condition' | 'loop' | 'delay' | 'custom';
  params: Record<string, any>;
  next: string[];
  agent?: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  start: string;
}

const WORKFLOW_GENERATION_PROMPT = `You are an expert workflow automation system. Convert user requests into structured JSON workflows.

Available node types:
- httpRequest: Make HTTP API calls (params: method, url, headers, body)
- gptPrompt: Generate text with AI (params: promptTemplate, model, temperature)
- email: Send emails (params: to, subject, bodyTemplate)
- condition: Branch logic (params: expression)
- delay: Wait/pause (params: duration in ms)

Rules:
1. Each node needs a unique ID
2. Use {{variable_name}} for dynamic values in templates
3. Connect nodes via "next" arrays
4. Start with the first node ID
5. Keep it simple and logical

Examples:

User: "Send a welcome email when someone signs up"
Response:
{
  "id": "welcome_workflow",
  "name": "Welcome Email Workflow",
  "nodes": [
    {
      "id": "send_welcome",
      "type": "email",
      "params": {
        "to": "{{user_email}}",
        "subject": "Welcome to our platform!",
        "bodyTemplate": "Hi {{user_name}}, welcome to our platform! We're excited to have you."
      },
      "next": []
    }
  ],
  "start": "send_welcome"
}

User: "Get weather data and email me a summary"
Response:
{
  "id": "weather_summary",
  "name": "Weather Summary Workflow",
  "nodes": [
    {
      "id": "get_weather",
      "type": "httpRequest",
      "params": {
        "method": "GET",
        "url": "https://api.openweathermap.org/data/2.5/weather?q={{city}}&appid={{api_key}}",
        "headers": {}
      },
      "next": ["summarize_weather"]
    },
    {
      "id": "summarize_weather",
      "type": "gptPrompt",
      "params": {
        "promptTemplate": "Summarize this weather data in a friendly way: {{get_weather_result}}",
        "model": "gpt-4o-mini",
        "temperature": 0.7
      },
      "next": ["send_summary"]
    },
    {
      "id": "send_summary",
      "type": "email",
      "params": {
        "to": "{{user_email}}",
        "subject": "Your Weather Summary",
        "bodyTemplate": "{{summarize_weather_result}}"
      },
      "next": []
    }
  ],
  "start": "get_weather"
}

Convert the following user request into a workflow JSON:`;

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

    // Generate workflow using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: WORKFLOW_GENERATION_PROMPT
          },
          {
            role: 'user',
            content: `User request: "${message}"\n\nContext: ${JSON.stringify(context)}\n\nGenerate only the JSON workflow, no additional text.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const workflowJson = aiResponse.choices[0].message.content;
    
    console.log('Generated workflow JSON:', workflowJson);

    let workflowDefinition: WorkflowDefinition;
    try {
      workflowDefinition = JSON.parse(workflowJson);
    } catch (error) {
      throw new Error('Failed to parse generated workflow JSON');
    }

    // Validate workflow structure
    if (!workflowDefinition.nodes || !workflowDefinition.start || !workflowDefinition.name) {
      throw new Error('Invalid workflow structure generated');
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