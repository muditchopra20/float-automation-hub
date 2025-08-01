import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import NodeExecutionStatus from '../NodeExecutionStatus';

interface ConditionNodeData {
  condition?: string;
  label?: string;
  executionStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'idle';
}

function ConditionNode({ data }: { data: ConditionNodeData }) {
  return (
    <div className="px-4 py-3 bg-card border border-border rounded-lg shadow-sm min-w-[180px] relative">
      <Handle type="target" position={Position.Top} className="workflow-handle" />
      
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium">Condition</span>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {data.condition && (
          <div className="truncate max-w-[150px]" title={data.condition}>
            {data.condition}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-3">
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="true"
          className="workflow-handle"
          style={{ left: '25%' }}
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="false"
          className="workflow-handle"
          style={{ left: '75%' }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>True</span>
        <span>False</span>
      </div>
      
      <NodeExecutionStatus status={data.executionStatus} />
    </div>
  );
}

export default memo(ConditionNode);