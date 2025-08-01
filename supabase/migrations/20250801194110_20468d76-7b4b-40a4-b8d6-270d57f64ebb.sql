-- Enable the pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create agent_memories table for storing conversation history as embeddings
CREATE TABLE public.agent_memories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX idx_agent_memories_embedding ON public.agent_memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for agent filtering
CREATE INDEX idx_agent_memories_agent_id ON public.agent_memories(agent_id);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION public.search_agent_memories(
  query_embedding vector(1536),
  target_agent_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    agent_memories.id,
    agent_memories.content,
    (agent_memories.embedding <=> query_embedding) * -1 + 1 AS similarity,
    agent_memories.metadata,
    agent_memories.created_at
  FROM agent_memories
  WHERE agent_memories.agent_id = target_agent_id
    AND (agent_memories.embedding <=> query_embedding) * -1 + 1 > match_threshold
  ORDER BY agent_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS on agent_memories
ALTER TABLE public.agent_memories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_memories
CREATE POLICY "Users can view their agent memories"
  ON public.agent_memories FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_memories.agent_id
  ));

CREATE POLICY "Users can create memories for their agents"
  ON public.agent_memories FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_memories.agent_id
  ));

CREATE POLICY "Users can update their agent memories"
  ON public.agent_memories FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_memories.agent_id
  ));

CREATE POLICY "Users can delete their agent memories"
  ON public.agent_memories FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_memories.agent_id
  ));

-- Create agent_personas table for storing agent personality settings
CREATE TABLE public.agent_personas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL UNIQUE REFERENCES public.agents(id) ON DELETE CASCADE,
  persona_name text NOT NULL DEFAULT 'Assistant',
  personality_traits text[] DEFAULT ARRAY[]::text[],
  communication_style text,
  expertise_areas text[] DEFAULT ARRAY[]::text[],
  tone text DEFAULT 'professional',
  language text DEFAULT 'en',
  custom_instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on agent_personas
ALTER TABLE public.agent_personas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_personas
CREATE POLICY "Users can view their agent personas"
  ON public.agent_personas FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_personas.agent_id
  ));

CREATE POLICY "Users can create personas for their agents"
  ON public.agent_personas FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_personas.agent_id
  ));

CREATE POLICY "Users can update their agent personas"
  ON public.agent_personas FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_personas.agent_id
  ));

CREATE POLICY "Users can delete their agent personas"
  ON public.agent_personas FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM public.agents WHERE agents.id = agent_personas.agent_id
  ));

-- Create trigger to update updated_at timestamps
CREATE TRIGGER update_agent_memories_updated_at
  BEFORE UPDATE ON public.agent_memories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_personas_updated_at
  BEFORE UPDATE ON public.agent_personas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.agent_memories IS 'Stores agent conversation history as vector embeddings for retrieval';
COMMENT ON TABLE public.agent_personas IS 'Stores agent personality and communication settings';
COMMENT ON FUNCTION public.search_agent_memories IS 'Performs semantic search on agent memories using vector similarity';