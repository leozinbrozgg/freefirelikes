import { io, Socket } from 'socket.io-client';
import { config } from '@/config/environment';

export interface GlobalHistoryEntry {
  id: string;
  playerId: string;
  playerNickname: string;
  playerRegion: string;
  quantity: number;
  likesAntes: number;
  likesDepois: number;
  likesEnviados: number;
  playerLevel: number;
  playerEXP: number;
  timestamp: number;
  success: boolean;
  clientIP?: string;
}

export interface GlobalStats {
  total: number;
  successful: number;
  failed: number;
  totalLikes: number;
}

export interface GlobalHistoryResponse {
  history: GlobalHistoryEntry[];
  stats: GlobalStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class GlobalHistoryService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = config.serverUrl;
  }

  // Conectar ao WebSocket
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('🌐 Conectado ao servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado do servidor WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
    });

    return this.socket;
  }

  // Desconectar do WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Buscar histórico global via API
  async getGlobalHistory(limit: number = 50, offset: number = 0): Promise<GlobalHistoryResponse> {
    try {
      const response = await fetch(`${this.serverUrl}/api/global-history?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar histórico global:', error);
      throw error;
    }
  }

  // Buscar estatísticas globais via API
  async getGlobalStats(): Promise<GlobalStats> {
    try {
      const response = await fetch(`${this.serverUrl}/api/global-stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas globais:', error);
      throw error;
    }
  }

  // Escutar atualizações do histórico em tempo real
  onHistoryUpdate(callback: (data: { newEntry: GlobalHistoryEntry; totalEntries: number }) => void): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.on('historyUpdate', callback);
  }

  // Escutar histórico inicial quando conectar
  onInitialHistory(callback: (data: { history: GlobalHistoryEntry[]; stats: GlobalStats }) => void): void {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.on('initialHistory', callback);
  }

  // Remover listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  // Verificar se está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Instância singleton
export const globalHistoryService = new GlobalHistoryService();
