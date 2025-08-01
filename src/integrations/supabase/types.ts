export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agent_memories: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_personas: {
        Row: {
          agent_id: string
          communication_style: string | null
          created_at: string
          custom_instructions: string | null
          expertise_areas: string[] | null
          id: string
          language: string | null
          persona_name: string
          personality_traits: string[] | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          communication_style?: string | null
          created_at?: string
          custom_instructions?: string | null
          expertise_areas?: string[] | null
          id?: string
          language?: string | null
          persona_name?: string
          personality_traits?: string[] | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          communication_style?: string | null
          created_at?: string
          custom_instructions?: string | null
          expertise_areas?: string[] | null
          id?: string
          language?: string | null
          persona_name?: string
          personality_traits?: string[] | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_personas_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          attached_files: Json | null
          configuration: Json | null
          created_at: string
          description: string | null
          enable_logs: boolean | null
          execution_mode: string | null
          has_memory: boolean | null
          id: string
          is_active: boolean | null
          memory_vector_id: string | null
          name: string
          system_prompt: string | null
          tool_access: Json | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attached_files?: Json | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          enable_logs?: boolean | null
          execution_mode?: string | null
          has_memory?: boolean | null
          id?: string
          is_active?: boolean | null
          memory_vector_id?: string | null
          name: string
          system_prompt?: string | null
          tool_access?: Json | null
          type: Database["public"]["Enums"]["agent_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attached_files?: Json | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          enable_logs?: boolean | null
          execution_mode?: string | null
          has_memory?: boolean | null
          id?: string
          is_active?: boolean | null
          memory_vector_id?: string | null
          name?: string
          system_prompt?: string | null
          tool_access?: Json | null
          type?: Database["public"]["Enums"]["agent_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      credentials: {
        Row: {
          created_at: string
          encrypted_value: string
          id: string
          name: string
          type: Database["public"]["Enums"]["credential_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_value: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["credential_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_value?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["credential_type"]
          user_id?: string
        }
        Relationships: []
      }
      execution_logs: {
        Row: {
          execution_id: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          node_id: string
          timestamp: string
        }
        Insert: {
          execution_id: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
          node_id: string
          timestamp?: string
        }
        Update: {
          execution_id?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          node_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "executions"
            referencedColumns: ["id"]
          },
        ]
      }
      executions: {
        Row: {
          context: Json | null
          created_at: string
          cursor: string | null
          error: string | null
          finished_at: string | null
          id: string
          output: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["execution_status"]
          workflow_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          cursor?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          output?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["execution_status"]
          workflow_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          cursor?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          output?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["execution_status"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          configuration: Json | null
          created_at: string
          credentials: Json | null
          id: string
          name: string
          status: Database["public"]["Enums"]["integration_status"]
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          credentials?: Json | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["integration_status"]
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          credentials?: Json | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["integration_status"]
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["execution_status"]
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["execution_status"]
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["execution_status"]
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          configuration: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          json_definition: Json | null
          last_run_at: string | null
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          json_definition?: Json | null
          last_run_at?: string | null
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          json_definition?: Json | null
          last_run_at?: string | null
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_agent_memories: {
        Args: {
          query_embedding: string
          target_agent_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          content: string
          similarity: number
          metadata: Json
          created_at: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      agent_type:
        | "text_summarizer"
        | "data_extractor"
        | "research_assistant"
        | "custom"
      credential_type:
        | "openai"
        | "smtp"
        | "webhook"
        | "api_key"
        | "oauth"
        | "database"
      execution_status: "pending" | "running" | "completed" | "failed"
      integration_status: "connected" | "disconnected" | "error"
      log_level: "debug" | "info" | "warn" | "error"
      workflow_status: "draft" | "active" | "paused" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_type: [
        "text_summarizer",
        "data_extractor",
        "research_assistant",
        "custom",
      ],
      credential_type: [
        "openai",
        "smtp",
        "webhook",
        "api_key",
        "oauth",
        "database",
      ],
      execution_status: ["pending", "running", "completed", "failed"],
      integration_status: ["connected", "disconnected", "error"],
      log_level: ["debug", "info", "warn", "error"],
      workflow_status: ["draft", "active", "paused", "archived"],
    },
  },
} as const
