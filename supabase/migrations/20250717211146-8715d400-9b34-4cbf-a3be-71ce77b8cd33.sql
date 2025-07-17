-- Update agents table to include additional fields needed for the expanded agent configuration

-- Add new fields to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS system_prompt TEXT,
ADD COLUMN IF NOT EXISTS tool_access JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'Manual', -- Options: Manual, Workflow Step, Scheduled
ADD COLUMN IF NOT EXISTS has_memory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attached_files JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS enable_logs BOOLEAN DEFAULT true;