
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4 animate-fade-in dark:bg-gray-800 dark:border-gray-700 dark:shadow-md dark:shadow-black/10">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 bg-urban-blue rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 dark:bg-urban-blue/90 dark:shadow-glow">
          {step}
        </div>
        <div>
          <div className="text-sm font-medium text-urban-blue dark:text-urban-blue">{app}</div>
          <div className="text-gray-700 dark:text-gray-300">{action}</div>
        </div>
      </div>
    </div>
  );
};
