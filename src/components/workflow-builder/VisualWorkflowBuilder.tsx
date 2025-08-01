import { WorkflowCanvas } from './WorkflowCanvas';
import { NodePalette } from './NodePalette';

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
    </div>
  );
}