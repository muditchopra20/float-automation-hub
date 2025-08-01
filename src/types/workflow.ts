// Core Workflow Definition Types
export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: Record<string, WorkflowNode>;
  connections: Record<string, NodeConnections>;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  active: boolean;
  start?: string; // Starting node ID
}

export interface WorkflowNode {
  id: string;
  type: string;
  typeVersion: number;
  name: string;
  parameters: Record<string, any>;
  credentials?: CredentialRef;
  position?: { x: number; y: number };
  next?: string; // Simple linear flow - next node ID
}

export interface NodeConnections {
  main?: Array<Array<Connection>>;
}

export interface Connection {
  node: string;    // target node ID
  type: string;    // e.g., "main", "conditionallyTrue", "trueBranch"
  index: number;   // output index of the source node
}

export interface CredentialRef {
  id: string;
  name: string;
  type: string;
}

export interface WorkflowSettings {
  executionOrder?: 'v1' | 'v2';
  timezone?: string;
  maxRetries?: number;
  timeout?: number;
}

// Node Execution Types
export interface NodeExecutionData {
  json: any;
  binary?: Record<string, Buffer>;
  metadata?: Record<string, any>;
}

export interface NodeExecutionResult {
  outputData: NodeExecutionData[][];
  next?: string | string[]; // Next node(s) to execute
  paused?: boolean;         // Whether execution should pause
  error?: string;           // Error message if failed
  metadata?: Record<string, any>;
}

// Execution Context
export interface ExecutionContext {
  workflow: WorkflowDefinition;
  executionId: string;
  runId: string;
  userId: string;
  credentialsHelper: CredentialsHelper;
  settings: ExecutionSettings;
  staticData: Record<string, any>;
  variables: Record<string, any>; // Workflow variables/context
}

export interface ExecutionSettings {
  dataPersistence?: boolean;
  maxRetryCount?: number;
  concurrencyLimit?: number;
  timeout?: number;
}

export interface CredentialsHelper {
  get(node: WorkflowNode, type: string): Promise<any>;
  decrypt(encryptedValue: string): Promise<string>;
}

// Node Handler System
export interface NodeHandler {
  execute(
    inputData: NodeExecutionData[],
    node: WorkflowNode,
    context: ExecutionContext
  ): Promise<NodeExecutionResult>;
  
  validate?(node: WorkflowNode): boolean;
  getDescription?(): string;
}

// Execution Stack Item
export interface ExecutionStackItem {
  node: WorkflowNode;
  inputData: NodeExecutionData[];
}

// Node Type Registry
export interface NodeTypeInfo {
  handler: NodeHandler;
  description: string;
  version: number;
  category: 'trigger' | 'action' | 'condition' | 'utility';
}

// Built-in Node Types
export type NodeType = 
  | 'trigger.webhook'
  | 'trigger.manual'
  | 'trigger.schedule'
  | 'action.http_request'
  | 'action.gpt_prompt'
  | 'action.email'
  | 'condition.if'
  | 'condition.switch'
  | 'utility.delay'
  | 'utility.set_variable'
  | 'utility.transform_data';

// Execution Status
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

// Log Level
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';