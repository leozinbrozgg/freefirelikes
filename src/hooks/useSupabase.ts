import { useState, useEffect } from 'react';
import { SupabaseService } from '@/services/supabaseService';
import { SupabaseLikeHistoryEntry, SupabaseGlobalStats } from '@/services/supabaseService';
import { useHistoryRefresh } from '@/contexts/HistoryContext';

export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const connected = await SupabaseService.testConnection();
      setIsConnected(connected);
      return connected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return {
    isConnected,
    isLoading,
    error,
    testConnection,
  };
};

export const useSupabaseHistory = (limit: number = 50, offset: number = 0) => {
  const [history, setHistory] = useState<SupabaseLikeHistoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useHistoryRefresh();

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SupabaseService.getLikeHistory(limit, offset);
      setHistory(result.data);
      setTotalCount(result.count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar histórico';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit, offset, refreshTrigger]);

  return {
    history,
    totalCount,
    isLoading,
    error,
    refetch: fetchHistory,
  };
};

export const useSupabaseStats = () => {
  const [stats, setStats] = useState<SupabaseGlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SupabaseService.getGlobalStats();
      setStats(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar estatísticas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export const useSupabasePlayerHistory = (playerId: string) => {
  const [history, setHistory] = useState<SupabaseLikeHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerHistory = async () => {
    if (!playerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await SupabaseService.getPlayerHistory(playerId);
      setHistory(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar histórico do player';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerHistory();
  }, [playerId]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchPlayerHistory,
  };
};
