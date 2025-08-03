import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface N8nWorkflow {
  id: string;
  name: string;
  nodes: any[];
  connections: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecutionResult {
  id: string;
  finished: boolean;
  mode: string;
  status: 'success' | 'error' | 'canceled' | 'waiting' | 'running';
  data?: any;
  error?: string;
}

export const useN8nIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Get n8n instance URL and API key from environment or secrets
  const getN8nConfig = () => {
    // These would be set via the secret form
    const apiKey = process.env.N8N_API_KEY || '';
    const instanceUrl = process.env.N8N_INSTANCE_URL || '';
    
    if (!apiKey || !instanceUrl) {
      throw new Error('n8n configuration missing. Please add N8N_API_KEY and N8N_INSTANCE_URL.');
    }
    
    return { apiKey, instanceUrl };
  };

  const makeN8nRequest = async (endpoint: string, options: RequestInit = {}) => {
    const { apiKey, instanceUrl } = getN8nConfig();
    
    const response = await fetch(`${instanceUrl}/api/v1${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`n8n API error: ${response.status} - ${error}`);
    }

    return response.json();
  };

  const createWorkflow = async (workflowData: {
    name: string;
    nodes: any[];
    connections: any;
  }): Promise<N8nWorkflow> => {
    setLoading(true);
    try {
      const workflow = await makeN8nRequest('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: workflowData.name,
          nodes: workflowData.nodes,
          connections: workflowData.connections,
          active: false,
        }),
      });

      toast({
        title: "Workflow Created",
        description: `"${workflowData.name}" has been created in n8n!`,
      });

      return workflow;
    } catch (error) {
      toast({
        title: "Failed to Create Workflow",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<N8nWorkflow>): Promise<N8nWorkflow> => {
    setLoading(true);
    try {
      const workflow = await makeN8nRequest(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      toast({
        title: "Workflow Updated",
        description: "Workflow has been updated in n8n!",
      });

      return workflow;
    } catch (error) {
      toast({
        title: "Failed to Update Workflow",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const activateWorkflow = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await makeN8nRequest(`/workflows/${id}/activate`, {
        method: 'POST',
      });

      toast({
        title: "Workflow Activated",
        description: "Workflow is now active and ready to run!",
      });
    } catch (error) {
      toast({
        title: "Failed to Activate Workflow",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (id: string, inputData?: any): Promise<N8nExecutionResult> => {
    setExecuting(true);
    try {
      const execution = await makeN8nRequest(`/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify({
          workflowData: inputData || {},
        }),
      });

      toast({
        title: "Workflow Executed",
        description: "Workflow has been started successfully!",
      });

      return execution;
    } catch (error) {
      toast({
        title: "Failed to Execute Workflow",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setExecuting(false);
    }
  };

  const getWorkflows = async (): Promise<N8nWorkflow[]> => {
    setLoading(true);
    try {
      const result = await makeN8nRequest('/workflows');
      return result.data || [];
    } catch (error) {
      toast({
        title: "Failed to Fetch Workflows",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getWorkflow = async (id: string): Promise<N8nWorkflow> => {
    setLoading(true);
    try {
      return await makeN8nRequest(`/workflows/${id}`);
    } catch (error) {
      toast({
        title: "Failed to Fetch Workflow",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const convertMessageToN8nWorkflow = async (message: string, context?: any) => {
    // This will convert natural language to n8n workflow JSON format
    // We'll use the existing nl-to-workflow function but modify it for n8n format
    setLoading(true);
    try {
      // Call our edge function to convert to n8n format
      // Use Supabase edge function instead
      const { data, error } = await supabase.functions.invoke('nl-to-n8n', {
        body: {
          message,
          context: context || {},
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to convert message to workflow');
      }
      
      // Create the workflow in n8n
      const n8nWorkflow = await createWorkflow({
        name: data.name,
        nodes: data.nodes,
        connections: data.connections,
      });

      return {
        workflow: n8nWorkflow,
        summary: data.summary,
        message: data.message,
      };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createWorkflow,
    updateWorkflow,
    activateWorkflow,
    executeWorkflow,
    getWorkflows,
    getWorkflow,
    convertMessageToN8nWorkflow,
    loading,
    executing,
  };
};