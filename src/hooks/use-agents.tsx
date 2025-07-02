
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Agent {
  id: string;
  name: string;
  type: 'text_summarizer' | 'data_extractor' | 'research_assistant' | 'custom';
  description: string;
  configuration: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAgents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (name: string, type: Agent['type'], description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          user_id: user.id,
          name,
          type,
          description,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      setAgents(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAgents(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [user]);

  return {
    agents,
    loading,
    createAgent,
    updateAgent,
    deleteAgent,
    refetch: fetchAgents
  };
};
