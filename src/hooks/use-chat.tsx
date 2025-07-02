
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: any;
  created_at: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          user_id: user.id,
          role,
          content,
          metadata: {}
        }])
        .select()
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const clearChat = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  return {
    messages,
    loading,
    sendMessage,
    clearChat,
    refetch: fetchMessages
  };
};
