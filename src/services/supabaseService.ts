import { supabase, Database } from '@/lib/supabase';
import { LikeHistoryEntry } from './freefireApi';

// Tipos para o banco de dados
type LikeHistoryRow = Database['public']['Tables']['like_history']['Row'];
type LikeHistoryInsert = Database['public']['Tables']['like_history']['Insert'];
type GlobalStatsRow = Database['public']['Tables']['global_stats']['Row'];

export interface SupabaseLikeHistoryEntry extends Omit<LikeHistoryEntry, 'timestamp'> {
  created_at: string;
  client_ip?: string;
}

export interface SupabaseGlobalStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_likes_sent: number;
  last_updated: string;
}

export class SupabaseService {
  // Salvar entrada no histórico
  static async saveLikeHistory(entry: LikeHistoryEntry, clientIP?: string): Promise<void> {
    try {
      const insertData: LikeHistoryInsert = {
        player_id: entry.playerId,
        player_nickname: entry.playerNickname,
        player_region: entry.playerRegion,
        quantity: entry.quantity,
        likes_antes: entry.likesAntes,
        likes_depois: entry.likesDepois,
        likes_enviados: entry.likesEnviados,
        player_level: entry.playerLevel,
        player_exp: entry.playerEXP,
        success: entry.success,
        client_ip: clientIP,
      };

      const { error } = await supabase
        .from('like_history')
        .insert(insertData);

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        throw error;
      }

      console.log('✅ Entrada salva no Supabase com sucesso');
    } catch (error) {
      console.error('Erro ao salvar histórico no Supabase:', error);
      throw error;
    }
  }

  // Buscar histórico com paginação
  static async getLikeHistory(
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ data: SupabaseLikeHistoryEntry[]; count: number }> {
    try {
      const { data, error, count } = await supabase
        .from('like_history')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        throw error;
      }

      return {
        data: data || [],
        count: count || 0
      };
    } catch (error) {
      console.error('Erro ao buscar histórico do Supabase:', error);
      throw error;
    }
  }

  // Buscar estatísticas globais
  static async getGlobalStats(): Promise<SupabaseGlobalStats | null> {
    try {
      const { data, error } = await supabase
        .from('global_stats')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do Supabase:', error);
      return null;
    }
  }

  // Atualizar estatísticas globais
  static async updateGlobalStats(stats: {
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_likes_sent: number;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('global_stats')
        .upsert({
          id: 'main',
          ...stats,
          last_updated: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao atualizar estatísticas:', error);
        throw error;
      }

      console.log('✅ Estatísticas atualizadas no Supabase');
    } catch (error) {
      console.error('Erro ao atualizar estatísticas no Supabase:', error);
      throw error;
    }
  }

  // Buscar histórico por player ID
  static async getPlayerHistory(playerId: string): Promise<SupabaseLikeHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('like_history')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico do player:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico do player no Supabase:', error);
      throw error;
    }
  }

  // Buscar estatísticas de um player específico
  static async getPlayerStats(playerId: string): Promise<{
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    total_likes_sent: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('like_history')
        .select('success, likes_enviados')
        .eq('player_id', playerId);

      if (error) {
        console.error('Erro ao buscar estatísticas do player:', error);
        throw error;
      }

      const total_requests = data?.length || 0;
      const successful_requests = data?.filter(entry => entry.success).length || 0;
      const failed_requests = total_requests - successful_requests;
      const total_likes_sent = data?.reduce((sum, entry) => sum + (entry.likes_enviados || 0), 0) || 0;

      return {
        total_requests,
        successful_requests,
        failed_requests,
        total_likes_sent
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do player no Supabase:', error);
      throw error;
    }
  }

  // Limpar histórico (apenas para desenvolvimento)
  static async clearHistory(): Promise<void> {
    try {
      const { error } = await supabase
        .from('like_history')
        .delete()
        .neq('id', ''); // Deleta todos os registros

      if (error) {
        console.error('Erro ao limpar histórico:', error);
        throw error;
      }

      console.log('✅ Histórico limpo no Supabase');
    } catch (error) {
      console.error('Erro ao limpar histórico no Supabase:', error);
      throw error;
    }
  }

  // Verificar conexão com o Supabase
  static async testConnection(): Promise<boolean> {
    try {
      // Primeiro tenta verificar se a tabela existe
      const { data, error } = await supabase
        .from('like_history')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Erro na conexão com Supabase:', error);
        
        // Se for erro de tabela não encontrada, aguarda um pouco e tenta novamente
        if (error.code === 'PGRST205') {
          console.log('Tabela não encontrada, aguardando 2 segundos e tentando novamente...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: retryData, error: retryError } = await supabase
            .from('like_history')
            .select('count')
            .limit(1);
            
          if (retryError) {
            console.error('Erro na segunda tentativa:', retryError);
            return false;
          }
        } else {
          return false;
        }
      }

      console.log('✅ Conexão com Supabase estabelecida');
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão com Supabase:', error);
      return false;
    }
  }
}
