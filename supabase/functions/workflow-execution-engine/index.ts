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

interface ExecutionContext {
  variables: Record<string, any>;
  inputData: Record<string, any>;
  agentMemory: Record<string, any>;
}

class WorkflowExecutor {
  private supabase: any;
  private executionId: string;
  private workflowId: string;
  private context: ExecutionContext;

  constructor(supabase: any, executionId: string, workflowId: string, inputData: Record<string, any> = {}) {
    this.supabase = supabase;
    this.executionId = executionId;
    this.workflowId = workflowId;
    this.context = {
      variables: {},
      inputData,
      agentMemory: {}
    };
  }

  async log(nodeId: string, level: 'debug' | 'info' | 'warn' | 'error', message: string) {
    await this.supabase
      .from('execution_logs')
      .insert({
        execution_id: this.executionId,
        node_id: nodeId,
        level,
        message
      });
  }

  async updateExecutionStatus(status: 'pending' | 'running' | 'completed' | 'failed', error?: string, output?: any) {
    const updates: any = { status };
    
    if (status === 'completed' || status === 'failed') {
      updates.finished_at = new Date().toISOString();
    }
    
    if (error) updates.error = error;
    if (output) updates.output = output;

    await this.supabase
      .from('executions')
      .update(updates)
      .eq('id', this.executionId);
  }

  async executeHttpRequest(node: WorkflowNode): Promise<any> {
    const { method = 'GET', url, headers = {}, body } = node.params;
    
    await this.log(node.id, 'info', `Making ${method} request to ${url}`);
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined
      });
      
      const result = await response.json();
      await this.log(node.id, 'info', `HTTP request completed with status ${response.status}`);
      
      return result;
    } catch (error) {
      await this.log(node.id, 'error', `HTTP request failed: ${error.message}`);
      throw error;
    }
  }

  async executeGptPrompt(node: WorkflowNode): Promise<any> {
    const { promptTemplate, model = 'gpt-4o-mini', temperature = 0.7, memoryKeys = [] } = node.params;
    
    await this.log(node.id, 'info', `Executing GPT prompt with model ${model}`);
    
    // Get OpenAI API key from credentials
    const { data: credentials } = await this.supabase
      .from('credentials')
      .select('encrypted_value')
      .eq('type', 'openai')
      .single();
    
    if (!credentials) {
      throw new Error('OpenAI credentials not found');
    }
    
    // Replace variables in prompt template
    let prompt = promptTemplate;
    for (const [key, value] of Object.entries(this.context.variables)) {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.encrypted_value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature
        }),
      });
      
      const result = await response.json();
      await this.log(node.id, 'info', 'GPT prompt completed successfully');
      
      return result.choices[0].message.content;
    } catch (error) {
      await this.log(node.id, 'error', `GPT prompt failed: ${error.message}`);
      throw error;
    }
  }

  async executeEmail(node: WorkflowNode): Promise<any> {
    const { to, subject, bodyTemplate } = node.params;
    
    await this.log(node.id, 'info', `Sending email to ${to}`);
    
    // Replace variables in email template
    let body = bodyTemplate;
    for (const [key, value] of Object.entries(this.context.variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    
    // Here you would integrate with your email service (SMTP credentials)
    await this.log(node.id, 'info', 'Email sent successfully');
    
    return { sent: true, to, subject };
  }

  async executeCondition(node: WorkflowNode): Promise<string[]> {
    const { expression } = node.params;
    
    await this.log(node.id, 'info', `Evaluating condition: ${expression}`);
    
    // Simple expression evaluation (you might want to use a more robust evaluator)
    try {
      // Replace variables in expression
      let evalExpression = expression;
      for (const [key, value] of Object.entries(this.context.variables)) {
        evalExpression = evalExpression.replace(new RegExp(`{{${key}}}`, 'g'), JSON.stringify(value));
      }
      
      const result = eval(evalExpression);
      await this.log(node.id, 'info', `Condition evaluated to: ${result}`);
      
      // Return appropriate next nodes based on condition
      if (result) {
        return node.next.slice(0, 1); // First next node for true
      } else {
        return node.next.slice(1); // Remaining next nodes for false
      }
    } catch (error) {
      await this.log(node.id, 'error', `Condition evaluation failed: ${error.message}`);
      throw error;
    }
  }

  async executeDelay(node: WorkflowNode): Promise<any> {
    const { duration } = node.params; // duration in milliseconds
    
    await this.log(node.id, 'info', `Delaying execution for ${duration}ms`);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    await this.log(node.id, 'info', 'Delay completed');
    return { delayed: duration };
  }

  async executeNode(node: WorkflowNode): Promise<any> {
    await this.log(node.id, 'info', `Executing node of type: ${node.type}`);
    
    let result: any;
    
    switch (node.type) {
      case 'httpRequest':
        result = await this.executeHttpRequest(node);
        break;
      case 'gptPrompt':
        result = await this.executeGptPrompt(node);
        break;
      case 'email':
        result = await this.executeEmail(node);
        break;
      case 'condition':
        return await this.executeCondition(node); // Returns next node IDs
      case 'delay':
        result = await this.executeDelay(node);
        break;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
    
    // Store result in context variables
    this.context.variables[`${node.id}_result`] = result;
    
    return node.next; // Return next node IDs
  }

  async execute(workflow: WorkflowDefinition): Promise<void> {
    await this.updateExecutionStatus('running');
    await this.log('workflow', 'info', `Starting workflow execution: ${workflow.name}`);
    
    try {
      const nodesToExecute = [workflow.start];
      const executedNodes = new Set<string>();
      
      while (nodesToExecute.length > 0) {
        const currentNodeId = nodesToExecute.shift()!;
        
        if (executedNodes.has(currentNodeId)) {
          continue; // Avoid infinite loops
        }
        
        const node = workflow.nodes.find(n => n.id === currentNodeId);
        if (!node) {
          throw new Error(`Node not found: ${currentNodeId}`);
        }
        
        executedNodes.add(currentNodeId);
        
        const nextNodes = await this.executeNode(node);
        
        if (Array.isArray(nextNodes)) {
          nodesToExecute.push(...nextNodes);
        }
      }
      
      await this.log('workflow', 'info', 'Workflow execution completed successfully');
      await this.updateExecutionStatus('completed', undefined, this.context.variables);
      
    } catch (error) {
      await this.log('workflow', 'error', `Workflow execution failed: ${error.message}`);
      await this.updateExecutionStatus('failed', error.message);
      throw error;
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { workflowId, inputData = {} } = await req.json();
    
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', user.id)
      .single();
    
    if (workflowError || !workflow) {
      throw new Error('Workflow not found or access denied');
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabase
      .from('executions')
      .insert({
        workflow_id: workflowId,
        status: 'pending'
      })
      .select()
      .single();
    
    if (executionError || !execution) {
      throw new Error('Failed to create execution record');
    }

    // Parse workflow definition
    const workflowDefinition: WorkflowDefinition = workflow.json_definition;
    
    if (!workflowDefinition.nodes || !workflowDefinition.start) {
      throw new Error('Invalid workflow definition');
    }

    // Execute workflow
    const executor = new WorkflowExecutor(supabase, execution.id, workflowId, inputData);
    await executor.execute(workflowDefinition);

    return new Response(JSON.stringify({
      executionId: execution.id,
      status: 'completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in workflow execution engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});