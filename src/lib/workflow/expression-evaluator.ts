// Simple expression evaluator for workflow variables
// Supports basic templating like {{ variable }}, {{ $prev.json.data }}, etc.

export class ExpressionEvaluator {
  private context: Record<string, any>;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }

  updateContext(newContext: Record<string, any>): void {
    this.context = { ...this.context, ...newContext };
  }

  // Evaluate a single expression like "{{ variable }}"
  evaluate(expression: string): any {
    if (typeof expression !== 'string') {
      return expression;
    }

    // Match {{ ... }} patterns
    const templateRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    
    return expression.replace(templateRegex, (match, expr) => {
      try {
        return this.evaluateExpression(expr.trim());
      } catch (error) {
        console.warn(`Failed to evaluate expression: ${expr}`, error);
        return match; // Return original if evaluation fails
      }
    });
  }

  // Recursively evaluate object with expressions
  evaluateObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.evaluate(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.evaluateObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.evaluateObject(value);
      }
      return result;
    }
    
    return obj;
  }

  private evaluateExpression(expr: string): string {
    // Handle special variables
    if (expr.startsWith('$prev')) {
      return this.getNestedValue(this.context.$prev, expr.slice(5));
    }
    
    if (expr.startsWith('$node(')) {
      const nodeMatch = expr.match(/\$node\(["']([^"']+)["']\)(.*)/);
      if (nodeMatch) {
        const [, nodeId, path] = nodeMatch;
        const nodeData = this.context.$nodes?.[nodeId];
        return this.getNestedValue(nodeData, path);
      }
    }

    if (expr.startsWith('$workflow.')) {
      return this.getNestedValue(this.context.$workflow, expr.slice(10));
    }

    if (expr.startsWith('$execution.')) {
      return this.getNestedValue(this.context.$execution, expr.slice(11));
    }

    // Handle direct context variables
    return this.getNestedValue(this.context, expr);
  }

  private getNestedValue(obj: any, path: string): any {
    if (!path || path === '') return obj;
    
    // Remove leading dot if present
    if (path.startsWith('.')) {
      path = path.slice(1);
    }

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current == null) return undefined;
      
      // Handle array indexing like [0]
      if (part.includes('[') && part.includes(']')) {
        const [prop, index] = part.split('[');
        const indexNum = parseInt(index.replace(']', ''));
        
        if (prop) {
          current = current[prop];
        }
        
        if (Array.isArray(current) && !isNaN(indexNum)) {
          current = current[indexNum];
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }

  // Helper to check if a string contains expressions
  static hasExpressions(str: string): boolean {
    return typeof str === 'string' && /\{\{\s*[^}]+\s*\}\}/.test(str);
  }

  // Helper to extract all expression variables from a string
  static extractVariables(str: string): string[] {
    if (typeof str !== 'string') return [];
    
    const variables: string[] = [];
    const templateRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    let match;
    
    while ((match = templateRegex.exec(str)) !== null) {
      variables.push(match[1].trim());
    }
    
    return variables;
  }
}