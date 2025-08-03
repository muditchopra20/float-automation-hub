import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MCPWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
}

interface MCPCreateWorkflowRequest {
  name: string;
  nodes: any[];
  connections?: any;
  active?: boolean;
  settings?: any;
}

interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useMCPN8n = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getMCPConfig = () => {
    const apiKey = localStorage.getItem('n8n_api_key');
    const instanceUrl = localStorage.getItem('n8n_instance_url');
    
    if (!apiKey || !instanceUrl) {
      throw new Error('N8N_API_KEY and N8N_INSTANCE_URL must be configured in your integrations');
    }
    
    return { apiKey, instanceUrl };
  };

  const callMCPServer = async (method: string, params: any = {}): Promise<MCPResponse> => {
    const { apiKey, instanceUrl } = getMCPConfig();
    
    try {
      // This would typically connect to your MCP server
      // For now, we'll simulate the MCP interface while using direct n8n API calls
      const response = await fetch(`${instanceUrl}/api/v1/workflows`, {
        method: method === 'get_workflows' ? 'GET' : 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: method !== 'get_workflows' ? JSON.stringify(params) : undefined,
      });

      if (!response.ok) {
        throw new Error(`n8n API error: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('MCP call failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const createWorkflow = async (workflowData: MCPCreateWorkflowRequest): Promise<MCPWorkflow> => {
    setLoading(true);
    try {
      const result = await callMCPServer('create_workflow', workflowData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create workflow');
      }

      toast({
        title: "Workflow Created",
        description: `Successfully created workflow: ${workflowData.name}`,
      });

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getWorkflows = async (): Promise<MCPWorkflow[]> => {
    setLoading(true);
    try {
      const result = await callMCPServer('get_workflows');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch workflows');
      }

      return result.data.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workflows';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const activateWorkflow = async (workflowId: string): Promise<void> => {
    setLoading(true);
    try {
      const { apiKey, instanceUrl } = getMCPConfig();
      
      const response = await fetch(`${instanceUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to activate workflow: ${response.status}`);
      }

      toast({
        title: "Workflow Activated",
        description: "The workflow is now active and ready to run",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string, inputData: any = {}): Promise<any> => {
    setLoading(true);
    try {
      const { apiKey, instanceUrl } = getMCPConfig();
      
      const response = await fetch(`${instanceUrl}/api/v1/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: inputData }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Workflow Executed",
        description: "The workflow has been executed successfully",
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const convertMessageToWorkflow = async (message: string, context: any = {}): Promise<{
    workflow: MCPWorkflow;
    summary: string;
    message: string;
  }> => {
    setLoading(true);
    try {
      // Call the nl-to-n8n edge function to convert message to workflow
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('nl-to-n8n', {
        body: { message, context }
      });

      if (error) {
        throw new Error(error.message || 'Failed to convert message to workflow');
      }

      const workflowData = data;
      
      // Create the workflow using MCP
      const workflow = await createWorkflow({
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections || {},
        active: false,
        settings: workflowData.settings || {}
      });

      return {
        workflow,
        summary: workflowData.summary || `Created workflow: ${workflowData.name}`,
        message: workflowData.message || `Workflow ${workflowData.name} has been created successfully!`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert message to workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createWorkflow,
    getWorkflows,
    activateWorkflow,
    executeWorkflow,
    convertMessageToWorkflow,
    loading
  };
};