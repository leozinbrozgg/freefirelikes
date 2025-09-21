import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FreeFireApiResponse } from "@/services/freefireApi";
import { User, Star, Globe, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerModalProps {
  playerData: FreeFireApiResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerModal = ({ playerData, isOpen, onClose }: PlayerModalProps) => {
  if (!playerData) return null;

  const isLimitReached = playerData.Likes_Antes === playerData.Likes_Depois;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-4">
          <div className="w-16 h-16 gradient-gaming rounded-full flex items-center justify-center shadow-glow">
            <User className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Informações do Jogador
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Detalhes sobre o envio de likes para {playerData.PlayerNickname}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Informações unificadas do jogador */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-4">
            {/* Nickname e região no topo */}
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {playerData.PlayerNickname}
              </h3>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{playerData.PlayerRegion}</span>
              </div>
            </div>
            
            {/* Estatísticas de likes */}
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {playerData.Likes_Antes.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Antes</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">
                    {playerData.Likes_Depois.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Depois</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">
                    +{playerData.Likes_Enviados.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Enviados</div>
                </div>
              </div>
            </div>
            
            {/* Nível e XP - Oculto para uso futuro */}
            {/* 
            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-primary" />
                Informações do Jogador
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">
                    {playerData.PlayerLevel}
                  </div>
                  <div className="text-xs text-muted-foreground">Nível</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-accent">
                    {playerData.PlayerEXP.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </div>
              </div>
            </div>
            */}
          </div>

          {/* Resumo da operação */}
          {isLimitReached ? (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-orange-700 text-sm">Limite de 24h Atingido!</span>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Este ID já recebeu likes nas últimas 24h. Tente novamente após 24 horas.
              </p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-700 text-sm">Operação Concluída!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {playerData.Likes_Enviados} likes enviados com sucesso!
              </p>
            </div>
          )}

          {/* Botão de fechar */}
          <div className="flex justify-center pt-2">
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
