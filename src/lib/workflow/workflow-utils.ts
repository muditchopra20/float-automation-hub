import type { WorkflowDefinition, WorkflowNode, NodeConnections } from '@/types/workflow';

// Utility functions for workflow manipulation and conversion

export function createSimpleWorkflow(
  name: string,
  nodes: Omit<WorkflowNode, 'id'>[],
  userId: string
): WorkflowDefinition {
  const workflowNodes: Record<string, WorkflowNode> = {};
  const connections: Record<string, NodeConnections> = {};
  
  // Generate node IDs and build linear connections
  const nodeIds = nodes.map((_, index) => `node-${index + 1}`);
  
  nodes.forEach((node, index) => {
    const nodeId = nodeIds[index];
    workflowNodes[nodeId] = {
      ...node,
      id: nodeId,
      next: index < nodes.length - 1 ? nodeIds[index + 1] : undefined
    };
  });

  return {
    id: crypto.randomUUID(),
    name,
    nodes: workflowNodes,
    connections,
    active: true,
    start: nodeIds[0],
    settings: {
      executionOrder: 'v1',
      maxRetries: 3,
      timeout: 300000 // 5 minutes
    }
  };
}

export function addNodeToWorkflow(
  workflow: WorkflowDefinition,
  node: Omit<WorkflowNode, 'id'>,
  afterNodeId?: string
): WorkflowDefinition {
  const newNodeId = `node-${Date.now()}`;
  const newNode: WorkflowNode = {
    ...node,
    id: newNodeId
  };

  const updatedNodes = {
    ...workflow.nodes,
    [newNodeId]: newNode
  };

  const updatedConnections = { ...workflow.connections };

  if (afterNodeId && workflow.nodes[afterNodeId]) {
    // Insert after specific node
    const afterNode = workflow.nodes[afterNodeId];
    updatedNodes[afterNodeId] = {
      ...afterNode,
      next: newNodeId
    };
    newNode.next = afterNode.next;
  }

  return {
    ...workflow,
    nodes: updatedNodes,
    connections: updatedConnections
  };
}

export function removeNodeFromWorkflow(
  workflow: WorkflowDefinition,
  nodeId: string
): WorkflowDefinition {
  const { [nodeId]: removedNode, ...remainingNodes } = workflow.nodes;
  
  if (!removedNode) return workflow;

  // Update connections - find nodes that point to this node and redirect them
  const updatedNodes = { ...remainingNodes };
  
  for (const [id, node] of Object.entries(updatedNodes)) {
    if (node.next === nodeId) {
      updatedNodes[id] = {
        ...node,
        next: removedNode.next
      };
    }
  }

  // Remove from connections
  const { [nodeId]: removedConnections, ...remainingConnections } = workflow.connections;

  return {
    ...workflow,
    nodes: updatedNodes,
    connections: remainingConnections,
    start: workflow.start === nodeId ? undefined : workflow.start
  };
}

export function validateWorkflowStructure(workflow: WorkflowDefinition): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for orphaned nodes
  const reachableNodes = new Set<string>();
  const queue: string[] = [];
  
  if (workflow.start && workflow.nodes[workflow.start]) {
    queue.push(workflow.start);
  }

  // Find all trigger nodes as potential start points
  Object.values(workflow.nodes).forEach(node => {
    if (node.type.startsWith('trigger.')) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (reachableNodes.has(currentId)) continue;
    
    reachableNodes.add(currentId);
    const currentNode = workflow.nodes[currentId];
    
    if (currentNode?.next && workflow.nodes[currentNode.next]) {
      queue.push(currentNode.next);
    }
  }

  // Check for unreachable nodes
  Object.keys(workflow.nodes).forEach(nodeId => {
    if (!reachableNodes.has(nodeId)) {
      warnings.push(`Node '${nodeId}' is not reachable from any start node`);
    }
  });

  // Check for missing required parameters
  Object.values(workflow.nodes).forEach(node => {
    switch (node.type) {
      case 'action.http_request':
        if (!node.parameters.url) {
          errors.push(`HTTP Request node '${node.id}' missing required 'url' parameter`);
        }
        break;
      case 'action.gpt_prompt':
        if (!node.parameters.prompt) {
          errors.push(`GPT Prompt node '${node.id}' missing required 'prompt' parameter`);
        }
        break;
      case 'action.email':
        if (!node.parameters.to || !node.parameters.subject) {
          errors.push(`Email node '${node.id}' missing required 'to' or 'subject' parameters`);
        }
        break;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function convertNLRequestToNodes(request: string): Omit<WorkflowNode, 'id'>[] {
  // This is a simplified converter - the actual implementation would use AI
  const nodes: Omit<WorkflowNode, 'id'>[] = [];
  
  // Manual trigger as default start
  nodes.push({
    type: 'trigger.manual',
    typeVersion: 1,
    name: 'Manual Trigger',
    parameters: {}
  });

  // Detect common patterns and convert to nodes
  const lowerRequest = request.toLowerCase();
  
  if (lowerRequest.includes('send email') || lowerRequest.includes('email')) {
    nodes.push({
      type: 'action.email',
      typeVersion: 1,
      name: 'Send Email',
      parameters: {
        to: '{{ user.email }}',
        subject: 'Automated Email',
        body: 'This email was sent by your workflow automation.'
      }
    });
  }
  
  if (lowerRequest.includes('http') || lowerRequest.includes('api') || lowerRequest.includes('request')) {
    nodes.push({
      type: 'action.http_request',
      typeVersion: 1,
      name: 'HTTP Request',
      parameters: {
        method: 'GET',
        url: 'https://api.example.com/data'
      }
    });
  }
  
  if (lowerRequest.includes('gpt') || lowerRequest.includes('ai') || lowerRequest.includes('analyze')) {
    nodes.push({
      type: 'action.gpt_prompt',
      typeVersion: 1,
      name: 'AI Analysis',
      parameters: {
        prompt: 'Analyze the following data: {{ $prev.json }}',
        model: 'gpt-4o-mini'
      }
    });
  }

  return nodes;
}

export function generateWorkflowSummary(workflow: WorkflowDefinition): string {
  const nodeCount = Object.keys(workflow.nodes).length;
  const triggerNodes = Object.values(workflow.nodes).filter(n => n.type.startsWith('trigger.'));
  const actionNodes = Object.values(workflow.nodes).filter(n => n.type.startsWith('action.'));
  
  let summary = `Workflow "${workflow.name}" with ${nodeCount} nodes:\n`;
  
  if (triggerNodes.length > 0) {
    summary += `• Triggers: ${triggerNodes.map(n => n.name).join(', ')}\n`;
  }
  
  if (actionNodes.length > 0) {
    summary += `• Actions: ${actionNodes.map(n => n.name).join(', ')}\n`;
  }
  
  summary += `• Status: ${workflow.active ? 'Active' : 'Inactive'}`;
  
  return summary;
}