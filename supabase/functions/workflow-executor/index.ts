
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

    const { workflowId, inputData } = await req.json();

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', user.id)
      .single();

    if (workflowError || !workflow) {
      return new Response(JSON.stringify({ error: 'Workflow not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create execution record
    const { data: execution, error: executionError } = await supabaseClient
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        status: 'running',
        input_data: inputData || {},
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (executionError) {
      return new Response(JSON.stringify({ error: 'Failed to create execution' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simulate workflow execution
    const outputData = {
      result: `Workflow "${workflow.name}" executed successfully`,
      timestamp: new Date().toISOString(),
      steps_completed: 3,
      processing_time: Math.random() * 2000 + 500 // Random time between 500-2500ms
    };

    // Update execution as completed
    await supabaseClient
      .from('workflow_executions')
      .update({
        status: 'completed',
        output_data: outputData,
        completed_at: new Date().toISOString()
      })
      .eq('id', execution.id);

    // Update workflow last run time
    await supabaseClient
      .from('workflows')
      .update({
        last_run_at: new Date().toISOString()
      })
      .eq('id', workflowId);

    return new Response(JSON.stringify({ 
      executionId: execution.id,
      status: 'completed',
      output: outputData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in workflow-executor function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
