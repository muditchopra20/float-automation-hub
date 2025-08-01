import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

export type CredentialType = 
  | 'openai_api'
  | 'google_api' 
  | 'slack_api'
  | 'smtp'
  | 'webhook'
  | 'github_api'
  | 'stripe_api'
  | 'custom';

interface Credential {
  id: string;
  user_id: string;
  type: CredentialType;
  name: string;
  encrypted_value: string;
  created_at: string;
}

interface CredentialInput {
  type: CredentialType;
  name: string;
  value: string;
  description?: string;
}

export const useCredentials = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get all credentials for the user (without encrypted values)
  const getCredentials = async (): Promise<Omit<Credential, 'encrypted_value'>[]> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credentials')
      .select('id, user_id, type, name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Get credential by type and name
  const getCredential = async (type: CredentialType, name?: string): Promise<Credential | null> => {
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('credentials')
      .select('*')
      .eq('type', type);

    if (name) {
      query = query.eq('name', name);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  };

  // Store or update credential
  const storeCredential = async (credential: CredentialInput): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Encrypt the credential value
      const { data: encryptedData, error: encryptError } = await supabase.functions.invoke('encrypt-credential', {
        body: { value: credential.value }
      });

      if (encryptError) throw encryptError;

      // Store encrypted credential
      const { error } = await supabase
        .from('credentials')
        .upsert({
          type: credential.type,
          name: credential.name,
          encrypted_value: encryptedData.encrypted_value
        }, { 
          onConflict: 'user_id,type,name',
          ignoreDuplicates: false 
        });

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete credential
  const deleteCredential = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('credentials')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  // Test credential (validates it works)
  const testCredential = async (type: CredentialType, credentialId: string): Promise<boolean> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-credential', {
        body: { 
          credential_id: credentialId,
          type 
        }
      });

      if (error) throw error;
      return data.valid;
    } finally {
      setLoading(false);
    }
  };

  // Get credential types with descriptions
  const getCredentialTypes = (): Array<{ type: CredentialType; label: string; description: string; fields: Array<{ name: string; label: string; type: string; placeholder: string }> }> => {
    return [
      {
        type: 'openai_api',
        label: 'OpenAI API',
        description: 'API key for OpenAI GPT models and embeddings',
        fields: [
          { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-...' }
        ]
      },
      {
        type: 'google_api',
        label: 'Google API',
        description: 'API key for Google services (Maps, Sheets, etc.)',
        fields: [
          { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza...' }
        ]
      },
      {
        type: 'slack_api',
        label: 'Slack API',
        description: 'Bot token for Slack integrations',
        fields: [
          { name: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...' }
        ]
      },
      {
        type: 'smtp',
        label: 'SMTP Email',
        description: 'SMTP server credentials for sending emails',
        fields: [
          { name: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.gmail.com' },
          { name: 'port', label: 'Port', type: 'number', placeholder: '587' },
          { name: 'username', label: 'Username', type: 'text', placeholder: 'your-email@gmail.com' },
          { name: 'password', label: 'Password', type: 'password', placeholder: 'app-password' }
        ]
      },
      {
        type: 'webhook',
        label: 'Webhook',
        description: 'Webhook URL for external integrations',
        fields: [
          { name: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.zapier.com/...' },
          { name: 'secret', label: 'Secret (optional)', type: 'password', placeholder: 'webhook-secret' }
        ]
      },
      {
        type: 'github_api',
        label: 'GitHub API',
        description: 'Personal access token for GitHub',
        fields: [
          { name: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...' }
        ]
      },
      {
        type: 'stripe_api',
        label: 'Stripe API',
        description: 'Secret key for Stripe payments',
        fields: [
          { name: 'secret_key', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' }
        ]
      },
      {
        type: 'custom',
        label: 'Custom API',
        description: 'Custom API credentials',
        fields: [
          { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Your API key' },
          { name: 'base_url', label: 'Base URL (optional)', type: 'url', placeholder: 'https://api.example.com' }
        ]
      }
    ];
  };

  // Validate credential format
  const validateCredential = (type: CredentialType, value: string): { valid: boolean; error?: string } => {
    switch (type) {
      case 'openai_api':
        if (!value.startsWith('sk-')) {
          return { valid: false, error: 'OpenAI API keys should start with "sk-"' };
        }
        break;
      case 'google_api':
        if (!value.startsWith('AIza')) {
          return { valid: false, error: 'Google API keys should start with "AIza"' };
        }
        break;
      case 'slack_api':
        if (!value.startsWith('xoxb-')) {
          return { valid: false, error: 'Slack bot tokens should start with "xoxb-"' };
        }
        break;
      case 'github_api':
        if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
          return { valid: false, error: 'GitHub tokens should start with "ghp_" or "github_pat_"' };
        }
        break;
      case 'stripe_api':
        if (!value.startsWith('sk_')) {
          return { valid: false, error: 'Stripe secret keys should start with "sk_"' };
        }
        break;
    }
    return { valid: true };
  };

  return {
    getCredentials,
    getCredential,
    storeCredential,
    deleteCredential,
    testCredential,
    getCredentialTypes,
    validateCredential,
    loading
  };
};