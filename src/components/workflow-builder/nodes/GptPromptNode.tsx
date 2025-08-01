import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Brain } from 'lucide-react';
import NodeExecutionStatus from '../NodeExecutionStatus';

interface GptPromptNodeData {
  prompt?: string;
  model?: string;
  label?: string;
  executionStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'idle';
}

function GptPromptNode({ data }: { data: GptPromptNodeData }) {
  return (
    <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-sm min-w-[180px] relative">
      <Handle type="target" position={Position.Top} className="workflow-handle" />
      
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium">GPT Prompt</span>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
            {data.model || 'gpt-4o-mini'}
          </span>
        </div>
        {data.prompt && (
          <div className="truncate max-w-[150px]" title={data.prompt}>
            {data.prompt.slice(0, 50)}...
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="workflow-handle" />
      <NodeExecutionStatus status={data.executionStatus} />
    </div>
  );
}

export default memo(GptPromptNode);