import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History,
  CheckCircle, 
  XCircle
} from "lucide-react";
import { FreeFireApiService, LikeHistoryEntry } from "@/services/freefireApi";

export const SimpleLikeHistory = () => {
  const [history, setHistory] = useState<LikeHistoryEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = FreeFireApiService.getHistory();
    setHistory(historyData);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div>
      {history.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum registro encontrado</p>
          <p className="text-xs">Envie alguns likes para ver o histórico!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <ScrollArea className="h-80">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.slice(0, 12).map((entry) => (
                <Card 
                  key={entry.id}
                  className="gradient-card border-border/50 shadow-card backdrop-blur-sm hover:bg-card/70 transition-colors"
                >
                  <CardContent className="p-4">
                    {/* Header do Card */}
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(entry.success)}
                      <span className="font-medium text-sm truncate">{entry.playerNickname}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {/* Números em destaque - lado a lado */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500 mb-1">
                          {entry.likesAntes.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Antes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500 mb-1">
                          {entry.likesDepois.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Depois</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500 mb-1">
                          +{entry.likesEnviados.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Enviados</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          {history.length > 12 && (
            <div className="text-center text-xs text-muted-foreground mt-2">
              Mostrando os 12 mais recentes de {history.length} registros
            </div>
          )}
        </div>
      )}
    </div>
  );
};
