import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface WorkflowConversionResult {
  workflowId: string;
  workflow: any;
  summary: string;
  message: string;
}

export const useWorkflowConversion = () => {
  const [converting, setConverting] = useState(false);
  const { user } = useAuth();

  const convertMessageToWorkflow = async (message: string, context?: any): Promise<WorkflowConversionResult> => {
    if (!user) throw new Error('User not authenticated');

    setConverting(true);
    try {
      const { data, error } = await supabase.functions.invoke('nl-to-workflow', {
        body: { 
          message,
          context: context || {}
        }
      });

      if (error) {
        if (error.message?.includes('OpenAI API key not configured')) {
          throw new Error('OpenAI API key required. Please add it in your credentials.');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error converting message to workflow:', error);
      throw error;
    } finally {
      setConverting(false);
    }
  };

  return {
    convertMessageToWorkflow,
    converting
  };
};