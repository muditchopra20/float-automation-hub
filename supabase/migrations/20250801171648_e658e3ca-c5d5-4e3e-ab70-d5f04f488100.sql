-- Create new enum types (skip execution_status as it already exists)
CREATE TYPE credential_type AS ENUM ('openai', 'smtp', 'webhook', 'api_key', 'oauth', 'database');

CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error');

-- Add columns to existing workflows table to match the spec
ALTER TABLE public.workflows 
ADD COLUMN IF NOT EXISTS json_definition JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create executions table (using existing execution_status enum values)
CREATE TABLE public.executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status execution_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  output JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credentials table with encryption consideration
CREATE TABLE public.credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type credential_type NOT NULL,
  name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL, -- Store encrypted credentials
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create execution_logs table for granular logging
CREATE TABLE public.execution_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id UUID NOT NULL REFERENCES public.executions(id) ON DELETE CASCADE,
  node_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  level log_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for executions table
CREATE POLICY "Users can view own workflow executions" 
ON public.executions 
FOR SELECT 
USING (auth.uid() IN (
  SELECT workflows.user_id 
  FROM workflows 
  WHERE workflows.id = executions.workflow_id
));

CREATE POLICY "Users can create workflow executions" 
ON public.executions 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT workflows.user_id 
  FROM workflows 
  WHERE workflows.id = executions.workflow_id
));

CREATE POLICY "Users can update own workflow executions" 
ON public.executions 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT workflows.user_id 
  FROM workflows 
  WHERE workflows.id = executions.workflow_id
));

-- RLS policies for credentials table
CREATE POLICY "Users can view own credentials" 
ON public.credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own credentials" 
ON public.credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" 
ON public.credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" 
ON public.credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for execution_logs table
CREATE POLICY "Users can view own execution logs" 
ON public.execution_logs 
FOR SELECT 
USING (auth.uid() IN (
  SELECT workflows.user_id 
  FROM workflows 
  JOIN executions ON workflows.id = executions.workflow_id 
  WHERE executions.id = execution_logs.execution_id
));

CREATE POLICY "Users can create execution logs" 
ON public.execution_logs 
FOR INSERT 
WITH CHECK (auth.uid() IN (
  SELECT workflows.user_id 
  FROM workflows 
  JOIN executions ON workflows.id = executions.workflow_id 
  WHERE executions.id = execution_logs.execution_id
));

-- Create indexes for better performance
CREATE INDEX idx_executions_workflow_id ON public.executions(workflow_id);
CREATE INDEX idx_executions_status ON public.executions(status);
CREATE INDEX idx_executions_started_at ON public.executions(started_at);
CREATE INDEX idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX idx_credentials_type ON public.credentials(type);
CREATE INDEX idx_execution_logs_execution_id ON public.execution_logs(execution_id);
CREATE INDEX idx_execution_logs_timestamp ON public.execution_logs(timestamp);