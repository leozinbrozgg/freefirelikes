import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  CheckCircle, 
  XCircle, 
  ThumbsUp, 
  User, 
  Globe, 
  Star,
  TrendingUp,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";
import { globalHistoryService, GlobalHistoryEntry, GlobalStats } from "@/services/globalHistoryService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GlobalLikeHistoryProps {
  showHeader?: boolean;
  maxEntries?: number;
}

export const GlobalLikeHistory = ({ showHeader = true, maxEntries = 50 }: GlobalLikeHistoryProps) => {
  const [history, setHistory] = useState<GlobalHistoryEntry[]>([]);
  const [stats, setStats] = useState<GlobalStats>({ total: 0, successful: 0, failed: 0, totalLikes: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Conectar ao WebSocket
    const socket = globalHistoryService.connect();
    
    // Verificar conexão
    setIsConnected(socket.connected);
    
    // Escutar histórico inicial
    globalHistoryService.onInitialHistory((data) => {
      setHistory(data.history.slice(0, maxEntries));
      setStats(data.stats);
      setIsLoading(false);
      setLastUpdate(new Date());
    });

    // Escutar atualizações em tempo real
    globalHistoryService.onHistoryUpdate((data) => {
      setStats(prevStats => ({
        ...prevStats,
        total: data.totalEntries
      }));
      
      setHistory(prevHistory => {
        const newHistory = [data.newEntry, ...prevHistory];
        return newHistory.slice(0, maxEntries);
      });
      
      setLastUpdate(new Date());
    });

    // Escutar mudanças de conexão
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🌐 Reconectado ao servidor');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔌 Desconectado do servidor');
    });

    // Carregar dados iniciais via API como fallback
    loadInitialData();

    return () => {
      globalHistoryService.removeAllListeners();
    };
  }, [maxEntries]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const data = await globalHistoryService.getGlobalHistory(maxEntries, 0);
      setHistory(data.history);
      setStats(data.stats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar histórico inicial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive">
        Limite Atingido
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header com estatísticas */}
      {showHeader && (
        <Card className="gradient-card border-border/50 shadow-card backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="mx-auto w-16 h-16 gradient-gaming rounded-full flex items-center justify-center shadow-glow">
                <History className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Tempo Real' : 'Desconectado'}
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Histórico Global de Likes
            </CardTitle>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.successful.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.totalLikes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Likes Enviados</div>
            </div>
          </div>

          {/* Status de conexão e última atualização */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </div>
            {lastUpdate && (
              <div>
                Última atualização: {formatDate(lastUpdate.getTime())}
              </div>
            )}
          </div>
        </CardHeader>
        </Card>
      )}

      {/* Lista de histórico */}
      <Card className="gradient-card border-border/50 shadow-card backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Registros Recentes
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="sm"
              className="transition-gaming"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p>Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado</p>
              <p className="text-sm">Aguarde alguns likes serem enviados!</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {history.map((entry) => (
                  <div 
                    key={entry.id}
                    className="bg-card/50 border border-border/50 rounded-lg p-4 hover:bg-card/70 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(entry.success)}
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {entry.playerNickname}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {entry.playerRegion} • ID: {entry.playerId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(entry.success)}
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-primary">{entry.likesAntes.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Antes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-secondary">{entry.likesDepois.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Depois</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-accent">+{entry.likesEnviados.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Enviados</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          {entry.playerLevel}
                        </div>
                        <div className="text-xs text-muted-foreground">Nível</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
