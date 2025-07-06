
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ExecutionResult {
  executionId: string;
  status: 'completed' | 'failed';
  output: any;
}

export const useWorkflowExecutor = () => {
  const [executing, setExecuting] = useState(false);
  const { user } = useAuth();

  const executeWorkflow = async (workflowId: string, inputData?: any): Promise<ExecutionResult> => {
    if (!user) throw new Error('User not authenticated');

    setExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('workflow-executor', {
        body: { 
          workflowId,
          inputData: inputData || {}
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    } finally {
      setExecuting(false);
    }
  };

  const getExecutionHistory = async (workflowId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching execution history:', error);
      return [];
    }
  };

  return {
    executeWorkflow,
    getExecutionHistory,
    executing
  };
};
