import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Execution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  finished_at: string | null;
  output: any;
  error: string | null;
  created_at: string;
}

export const useExecutions = (workflowId?: string) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExecutions = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('executions')
        .select(`
          *,
          workflows!inner(user_id)
        `)
        .order('created_at', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedExecutions: Execution[] = (data || []).map(execution => ({
        id: execution.id,
        workflow_id: execution.workflow_id,
        status: execution.status,
        started_at: execution.started_at,
        finished_at: execution.finished_at,
        output: execution.output,
        error: execution.error,
        created_at: execution.created_at
      }));
      
      setExecutions(transformedExecutions);
    } catch (error) {
      console.error('Error fetching executions:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string, inputData?: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('workflow-execution-engine', {
        body: { 
          workflowId,
          inputData: inputData || {}
        }
      });

      if (error) throw error;
      
      // Refresh executions to show the new one
      await fetchExecutions();
      
      return data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  };

  const getExecutionLogs = async (executionId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('execution_id', executionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching execution logs:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [user, workflowId]);

  return {
    executions,
    loading,
    executeWorkflow,
    getExecutionLogs,
    refetch: fetchExecutions
  };
};