import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types matching our workflow DSL
interface WorkflowNode {
  id: string;
  type: string;
  typeVersion: number;
  name: string;
  parameters: Record<string, any>;
  credentials?: CredentialRef;
  next?: string;
}

interface CredentialRef {
  id: string;
  name: string;
  type: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: Record<string, WorkflowNode>;
  connections: Record<string, any>;
  settings?: WorkflowSettings;
  active: boolean;
  start?: string;
}

interface WorkflowSettings {
  executionOrder?: 'v1' | 'v2';
  maxRetries?: number;
  timeout?: number;
}

interface NodeExecutionData {
  json: any;
  binary?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface NodeExecutionResult {
  outputData: NodeExecutionData[][];
  next?: string | string[];
  paused?: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface ExecutionContext {
  workflow: WorkflowDefinition;
  executionId: string;
  userId: string;
  variables: Record<string, any>;
  nodeOutputs: Record<string, any>;
  supabase: any;
}

// Expression evaluator for {{ variable }} templating
class ExpressionEvaluator {
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  evaluate(expression: string): any {
    if (typeof expression !== 'string') return expression;
    
    const templateRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    return expression.replace(templateRegex, (match, expr) => {
      try {
        return this.evaluateExpression(expr.trim());
      } catch (error) {
        console.warn(`Failed to evaluate expression: ${expr}`, error);
        return match;
      }
    });
  }

  evaluateObject(obj: any): any {
    if (typeof obj === 'string') return this.evaluate(obj);
    if (Array.isArray(obj)) return obj.map(item => this.evaluateObject(item));
    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.evaluateObject(value);
      }
      return result;
    }
    return obj;
  }

  private evaluateExpression(expr: string): any {
    if (expr.startsWith('$prev')) {
      return this.getNestedValue(this.context.$prev, expr.slice(5));
    }
    if (expr.startsWith('user.')) {
      return this.getNestedValue(this.context.user, expr.slice(5));
    }
    if (expr.startsWith('workflow.')) {
      return this.getNestedValue(this.context.workflow, expr.slice(9));
    }
    return this.getNestedValue(this.context, expr);
  }

  private getNestedValue(obj: any, path: string): any {
    if (!path || path === '') return obj;
    if (path.startsWith('.')) path = path.slice(1);
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    
    return current;
  }
}

// Node Handlers
class NodeHandlerRegistry {
  private handlers: Map<string, any> = new Map();

  constructor() {
    this.registerBuiltInHandlers();
  }

  private registerBuiltInHandlers() {
    this.handlers.set('trigger.manual', new ManualTriggerHandler());
    this.handlers.set('trigger.webhook', new WebhookTriggerHandler());
    this.handlers.set('trigger.schedule', new ScheduleTriggerHandler());
    this.handlers.set('action.http_request', new HttpRequestHandler());
    this.handlers.set('action.gpt_prompt', new GptPromptHandler());
    this.handlers.set('action.email', new EmailHandler());
    this.handlers.set('condition.if', new ConditionHandler());
    this.handlers.set('utility.delay', new DelayHandler());
    this.handlers.set('utility.set_variable', new SetVariableHandler());
  }

  getHandler(type: string): any {
    const handler = this.handlers.get(type);
    if (!handler) throw new Error(`No handler registered for node type: ${type}`);
    return handler;
  }
}

// Base Node Handler
abstract class BaseNodeHandler {
  abstract execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult>;
  
  protected evaluateParameters(parameters: Record<string, any>, context: ExecutionContext): Record<string, any> {
    const evaluator = new ExpressionEvaluator({
      $prev: context.nodeOutputs.$prev,
      user: { id: context.userId },
      workflow: context.variables,
      ...context.variables
    });
    
    return evaluator.evaluateObject(parameters);
  }
}

// Trigger Handlers
class ManualTriggerHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    return {
      outputData: [[{ json: { triggered: true, timestamp: new Date().toISOString() } }]]
    };
  }
}

class WebhookTriggerHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    return {
      outputData: [[{ json: { webhook: params, data: inputData[0]?.json || {} } }]]
    };
  }
}

class ScheduleTriggerHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    return {
      outputData: [[{ json: { scheduled: true, interval: params.interval, timestamp: new Date().toISOString() } }]]
    };
  }
}

// Action Handlers
class HttpRequestHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    
    try {
      const response = await fetch(params.url, {
        method: params.method || 'GET',
        headers: params.headers || {},
        body: params.body ? JSON.stringify(params.body) : undefined,
      });
      
      const data = await response.json();
      
      return {
        outputData: [[{ 
          json: data,
          metadata: { 
            status: response.status, 
            headers: Object.fromEntries(response.headers.entries()) 
          }
        }]]
      };
    } catch (error) {
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  }
}

class GptPromptHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model || 'gpt-4o-mini',
          messages: [
            { role: 'user', content: params.prompt }
          ],
          temperature: params.temperature || 0.7,
        }),
      });
      
      const data = await response.json();
      const result = data.choices[0].message.content;
      
      return {
        outputData: [[{ json: { result, usage: data.usage } }]]
      };
    } catch (error) {
      throw new Error(`GPT Prompt failed: ${error.message}`);
    }
  }
}

class EmailHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    
    // For now, just simulate email sending - in production you'd integrate with email service
    console.log(`Sending email to ${params.to}: ${params.subject}`);
    
    return {
      outputData: [[{ 
        json: { 
          sent: true,
          to: params.to,
          subject: params.subject,
          timestamp: new Date().toISOString()
        }
      }]]
    };
  }
}

// Condition Handlers
class ConditionHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    
    // Simple condition evaluation - in production you'd want a proper expression parser
    const condition = params.condition;
    const result = this.evaluateCondition(condition, context);
    
    return {
      outputData: [[{ json: { condition, result } }]],
      next: result ? params.trueBranch : params.falseBranch
    };
  }
  
  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // Simple condition evaluation - extend as needed
    if (condition.includes('===')) {
      const [left, right] = condition.split('===').map(s => s.trim());
      return left === right;
    }
    if (condition.includes('!==')) {
      const [left, right] = condition.split('!==').map(s => s.trim());
      return left !== right;
    }
    return Boolean(condition);
  }
}

// Utility Handlers
class DelayHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    const duration = params.duration || 1000;
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return {
      outputData: [[{ json: { delayed: duration, timestamp: new Date().toISOString() } }]]
    };
  }
}

class SetVariableHandler extends BaseNodeHandler {
  async execute(inputData: NodeExecutionData[], node: WorkflowNode, context: ExecutionContext): Promise<NodeExecutionResult> {
    const params = this.evaluateParameters(node.parameters, context);
    
    context.variables[params.name] = params.value;
    
    return {
      outputData: [[{ json: { variableSet: params.name, value: params.value } }]]
    };
  }
}

// Main Workflow Executor
class WorkflowExecutor {
  private supabase: any;
  private executionId: string;
  private workflowId: string;
  private userId: string;
  private inputData: Record<string, any>;
  private nodeRegistry: NodeHandlerRegistry;

  constructor(supabase: any, executionId: string, workflowId: string, userId: string, inputData: Record<string, any> = {}) {
    this.supabase = supabase;
    this.executionId = executionId;
    this.workflowId = workflowId;
    this.userId = userId;
    this.inputData = inputData;
    this.nodeRegistry = new NodeHandlerRegistry();
  }

  async log(nodeId: string, level: 'debug' | 'info' | 'warn' | 'error', message: string) {
    try {
      await this.supabase.from('execution_logs').insert({
        execution_id: this.executionId,
        node_id: nodeId,
        level,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  async updateExecutionStatus(status: 'pending' | 'running' | 'completed' | 'failed', error?: string, output?: any) {
    const updateData: any = { 
      status,
      cursor: null // Reset cursor when completing or failing
    };
    
    if (status === 'completed') {
      updateData.finished_at = new Date().toISOString();
      updateData.output = output || {};
    }
    
    if (status === 'failed') {
      updateData.finished_at = new Date().toISOString();
      updateData.error = error;
    }

    await this.supabase.from('executions').update(updateData).eq('id', this.executionId);
    
    // Publish real-time update
    try {
      await this.supabase.channel(`execution:${this.executionId}`).send({
        type: 'broadcast',
        event: 'execution_update',
        payload: { executionId: this.executionId, status, error, output }
      });
    } catch (error) {
      console.warn('Failed to publish real-time update:', error);
    }
  }

  async execute(workflow: WorkflowDefinition): Promise<void> {
    await this.log('system', 'info', `Starting workflow execution: ${workflow.name}`);
    await this.updateExecutionStatus('running');

    const context: ExecutionContext = {
      workflow,
      executionId: this.executionId,
      userId: this.userId,
      variables: { ...this.inputData },
      nodeOutputs: {},
      supabase: this.supabase
    };

    try {
      let currentNodeId = workflow.start;
      if (!currentNodeId) {
        throw new Error('No start node defined in workflow');
      }

      while (currentNodeId) {
        const node = workflow.nodes[currentNodeId];
        if (!node) {
          throw new Error(`Node not found: ${currentNodeId}`);
        }

        await this.log(node.id, 'info', `Executing node: ${node.name}`);
        
        // Update cursor for pause/resume functionality
        await this.supabase.from('executions').update({ 
          cursor: node.id,
          context: context.variables 
        }).eq('id', this.executionId);

        const handler = this.nodeRegistry.getHandler(node.type);
        const inputData: NodeExecutionData[] = [{ json: context.nodeOutputs.$prev || {} }];
        
        const result = await handler.execute(inputData, node, context);
        
        // Store node output for next nodes
        context.nodeOutputs[node.id] = result.outputData[0]?.[0]?.json;
        context.nodeOutputs.$prev = result.outputData[0]?.[0]?.json;

        await this.log(node.id, 'info', `Node completed: ${node.name}`);

        // Determine next node
        if (result.next) {
          currentNodeId = Array.isArray(result.next) ? result.next[0] : result.next;
        } else if (node.next) {
          currentNodeId = node.next;
        } else {
          currentNodeId = null; // End of workflow
        }

        if (result.paused) {
          await this.log(node.id, 'info', 'Workflow paused for user input');
          await this.updateExecutionStatus('paused');
          return;
        }
      }

      await this.log('system', 'info', 'Workflow execution completed successfully');
      await this.updateExecutionStatus('completed', undefined, context.nodeOutputs);

    } catch (error) {
      await this.log('system', 'error', `Workflow execution failed: ${error.message}`);
      await this.updateExecutionStatus('failed', error.message);
      throw error;
    }
  }
}

// HTTP handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

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
        status: 'pending',
        started_at: new Date().toISOString()
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
    const executor = new WorkflowExecutor(supabase, execution.id, workflowId, user.id, inputData);
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