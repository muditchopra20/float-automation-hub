import type { NodeHandler, NodeTypeInfo, NodeType } from '@/types/workflow';

export class NodeHandlerRegistry {
  private handlers: Map<string, NodeTypeInfo> = new Map();

  register(type: NodeType, info: NodeTypeInfo): void {
    this.handlers.set(type, info);
  }

  getHandler(type: string): NodeHandler {
    const info = this.handlers.get(type);
    if (!info) {
      throw new Error(`No handler registered for node type: ${type}`);
    }
    return info.handler;
  }

  getTypeInfo(type: string): NodeTypeInfo | undefined {
    return this.handlers.get(type);
  }

  getAllTypes(): Array<{ type: string; info: NodeTypeInfo }> {
    return Array.from(this.handlers.entries()).map(([type, info]) => ({ type, info }));
  }

  isTypeRegistered(type: string): boolean {
    return this.handlers.has(type);
  }

  getTypesByCategory(category: NodeTypeInfo['category']): string[] {
    return Array.from(this.handlers.entries())
      .filter(([, info]) => info.category === category)
      .map(([type]) => type);
  }
}

// Global registry instance
export const nodeRegistry = new NodeHandlerRegistry();