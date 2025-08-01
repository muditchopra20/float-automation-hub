import { Globe, Brain, GitBranch, Play, Mail, Clock } from 'lucide-react';

const nodeTypes = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Play,
    description: 'Start point for workflow',
    color: 'text-green-500',
  },
  {
    type: 'httpRequest',
    label: 'HTTP Request',
    icon: Globe,
    description: 'Make API calls',
    color: 'text-blue-500',
  },
  {
    type: 'gptPrompt',
    label: 'GPT Prompt',
    icon: Brain,
    description: 'AI text generation',
    color: 'text-purple-500',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    description: 'Conditional logic',
    color: 'text-orange-500',
  },
  {
    type: 'email',
    label: 'Email',
    icon: Mail,
    description: 'Send emails',
    color: 'text-red-500',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait/pause execution',
    color: 'text-gray-500',
  },
];

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-card border-r border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Node Library</h3>
      
      <div className="space-y-2">
        {nodeTypes.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-grab hover:bg-muted/50 transition-colors"
              draggable
              onDragStart={(event) => onDragStart(event, node.type)}
            >
              <Icon className={`w-4 h-4 ${node.color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{node.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {node.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Drag nodes onto the canvas to build your workflow
        </p>
      </div>
    </div>
  );
}