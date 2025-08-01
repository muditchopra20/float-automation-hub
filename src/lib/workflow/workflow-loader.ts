import type { WorkflowDefinition, WorkflowNode } from '@/types/workflow';
import { nodeRegistry } from './node-registry';

export class Workflow {
  constructor(
    private definition: WorkflowDefinition
  ) {
    this.validate();
  }

  validate(): void {
    // Ensure all referenced node types are registered
    for (const [nodeId, node] of Object.entries(this.definition.nodes)) {
      if (!nodeRegistry.isTypeRegistered(node.type)) {
        throw new Error(`Unknown node type '${node.type}' in node '${nodeId}'`);
      }

      // Validate node parameters if handler supports it
      const handler = nodeRegistry.getHandler(node.type);
      if (handler.validate && !handler.validate(node)) {
        throw new Error(`Invalid parameters for node '${nodeId}' of type '${node.type}'`);
      }
    }

    // Check that all connection targets exist
    for (const [sourceId, connections] of Object.entries(this.definition.connections)) {
      if (!this.definition.nodes[sourceId]) {
        throw new Error(`Connection source node '${sourceId}' does not exist`);
      }

      connections.main?.forEach((outputConnections, outputIndex) => {
        outputConnections.forEach((connection) => {
          if (!this.definition.nodes[connection.node]) {
            throw new Error(`Connection target node '${connection.node}' does not exist`);
          }
        });
      });
    }

    // Validate that there's at least one start node if no explicit start is defined
    if (!this.definition.start && this.getStartNodes().length === 0) {
      throw new Error('Workflow must have at least one start node or explicit start node');
    }
  }

  getStartNodes(): WorkflowNode[] {
    if (this.definition.start) {
      const startNode = this.definition.nodes[this.definition.start];
      return startNode ? [startNode] : [];
    }

    // Find nodes with no incoming connections (triggers)
    const hasIncomingConnections = new Set<string>();
    
    for (const connections of Object.values(this.definition.connections)) {
      connections.main?.forEach((outputConnections) => {
        outputConnections.forEach((connection) => {
          hasIncomingConnections.add(connection.node);
        });
      });
    }

    return Object.values(this.definition.nodes).filter(
      (node) => !hasIncomingConnections.has(node.id) || node.type.startsWith('trigger.')
    );
  }

  getNextNodes(nodeId: string, outputIndex = 0): WorkflowNode[] {
    const node = this.definition.nodes[nodeId];
    if (!node) return [];

    // Simple linear flow using 'next' property
    if (node.next) {
      const nextNode = this.definition.nodes[node.next];
      return nextNode ? [nextNode] : [];
    }

    // Complex flow using connections
    const connections = this.definition.connections[nodeId];
    if (!connections?.main?.[outputIndex]) return [];

    return connections.main[outputIndex]
      .map((connection) => this.definition.nodes[connection.node])
      .filter(Boolean);
  }

  getNode(nodeId: string): WorkflowNode | undefined {
    return this.definition.nodes[nodeId];
  }

  getAllNodes(): WorkflowNode[] {
    return Object.values(this.definition.nodes);
  }

  getDefinition(): WorkflowDefinition {
    return this.definition;
  }

  // Helper method to detect cycles
  hasCycles(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const nextNodes = this.getNextNodes(nodeId);
      for (const nextNode of nextNodes) {
        if (!visited.has(nextNode.id)) {
          if (dfs(nextNode.id)) return true;
        } else if (recursionStack.has(nextNode.id)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const startNode of this.getStartNodes()) {
      if (!visited.has(startNode.id)) {
        if (dfs(startNode.id)) return true;
      }
    }

    return false;
  }

  // Get workflow statistics
  getStats() {
    const nodes = this.getAllNodes();
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalNodes: nodes.length,
      nodesByType,
      hasStart: !!this.definition.start || this.getStartNodes().length > 0,
      hasCycles: this.hasCycles(),
      isActive: this.definition.active
    };
  }
}