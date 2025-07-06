
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  configuration: any;
  created_at: string;
  updated_at: string;
}

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchIntegrations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (name: string, type: string, configuration?: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('integration-manager', {
        body: { 
          action: 'connect',
          integrationName: name,
          type: type,
          configuration: configuration || {}
        }
      });

      if (error) throw error;
      
      // Refresh integrations list
      await fetchIntegrations();
      return data;
    } catch (error) {
      console.error('Error connecting integration:', error);
      throw error;
    }
  };

  const disconnectIntegration = async (name: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('integration-manager', {
        body: { 
          action: 'disconnect',
          integrationName: name
        }
      });

      if (error) throw error;
      
      // Refresh integrations list
      await fetchIntegrations();
      return data;
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      throw error;
    }
  };

  const getIntegrationStatus = (name: string): 'connected' | 'disconnected' | 'error' => {
    const integration = integrations.find(i => i.name === name);
    return integration?.status || 'disconnected';
  };

  useEffect(() => {
    fetchIntegrations();
  }, [user]);

  return {
    integrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    getIntegrationStatus,
    refetch: fetchIntegrations
  };
};
