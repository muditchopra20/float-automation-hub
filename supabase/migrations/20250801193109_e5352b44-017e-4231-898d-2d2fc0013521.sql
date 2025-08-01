-- Update agents table to add memory_vector_id for agent memory
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS memory_vector_id uuid;

-- Update executions table to add cursor and context for stateful execution
ALTER TABLE public.executions 
ADD COLUMN IF NOT EXISTS cursor text,
ADD COLUMN IF NOT EXISTS context jsonb DEFAULT '{}'::jsonb;

-- Create index on executions for better performance
CREATE INDEX IF NOT EXISTS idx_executions_workflow_status ON public.executions(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_executions_cursor ON public.executions(cursor) WHERE cursor IS NOT NULL;

-- Create index on execution_logs for better performance  
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_timestamp ON public.execution_logs(execution_id, timestamp);

-- Create index on agents for memory lookups
CREATE INDEX IF NOT EXISTS idx_agents_memory_vector ON public.agents(memory_vector_id) WHERE memory_vector_id IS NOT NULL;

-- Add comment to document the cursor field
COMMENT ON COLUMN public.executions.cursor IS 'Current node ID in workflow execution for pause/resume functionality';
COMMENT ON COLUMN public.executions.context IS 'JSONB object containing workflow execution context and variables';
COMMENT ON COLUMN public.agents.memory_vector_id IS 'Reference to vector store for agent memory and conversation history';