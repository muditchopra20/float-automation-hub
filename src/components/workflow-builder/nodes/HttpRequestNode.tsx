import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';
import NodeExecutionStatus from '../NodeExecutionStatus';

interface HttpRequestNodeData {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  label?: string;
  executionStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'idle';
}

function HttpRequestNode({ data }: { data: HttpRequestNodeData }) {
  return (
    <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-sm min-w-[180px] relative">
      <Handle type="target" position={Position.Top} className="workflow-handle" />
      
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium">HTTP Request</span>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {data.method || 'GET'}
          </span>
        </div>
        {data.url && (
          <div className="truncate max-w-[150px]" title={data.url}>
            {data.url}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="workflow-handle" />
      <NodeExecutionStatus status={data.executionStatus} />
    </div>
  );
}

export default memo(HttpRequestNode);