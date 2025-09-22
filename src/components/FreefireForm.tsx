import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useHistoryRefresh } from "@/contexts/HistoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ThumbsUp, Gamepad2, Globe, ExternalLink, Clock } from "lucide-react";
import { FreeFireApiService, FreeFireApiResponse } from "@/services/freefireApi";
import { PlayerModal } from "@/components/PlayerModal";

interface FreefireFormData {
  playerId: string;
  region: string;
  quantity: number;
}

const regions = [
  { value: "br", label: "Brasil" },
];

const quantityOptions = [
  { value: 100, label: "100 likes", available: true },
  { value: 200, label: "200 likes", available: false },
  { value: 300, label: "300 likes", available: false },
  { value: 400, label: "400 likes", available: false },
  { value: 500, label: "500 likes", available: false },
  { value: 600, label: "600 likes", available: false },
  { value: 700, label: "700 likes", available: false },
  { value: 800, label: "800 likes", available: false },
  { value: 900, label: "900 likes", available: false },
  { value: 1000, label: "1000 likes", available: false },
];

export const FreefireForm = () => {
  const { toast } = useToast();
  const { triggerRefresh } = useHistoryRefresh();
  const [formData, setFormData] = useState<FreefireFormData>({
    playerId: '',
    region: 'br',
    quantity: 100
  });
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState<FreeFireApiResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Timer states
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializa o timer do localStorage na montagem do componente
  useEffect(() => {
    const savedCooldown = localStorage.getItem('ff-likes-cooldown');
    if (savedCooldown) {
      const cooldownEndTime = parseInt(savedCooldown);
      const now = Date.now();
      const remainingTime = Math.ceil((cooldownEndTime - now) / 1000);
      
      if (remainingTime > 0) {
        setCooldownTime(remainingTime);
        setIsOnCooldown(true);
      } else {
        // Cooldown expirado, limpa o localStorage
        localStorage.removeItem('ff-likes-cooldown');
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setIsOnCooldown(false);
            localStorage.removeItem('ff-likes-cooldown');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [cooldownTime]);

  const startCooldown = () => {
    const cooldownEndTime = Date.now() + (30 * 1000); // 30 segundos a partir de agora
    localStorage.setItem('ff-likes-cooldown', cooldownEndTime.toString());
    setCooldownTime(30);
    setIsOnCooldown(true);
  };

  const handleApiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se está em cooldown
    if (isOnCooldown) {
      toast({
        title: "Aguarde o Cooldown! ⏰",
        description: `Aguarde ${cooldownTime} segundos antes de enviar novamente.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!FreeFireApiService.validatePlayerId(formData.playerId)) {
      toast({
        title: "Erro de Validacao",
        description: "ID do jogador deve estar entre 100000001 e 99999999999",
        variant: "destructive",
      });
      return;
    }

    if (!FreeFireApiService.validateQuantity(formData.quantity)) {
      toast({
        title: "Erro de Validacao",
        description: "Quantidade deve estar entre 1 e 1000",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const response = await FreeFireApiService.sendLikes({
        uid: formData.playerId,
        quantity: formData.quantity
      });

      setPlayerData(response);
      setConnectionStatus('connected');
      setIsModalOpen(true);
      
      // Atualiza o histórico
      triggerRefresh();
      
      // Inicia o cooldown de 30 segundos
      startCooldown();
      
      // Verifica se os likes foram realmente enviados
      if (response.Likes_Antes === response.Likes_Depois) {
        toast({
          title: "Limite de 24h Atingido! ⏰",
          description: `Este ID já recebeu likes nas últimas 24h. Tente novamente amanhã.`,
          variant: "destructive",
        });
      } else if (response.Likes_Enviados > 0) {
        const realLikesSent = response.Likes_Depois - response.Likes_Antes;
        const requestedLikes = formData.quantity;
        
        if (realLikesSent < requestedLikes) {
          toast({
            title: "Limite de 24h Atingido! ⏰",
            description: `${realLikesSent} de ${requestedLikes} likes foram aplicados para ${response.PlayerNickname}. Este ID já recebeu likes nas últimas 24h.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Likes Enviados com Sucesso! 🔥",
            description: `${response.Likes_Enviados} likes enviados para ${response.PlayerNickname}!`,
          });
        }
      } else {
        toast({
          title: "Erro no Envio",
          description: "Não foi possível enviar os likes. Tente novamente.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro ao enviar likes:', error);
      setConnectionStatus('error');
      toast({
        title: "Erro ao Enviar Likes",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const handlePlayerIdChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, playerId: numericValue }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-center">
        <div className="w-full">
          <Card className="gradient-card border-border/50 shadow-card backdrop-blur-sm">
        <CardHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ganhe Likes no Free Fire!
            </CardTitle>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></div>
              <span className="text-muted-foreground">
                {connectionStatus === 'connected' ? 'Conectado' :
                 connectionStatus === 'connecting' ? 'Conectando...' :
                 connectionStatus === 'error' ? 'Erro de conexão' :
                 'Aguardando conexão'}
              </span>
            </div>
            {connectionStatus === 'error' && (
              <p className="text-xs text-red-500 mt-1">
                Usando método alternativo para contornar CORS
              </p>
            )}
          </div>
        </CardHeader>
            
            <CardContent className="space-y-6">

              <form onSubmit={handleApiSubmit} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Gamepad2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      id="playerId"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.playerId}
                      onChange={(e) => handlePlayerIdChange(e.target.value)}
                      placeholder="ID do Jogador"
                      required
                      className="transition-gaming pl-10 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                    <Select value="br" disabled>
                      <SelectTrigger className="pl-10 bg-background">
                        <SelectValue placeholder="Selecione a região" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="br" className="font-medium">
                          🇧🇷 Brasil
                        </SelectItem>
                        <SelectItem value="us" disabled className="opacity-50 cursor-not-allowed">
                          🇺🇸 Estados Unidos (Indisponível)
                        </SelectItem>
                        <SelectItem value="mx" disabled className="opacity-50 cursor-not-allowed">
                          🇲🇽 México (Indisponível)
                        </SelectItem>
                        <SelectItem value="ar" disabled className="opacity-50 cursor-not-allowed">
                          🇦🇷 Argentina (Indisponível)
                        </SelectItem>
                        <SelectItem value="co" disabled className="opacity-50 cursor-not-allowed">
                          🇨🇴 Colômbia (Indisponível)
                        </SelectItem>
                        <SelectItem value="pe" disabled className="opacity-50 cursor-not-allowed">
                          🇵🇪 Peru (Indisponível)
                        </SelectItem>
                        <SelectItem value="cl" disabled className="opacity-50 cursor-not-allowed">
                          🇨🇱 Chile (Indisponível)
                        </SelectItem>
                        <SelectItem value="ve" disabled className="opacity-50 cursor-not-allowed">
                          🇻🇪 Venezuela (Indisponível)
                        </SelectItem>
                        <SelectItem value="ec" disabled className="opacity-50 cursor-not-allowed">
                          🇪🇨 Equador (Indisponível)
                        </SelectItem>
                        <SelectItem value="bo" disabled className="opacity-50 cursor-not-allowed">
                          🇧🇴 Bolívia (Indisponível)
                        </SelectItem>
                        <SelectItem value="py" disabled className="opacity-50 cursor-not-allowed">
                          🇵🇾 Paraguai (Indisponível)
                        </SelectItem>
                        <SelectItem value="uy" disabled className="opacity-50 cursor-not-allowed">
                          🇺🇾 Uruguai (Indisponível)
                        </SelectItem>
                        <SelectItem value="gy" disabled className="opacity-50 cursor-not-allowed">
                          🇬🇾 Guiana (Indisponível)
                        </SelectItem>
                        <SelectItem value="sr" disabled className="opacity-50 cursor-not-allowed">
                          🇸🇷 Suriname (Indisponível)
                        </SelectItem>
                        <SelectItem value="gf" disabled className="opacity-50 cursor-not-allowed">
                          🇬🇫 Guiana Francesa (Indisponível)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Select value={formData.quantity.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, quantity: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="👍 Quantidade de Likes" />
                    </SelectTrigger>
                    <SelectContent>
                      {quantityOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value.toString()}
                          disabled={!option.available}
                          className={!option.available ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {!option.available && (
                              <span className="text-xs text-muted-foreground ml-2">(Indisponível)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    variant="gaming"
                    size="xl"
                    disabled={isLoading || isOnCooldown}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processando...
                      </>
                    ) : isOnCooldown ? (
                      <>
                        <Clock className="w-5 h-5" />
                        Aguarde {cooldownTime}s
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-5 h-5" />
                        Enviar Likes
                      </>
                    )}
                  </Button>

                </div>
              </form>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Modal com informações do jogador */}
      <PlayerModal 
        playerData={playerData} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
};
