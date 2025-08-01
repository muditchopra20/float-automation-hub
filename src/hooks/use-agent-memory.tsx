import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface AgentMemory {
  id: string;
  agent_id: string;
  content: string;
  similarity?: number;
  metadata: any;
  created_at: string;
}

interface AgentPersona {
  id: string;
  agent_id: string;
  persona_name: string;
  personality_traits: string[];
  communication_style: string;
  expertise_areas: string[];
  tone: string;
  language: string;
  custom_instructions: string;
  created_at: string;
  updated_at: string;
}

export const useAgentMemory = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Generate embeddings using OpenAI
  const generateEmbedding = async (text: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text }
    });

    if (error) throw error;
    return JSON.stringify(data.embedding); // Convert to string for pgvector
  };

  // Store memory with embedding
  const storeMemory = async (
    agentId: string, 
    content: string, 
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Generate embedding for the content
      const embedding = await generateEmbedding(content);

      const { error } = await supabase
        .from('agent_memories')
        .insert({
          agent_id: agentId,
          content,
          embedding,
          metadata
        });

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  // Search memories by semantic similarity
  const searchMemories = async (
    agentId: string,
    query: string,
    threshold: number = 0.7,
    limit: number = 10
  ): Promise<AgentMemory[]> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Generate embedding for the query
      const queryEmbeddingString = await generateEmbedding(query);

      const { data, error } = await supabase.rpc('search_agent_memories', {
        query_embedding: queryEmbeddingString,
        target_agent_id: agentId,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        ...item,
        agent_id: agentId // Add agent_id since it's missing from the function return
      }));
    } finally {
      setLoading(false);
    }
  };

  // Get recent memories for context
  const getRecentMemories = async (
    agentId: string, 
    limit: number = 5
  ): Promise<AgentMemory[]> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agent_memories')
      .select('id, agent_id, content, metadata, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  };

  // Delete memory
  const deleteMemory = async (memoryId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('agent_memories')
      .delete()
      .eq('id', memoryId);

    if (error) throw error;
  };

  // Get all memories for an agent
  const getAgentMemories = async (agentId: string): Promise<AgentMemory[]> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agent_memories')
      .select('id, agent_id, content, metadata, created_at')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return {
    storeMemory,
    searchMemories,
    getRecentMemories,
    deleteMemory,
    getAgentMemories,
    loading
  };
};