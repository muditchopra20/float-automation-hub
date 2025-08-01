import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import HttpRequestNode from './nodes/HttpRequestNode';
import GptPromptNode from './nodes/GptPromptNode';
import ConditionNode from './nodes/ConditionNode';
import TriggerNode from './nodes/TriggerNode';
import { useWorkflows } from '@/hooks/use-workflows';
import { Button } from '@/components/ui/button';
import { Save, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const nodeTypes = {
  httpRequest: HttpRequestNode,
  gptPrompt: GptPromptNode,
  condition: ConditionNode,
  trigger: TriggerNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 50 },
    data: { type: 'manual', label: 'Start' }
  }
];

const initialEdges: Edge[] = [];

interface WorkflowCanvasProps {
  workflowId?: string;
}

export function WorkflowCanvas({ workflowId }: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { updateWorkflow } = useWorkflows();
  const { toast } = useToast();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 90,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'httpRequest':
        return { method: 'GET', url: 'https://api.example.com' };
      case 'gptPrompt':
        return { prompt: 'You are a helpful assistant...', model: 'gpt-4o-mini' };
      case 'condition':
        return { condition: 'data.status === "success"' };
      default:
        return {};
    }
  };

  const saveWorkflow = async () => {
    if (!workflowId) {
      toast({
        title: "Error",
        description: "No workflow selected to save",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const workflowDefinition = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
      };

      await updateWorkflow(workflowId, {
        json_definition: workflowDefinition,
        configuration: workflowDefinition,
      });

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Workflow Builder</h2>
        <div className="flex items-center gap-2">
          <Button 
            onClick={saveWorkflow} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>
      </div>
      
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Strict}
          fitView
          style={{ backgroundColor: '#fafafa' }}
        >
          <MiniMap />
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}