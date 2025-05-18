
import React, { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const workflows = [
  {
    title: "Email Categorization",
    description: "Auto-categorize incoming emails based on content and sender",
    apps: ["Gmail", "Flo AI", "Slack"],
  },
  {
    title: "Customer Support",
    description: "Route and reply to support tickets with AI assistance",
    apps: ["Zendesk", "Flo AI", "Slack"],
  },
  {
    title: "Content Calendar",
    description: "Generate and schedule social media posts from blog content",
    apps: ["WordPress", "Buffer", "Flo AI"],
  },
  {
    title: "Data Processing",
    description: "Extract, transform, and load data from various sources",
    apps: ["Google Sheets", "Flo AI", "Airtable"],
  },
  {
    title: "Meeting Scheduler",
    description: "Coordinate meeting times based on calendar availability",
    apps: ["Google Calendar", "Flo AI", "Zoom"],
  },
  {
    title: "Invoice Processing",
    description: "Extract data from invoices and update accounting software",
    apps: ["Gmail", "Flo AI", "QuickBooks"],
  },
];

export const WorkflowGallery: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="py-20">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Workflow Gallery
            </h2>
            <p className="text-neutral-gray">
              Browse pre-built workflows to get started quickly
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              className="rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x"
        >
          {workflows.map((workflow, index) => (
            <WorkflowCard key={index} workflow={workflow} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface WorkflowCardProps {
  workflow: {
    title: string;
    description: string;
    apps: string[];
  };
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow }) => {
  return (
    <div className="floating-card p-6 min-w-[280px] max-w-[320px] flex-shrink-0 snap-start hover:-translate-y-1 transition-transform">
      <h3 className="text-lg font-medium mb-2">{workflow.title}</h3>
      <p className="text-neutral-gray text-sm mb-4">{workflow.description}</p>
      <div className="flex flex-wrap gap-2">
        {workflow.apps.map((app, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 rounded-md text-xs text-neutral-gray"
          >
            {app}
          </span>
        ))}
      </div>
    </div>
  );
};
