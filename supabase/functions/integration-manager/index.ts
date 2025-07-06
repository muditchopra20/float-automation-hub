
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, integrationName, type, configuration } = await req.json();

    if (action === 'connect') {
      // Connect integration
      const { data, error } = await supabaseClient
        .from('integrations')
        .upsert({
          user_id: user.id,
          name: integrationName,
          type: type,
          status: 'connected',
          configuration: configuration || {},
          credentials: {} // In production, handle OAuth flows here
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to connect integration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        integration: data,
        message: `${integrationName} connected successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'disconnect') {
      // Disconnect integration
      const { error } = await supabaseClient
        .from('integrations')
        .update({ status: 'disconnected' })
        .eq('name', integrationName)
        .eq('user_id', user.id);

      if (error) {
        return new Response(JSON.stringify({ error: 'Failed to disconnect integration' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: `${integrationName} disconnected successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in integration-manager function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
