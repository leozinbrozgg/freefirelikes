import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/environment';

// Cria o cliente Supabase
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// Tipos para as tabelas do banco de dados
export interface Database {
  public: {
    Tables: {
      like_history: {
        Row: {
          id: string;
          player_id: string;
          player_nickname: string;
          player_region: string;
          quantity: number;
          likes_antes: number;
          likes_depois: number;
          likes_enviados: number;
          player_level: number;
          player_exp: number;
          success: boolean;
          created_at: string;
          client_ip?: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          player_nickname: string;
          player_region: string;
          quantity: number;
          likes_antes: number;
          likes_depois: number;
          likes_enviados: number;
          player_level: number;
          player_exp: number;
          success: boolean;
          created_at?: string;
          client_ip?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          player_nickname?: string;
          player_region?: string;
          quantity?: number;
          likes_antes?: number;
          likes_depois?: number;
          likes_enviados?: number;
          player_level?: number;
          player_exp?: number;
          success?: boolean;
          created_at?: string;
          client_ip?: string;
        };
      };
      global_stats: {
        Row: {
          id: string;
          total_requests: number;
          successful_requests: number;
          failed_requests: number;
          total_likes_sent: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          total_requests: number;
          successful_requests: number;
          failed_requests: number;
          total_likes_sent: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          total_requests?: number;
          successful_requests?: number;
          failed_requests?: number;
          total_likes_sent?: number;
          last_updated?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Exporta o cliente tipado
export type SupabaseClient = typeof supabase;
