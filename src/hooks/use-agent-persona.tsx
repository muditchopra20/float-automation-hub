import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

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

export const useAgentPersona = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Get persona for an agent
  const getPersona = async (agentId: string): Promise<AgentPersona | null> => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agent_personas')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  };

  // Create or update persona
  const upsertPersona = async (persona: Omit<AgentPersona, 'id' | 'created_at' | 'updated_at'>): Promise<AgentPersona> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agent_personas')
        .upsert(persona, { onConflict: 'agent_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Delete persona
  const deletePersona = async (agentId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('agent_personas')
      .delete()
      .eq('agent_id', agentId);

    if (error) throw error;
  };

  // Generate persona-aware prompt
  const generatePersonaPrompt = (
    persona: AgentPersona, 
    basePrompt: string, 
    memories: string[] = []
  ): string => {
    let prompt = `You are ${persona.persona_name}, an AI assistant with the following characteristics:

**Personality Traits:** ${persona.personality_traits.join(', ')}
**Communication Style:** ${persona.communication_style}
**Areas of Expertise:** ${persona.expertise_areas.join(', ')}
**Tone:** ${persona.tone}
**Language:** ${persona.language}

${persona.custom_instructions ? `**Custom Instructions:** ${persona.custom_instructions}` : ''}`;

    if (memories.length > 0) {
      prompt += `\n\n**Relevant Memories:**
${memories.map((memory, index) => `${index + 1}. ${memory}`).join('\n')}

Use these memories to provide context-aware responses while maintaining your personality.`;
    }

    prompt += `\n\n**Current Request:** ${basePrompt}

Respond in character, using your personality traits and communication style. Be helpful while staying true to your persona.`;

    return prompt;
  };

  // Get default persona settings
  const getDefaultPersona = (agentId: string): Omit<AgentPersona, 'id' | 'created_at' | 'updated_at'> => ({
    agent_id: agentId,
    persona_name: 'Assistant',
    personality_traits: ['helpful', 'friendly', 'professional'],
    communication_style: 'Clear and concise',
    expertise_areas: ['general assistance'],
    tone: 'professional',
    language: 'en',
    custom_instructions: ''
  });

  return {
    getPersona,
    upsertPersona,
    deletePersona,
    generatePersonaPrompt,
    getDefaultPersona,
    loading
  };
};