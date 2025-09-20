import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FreeFireApiResponse } from "@/services/freefireApi";
import { User, ThumbsUp, Star, Globe, TrendingUp } from "lucide-react";

interface PlayerInfoProps {
  playerData: FreeFireApiResponse;
}

export const PlayerInfo = ({ playerData }: PlayerInfoProps) => {
  return (
    <Card className="gradient-card border-border/50 shadow-card backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 gradient-gaming rounded-full flex items-center justify-center shadow-glow">
          <User className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Informações do Jogador
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {playerData.PlayerNickname}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Região: {playerData.PlayerRegion}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas de likes */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-primary" />
            Estatísticas de Likes
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {playerData.Likes_Antes.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Likes Antes</div>
            </div>
            
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-secondary mb-1">
                {playerData.Likes_Depois.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Likes Depois</div>
            </div>
            
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">
                +{playerData.Likes_Enviados.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Likes Enviados</div>
            </div>
          </div>
        </div>

        {/* Informações do jogador */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Informações do Jogador
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nível</span>
                <Badge variant="secondary" className="text-lg font-bold">
                  {playerData.PlayerLevel}
                </Badge>
              </div>
            </div>
            
            <div className="bg-card/50 border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Experiência</span>
                <span className="text-lg font-bold text-primary">
                  {playerData.PlayerEXP.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo da operação */}
        {playerData.Likes_Antes === playerData.Likes_Depois ? (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-orange-700">Limite de 24h Atingido!</span>
            </div>
            <p className="text-sm text-orange-600">
              Este ID já recebeu likes nas últimas 24h. Os likes não foram enviados desta vez.
            </p>
            <p className="text-xs text-orange-500 mt-2">
              ⏰ Tente novamente após 24 horas
            </p>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-green-700">Operação Concluída!</span>
            </div>
            <p className="text-sm text-green-600">
              {playerData.Likes_Enviados} likes foram enviados com sucesso para {playerData.PlayerNickname}!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
