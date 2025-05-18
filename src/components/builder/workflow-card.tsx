
import React from "react";

interface WorkflowCardProps {
  step: number;
  app: string;
  action: string;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  step,
  app,
  action,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-urban-blue rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {step}
        </div>
        <div>
          <div className="text-sm font-medium text-urban-blue">{app}</div>
          <div className="text-gray-700">{action}</div>
        </div>
      </div>
    </div>
  );
};
