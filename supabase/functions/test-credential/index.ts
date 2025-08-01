import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple decryption function (matches encrypt-credential)
async function decrypt(encryptedText: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const keyData = encoder.encode(key);
  
  const keyHash = await crypto.subtle.digest('SHA-256', keyData);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyHash.slice(0, 32),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decode base64 and split IV and data
  const combined = new Uint8Array(
    atob(encryptedText).split('').map(char => char.charCodeAt(0))
  );
  
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

// Test different credential types
async function testCredential(type: string, decryptedValue: string): Promise<boolean> {
  try {
    switch (type) {
      case 'openai_api':
        // Test OpenAI API key
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${decryptedValue}`,
          },
        });
        return openaiResponse.ok;

      case 'google_api':
        // Test Google API key (using a simple endpoint)
        const googleResponse = await fetch(`https://www.googleapis.com/customsearch/v1?key=${decryptedValue}&cx=test&q=test`, {
          method: 'GET',
        });
        // Even with invalid cx, a valid API key should return a different error than 403
        return googleResponse.status !== 403;

      case 'slack_api':
        // Test Slack bot token
        const slackResponse = await fetch('https://slack.com/api/auth.test', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${decryptedValue}`,
            'Content-Type': 'application/json',
          },
        });
        const slackData = await slackResponse.json();
        return slackData.ok === true;

      case 'github_api':
        // Test GitHub token
        const githubResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${decryptedValue}`,
            'User-Agent': 'Flo-AI-Workflow-Builder',
          },
        });
        return githubResponse.ok;

      case 'stripe_api':
        // Test Stripe secret key (list payment methods)
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_methods?limit=1', {
          headers: {
            'Authorization': `Bearer ${decryptedValue}`,
          },
        });
        return stripeResponse.ok;

      case 'webhook':
        // For webhooks, we can't really test without making a call
        // Just validate it's a proper URL
        try {
          new URL(decryptedValue);
          return true;
        } catch {
          return false;
        }

      case 'smtp':
        // For SMTP, we'd need to parse the JSON and test connection
        // For now, just validate it's valid JSON
        try {
          JSON.parse(decryptedValue);
          return true;
        } catch {
          return false;
        }

      default:
        // For custom APIs, just check if it's not empty
        return decryptedValue.length > 0;
    }
  } catch (error) {
    console.error('Error testing credential:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || 'default-key-change-this-in-production';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { credential_id, type } = await req.json();
    
    if (!credential_id || !type) {
      throw new Error('Credential ID and type are required');
    }

    // Get the credential
    const { data: credential, error: credentialError } = await supabase
      .from('credentials')
      .select('*')
      .eq('id', credential_id)
      .eq('user_id', user.id)
      .single();

    if (credentialError || !credential) {
      throw new Error('Credential not found');
    }

    // Decrypt the credential value
    const decryptedValue = await decrypt(credential.encrypted_value, encryptionKey + user.id);

    // Test the credential
    const isValid = await testCredential(type, decryptedValue);

    return new Response(JSON.stringify({
      valid: isValid,
      credential_id,
      type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing credential:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      valid: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});