import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ThumbsUp, 
  User, 
  Globe, 
  Star,
  TrendingUp,
  Calendar
} from "lucide-react";
import { FreeFireApiService, LikeHistoryEntry } from "@/services/freefireApi";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LikeHistoryProps {
  showHeader?: boolean;
}

export const LikeHistory = ({ showHeader = true }: LikeHistoryProps) => {
  const [history, setHistory] = useState<LikeHistoryEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, totalLikes: 0 });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = FreeFireApiService.getHistory();
    const statsData = FreeFireApiService.getHistoryStats();
    setHistory(historyData);
    setStats(statsData);
  };

  const clearHistory = () => {
    FreeFireApiService.clearHistory();
    loadHistory();
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
            <div className="mx-auto w-16 h-16 gradient-gaming rounded-full flex items-center justify-center shadow-glow">
              <History className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Histórico de Likes
            </CardTitle>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.successful}</div>
              <div className="text-xs text-muted-foreground">Sucessos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Falhas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.totalLikes.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Likes Enviados</div>
            </div>
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
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={loadHistory} 
              variant="outline" 
              size="sm"
              className="transition-gaming"
            >
              Atualizar
            </Button>
            <Button 
              onClick={clearHistory} 
              variant="destructive" 
              size="sm"
              className="transition-gaming"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro encontrado</p>
              <p className="text-sm">Envie alguns likes para ver o histórico aqui!</p>
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
