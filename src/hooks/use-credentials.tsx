import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Credential {
  id: string;
  user_id: string;
  type: 'openai' | 'smtp' | 'webhook' | 'api_key' | 'oauth' | 'database';
  name: string;
  encrypted_value: string;
  created_at: string;
}

export const useCredentials = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCredentials = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCredential = async (type: Credential['type'], name: string, value: string) => {
    if (!user) return;

    try {
      // Note: In production, you should encrypt the value before storing
      const { data, error } = await supabase
        .from('credentials')
        .insert([{
          user_id: user.id,
          type,
          name,
          encrypted_value: value // In production, encrypt this
        }])
        .select()
        .single();

      if (error) throw error;
      setCredentials(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating credential:', error);
      throw error;
    }
  };

  const updateCredential = async (id: string, updates: Partial<Credential>) => {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCredentials(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (error) {
      console.error('Error updating credential:', error);
      throw error;
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting credential:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [user]);

  return {
    credentials,
    loading,
    createCredential,
    updateCredential,
    deleteCredential,
    refetch: fetchCredentials
  };
};