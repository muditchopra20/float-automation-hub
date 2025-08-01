import { WorkflowCanvas } from './WorkflowCanvas';
import { NodePalette } from './NodePalette';
import { ExecutionMonitor } from './ExecutionMonitor';

interface VisualWorkflowBuilderProps {
  workflowId?: string;
}

export function VisualWorkflowBuilder({ workflowId }: VisualWorkflowBuilderProps) {
  return (
    <div className="h-full flex">
      <NodePalette />
      <div className="flex-1">
        <WorkflowCanvas workflowId={workflowId} />
      </div>
      <div className="w-80 border-l border-border">
        <ExecutionMonitor workflowId={workflowId} />
      </div>
    </div>
  );
}