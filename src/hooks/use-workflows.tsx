
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  configuration: any;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWorkflows = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (name: string, description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          user_id: user.id,
          name,
          description,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;
      setWorkflows(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setWorkflows(prev => prev.map(w => w.id === id ? data : w));
      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [user]);

  return {
    workflows,
    loading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    refetch: fetchWorkflows
  };
};
