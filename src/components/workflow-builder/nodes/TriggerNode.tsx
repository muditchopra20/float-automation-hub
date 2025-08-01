import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

interface TriggerNodeData {
  type?: 'manual' | 'webhook' | 'schedule';
  label?: string;
}

function TriggerNode({ data }: { data: TriggerNodeData }) {
  const getTriggerIcon = () => {
    switch (data.type) {
      case 'webhook': return '🔗';
      case 'schedule': return '⏰';
      default: return '▶️';
    }
  };

  return (
    <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-sm min-w-[180px] border-green-200 bg-green-50">
      <div className="flex items-center gap-2 mb-2">
        <Play className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">Trigger</span>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>{getTriggerIcon()}</span>
          <span className="capitalize">{data.type || 'manual'}</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="workflow-handle" />
    </div>
  );
}

export default memo(TriggerNode);