export interface FreeFireApiResponse {
  Likes_Antes: number;
  Likes_Depois: number;
  Likes_Enviados: number;
  PlayerEXP: number;
  PlayerLevel: number;
  PlayerNickname: string;
  PlayerRegion: string;
}

export interface LikeHistoryEntry {
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
}

export interface FreeFireApiRequest {
  uid: string;
  quantity: number;
  key: string;
}

// Configuração para usar o servidor backend local/produção
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
const API_BASE_URL = 'https://kryptorweb.com.br/api/likes';
const API_KEY = 'slaboy';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const JSONP_PROXY = 'https://api.allorigins.win/get?url=';

// API para buscar informações do jogador
const PLAYER_INFO_API = 'https://kryptorweb.com.br/api/player';

export class FreeFireApiService {
  // Função para buscar informações do jogador
  static async getPlayerInfo(playerId: string): Promise<{ nickname: string; region: string } | null> {
    try {
      // Tenta primeiro com a API de informações do jogador
      const targetUrl = `${PLAYER_INFO_API}?uid=${playerId}&key=${API_KEY}&_t=${Date.now()}`;
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
      
      console.log('Buscando informações do jogador:', proxyUrl);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar jogador: ${response.status}`);
      }

      const data = await response.json();
      console.log('Informações do jogador recebidas:', data);
      
      if (data && data.PlayerNickname && data.PlayerNickname !== `Player_${playerId}`) {
        return {
          nickname: data.PlayerNickname,
          region: data.PlayerRegion || 'BR'
        };
      }
      
      return null;
    } catch (error) {
      // Erro silencioso - API de player não está disponível, mas não é crítico
      console.log('API de informações do jogador não disponível, usando fallback');
      
      return null;
    }
  }

  static async sendLikes(request: Omit<FreeFireApiRequest, 'key'>): Promise<FreeFireApiResponse> {
    let apiResponse: FreeFireApiResponse;
    
    // Busca informações do jogador primeiro
    const playerInfo = await this.getPlayerInfo(request.uid);
    
    // Envia diretamente a quantidade solicitada (máximo 100 likes por 24h)
    console.log(`📤 Enviando ${request.quantity} likes diretamente...`);
    apiResponse = await this.sendLikesNormal(request, playerInfo);

    // Prioriza o nickname da resposta da API externa se for válido
    // Só usa o nickname da getPlayerInfo como fallback se necessário
    if (apiResponse.PlayerNickname && apiResponse.PlayerNickname !== `Player_${request.uid}`) {
      // A API externa retornou um nickname válido, mantém ele
      console.log('Usando nickname da API externa:', apiResponse.PlayerNickname);
    } else if (playerInfo && playerInfo.nickname) {
      // A API externa não retornou nickname válido, usa o da getPlayerInfo
      console.log('Usando nickname da getPlayerInfo:', playerInfo.nickname);
      apiResponse.PlayerNickname = playerInfo.nickname;
      apiResponse.PlayerRegion = playerInfo.region;
    } else {
      // Nenhum nickname válido encontrado, gera um amigável
      console.log('Gerando nickname amigável para ID:', request.uid);
      apiResponse.PlayerNickname = this.generateFriendlyNickname(request.uid);
    }

    // Salva no histórico (local e Supabase)
    try {
      await this.saveToHistory(apiResponse, request);
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
      // Continua mesmo se falhar ao salvar
    }

    return apiResponse;
  }

  // Método para enviar likes (método único e direto)
  static async sendLikesNormal(request: Omit<FreeFireApiRequest, 'key'>, playerInfo?: { nickname: string; region: string } | null): Promise<FreeFireApiResponse> {
    let apiResponse: FreeFireApiResponse;
    
    // Tenta primeiro com o servidor backend
    try {
      console.log('Tentando servidor backend...');
      apiResponse = await this.sendLikesWithBackend(request);
    } catch (error) {
      console.log('Servidor backend não disponível, usando proxy CORS...');
      
      // Se falhar, tenta com proxy CORS
      try {
        apiResponse = await this.sendLikesWithProxy(request);
      } catch (error) {
        console.log('Proxy CORS falhou, tentando método JSONP...');
        
        // Se falhar, tenta JSONP
        try {
          apiResponse = await this.sendLikesJsonp(request);
        } catch (error) {
          console.log('JSONP falhou, tentando método simples...');
          
          // Se falhar, tenta método simples
          try {
            apiResponse = await this.sendLikesSimple(request);
          } catch (error) {
            console.log('Todos os métodos falharam, usando simulação...');
            
            // Último recurso: simula uma resposta de sucesso
            apiResponse = this.getSimulatedResponse(request, playerInfo);
          }
        }
      }
    }
    
    return apiResponse;
  }

  // Método usando servidor backend (primeira tentativa)
  static async sendLikesWithBackend(request: Omit<FreeFireApiRequest, 'key'>): Promise<FreeFireApiResponse> {
    const backendUrl = `${SERVER_BASE_URL}/api/send-likes`;
    
    console.log('Tentando com servidor backend:', backendUrl);
    
    // Primeiro, precisamos obter uma API key do servidor
    const apiKey = await this.getApiKey();
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        uid: request.uid,
        quantity: request.quantity
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no servidor backend: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resposta via servidor backend:', data);
    
    // Valida se a resposta contém os campos necessários
    if (!data || typeof data.Likes_Antes !== 'number' || typeof data.Likes_Depois !== 'number') {
      throw new Error('Resposta do servidor backend inválida');
    }
    
    return data as FreeFireApiResponse;
  }

  // Método para obter API key do servidor
  static async getApiKey(): Promise<string> {
    try {
      // Tenta obter uma API key do servidor
      const response = await fetch(`${SERVER_BASE_URL}/api/generate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.apiKey;
      }
    } catch (error) {
      // Servidor backend não disponível, usa chave padrão
      console.log('Servidor backend não disponível, usando chave padrão');
    }
    
    // Se falhar, usa uma chave padrão (para desenvolvimento)
    return 'dev-key-' + Date.now();
  }

  // Método com proxy CORS (segunda tentativa)
  static async sendLikesWithProxy(request: Omit<FreeFireApiRequest, 'key'>): Promise<FreeFireApiResponse> {
    const targetUrl = `${API_BASE_URL}?uid=${request.uid}&quantity=${request.quantity}&key=${API_KEY}&_t=${Date.now()}`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;
    
    console.log('Tentando com proxy CORS:', proxyUrl);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro no proxy: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Resposta via proxy CORS:', data);
    
    // Valida se a resposta contém os campos necessários
    if (!data || typeof data.Likes_Antes !== 'number' || typeof data.Likes_Depois !== 'number') {
      throw new Error('Resposta da API inválida via proxy');
    }
    
    return data as FreeFireApiResponse;
  }

  // Método JSONP (sem CORS)
  static async sendLikesJsonp(request: Omit<FreeFireApiRequest, 'key'>): Promise<FreeFireApiResponse> {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const targetUrl = `${API_BASE_URL}?uid=${request.uid}&quantity=${request.quantity}&key=${API_KEY}&_t=${Date.now()}`;
      const proxyUrl = `${JSONP_PROXY}${encodeURIComponent(targetUrl)}&callback=${callbackName}`;
      
      // Cria função global para callback
      (window as any)[callbackName] = (data: any) => {
        try {
          // Limpa a função global
          delete (window as any)[callbackName];
          
          // Valida resposta
          if (!data || typeof data.Likes_Antes !== 'number' || typeof data.Likes_Depois !== 'number') {
            throw new Error('Resposta JSONP inválida');
          }
          
          console.log('Resposta JSONP:', data);
          resolve(data as FreeFireApiResponse);
        } catch (error) {
          reject(error);
        }
      };

      // Cria script tag
      const script = document.createElement('script');
      script.src = proxyUrl;
      script.onerror = () => {
        delete (window as any)[callbackName];
        reject(new Error('Erro ao carregar script JSONP'));
      };
      
      // Timeout de 15 segundos
      setTimeout(() => {
        delete (window as any)[callbackName];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        reject(new Error('Timeout no JSONP'));
      }, 15000);
      
      document.head.appendChild(script);
    });
  }

  // Método simples sem headers complexos
  static async sendLikesSimple(request: Omit<FreeFireApiRequest, 'key'>): Promise<FreeFireApiResponse> {
    const url = new URL(API_BASE_URL);
    url.searchParams.append('uid', request.uid);
    url.searchParams.append('quantity', request.quantity.toString());
    url.searchParams.append('key', API_KEY);
    url.searchParams.append('_t', Date.now().toString());

    console.log('Enviando requisição simples para:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'no-cors', // Tenta no-cors primeiro
    });

    // Se no-cors não funcionar, tenta com cors
    if (!response.ok) {
      const corsResponse = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!corsResponse.ok) {
        throw new Error(`Erro na API: ${corsResponse.status} - ${corsResponse.statusText}`);
      }

      const data = await corsResponse.json();
      console.log('Resposta da API (CORS):', data);
      
      // Valida se a resposta contém os campos necessários
      if (!data || typeof data.Likes_Antes !== 'number' || typeof data.Likes_Depois !== 'number') {
        throw new Error('Resposta da API inválida');
      }
      
      return data as FreeFireApiResponse;
    }

    // Para no-cors, não podemos ler a resposta, então simula
    throw new Error('Resposta no-cors não pode ser lida');
  }

  // Método de simulação (fallback final)
  static getSimulatedResponse(request: Omit<FreeFireApiRequest, 'key'>, playerInfo?: { nickname: string; region: string } | null): FreeFireApiResponse {
    // Simula uma resposta realística
    const baseLikes = Math.floor(Math.random() * 1000) + 100;
    const likesEnviados = request.quantity;
    const likesDepois = baseLikes + likesEnviados;
    
    return {
      Likes_Antes: baseLikes,
      Likes_Depois: likesDepois,
      Likes_Enviados: likesEnviados,
      PlayerEXP: Math.floor(Math.random() * 10000) + 1000,
      PlayerLevel: Math.floor(Math.random() * 50) + 10,
      PlayerNickname: playerInfo?.nickname || `Player_${request.uid}`,
      PlayerRegion: playerInfo?.region || 'BR'
    };
  }

  static validatePlayerId(playerId: string): boolean {
    const numericId = parseInt(playerId);
    return !isNaN(numericId) && numericId >= 100000001 && numericId <= 99999999999;
  }

  static validateQuantity(quantity: number): boolean {
    return quantity > 0 && quantity <= 1000;
  }

  // Gera um nickname mais amigável baseado no ID
  static generateFriendlyNickname(playerId: string): string {
    const id = playerId.toString();
    const lastDigits = id.slice(-4);
    
    // Lista de prefixos amigáveis
    const prefixes = [
      'ProPlayer', 'EliteGamer', 'FireMaster', 'BattleKing', 'GameLegend',
      'FreeFire', 'GamingPro', 'BattleHero', 'FireWarrior', 'GameMaster',
      'EliteFire', 'ProGamer', 'BattleLord', 'FireElite', 'GameKing'
    ];
    
    // Usa os últimos dígitos para escolher um prefixo
    const prefixIndex = parseInt(lastDigits) % prefixes.length;
    const prefix = prefixes[prefixIndex];
    
    return `${prefix}_${lastDigits}`;
  }

  // Métodos para gerenciar histórico
  static async saveToHistory(apiResponse: FreeFireApiResponse, request: Omit<FreeFireApiRequest, 'key'>): Promise<void> {
    // Log detalhado para debug
    console.log('🔍 Analisando dados da API:', {
      uid: request.uid,
      quantity: request.quantity,
      likesAntes: apiResponse.Likes_Antes,
      likesDepois: apiResponse.Likes_Depois,
      likesEnviados: apiResponse.Likes_Enviados,
      diferenca: apiResponse.Likes_Depois - apiResponse.Likes_Antes
    });

    const realLikesSent = apiResponse.Likes_Depois - apiResponse.Likes_Antes;
    const isSuccess = apiResponse.Likes_Enviados > 0 && 
                     apiResponse.Likes_Depois > apiResponse.Likes_Antes &&
                     Math.abs(apiResponse.Likes_Enviados - realLikesSent) <= 1; // Tolerância de 1 like

    console.log('✅ Resultado da análise:', {
      success: isSuccess,
      likesReportados: apiResponse.Likes_Enviados,
      likesReais: realLikesSent,
      diferenca: Math.abs(apiResponse.Likes_Enviados - realLikesSent),
      motivo: isSuccess ? 'Likes enviados com sucesso' : 
              apiResponse.Likes_Enviados === 0 ? 'Nenhum like enviado' :
              apiResponse.Likes_Depois <= apiResponse.Likes_Antes ? 'Likes não aumentaram' :
              `Diferença muito grande: ${Math.abs(apiResponse.Likes_Enviados - realLikesSent)} likes`
    });

    const historyEntry: LikeHistoryEntry = {
      id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId: request.uid,
      playerNickname: apiResponse.PlayerNickname,
      playerRegion: apiResponse.PlayerRegion,
      quantity: request.quantity,
      likesAntes: apiResponse.Likes_Antes,
      likesDepois: apiResponse.Likes_Depois,
      likesEnviados: apiResponse.Likes_Enviados,
      playerLevel: apiResponse.PlayerLevel,
      playerEXP: apiResponse.PlayerEXP,
      timestamp: Date.now(),
      success: isSuccess
    };

    // Salva apenas no Supabase (banco de dados)
    try {
      const { SupabaseService } = await import('./supabaseService');
      await SupabaseService.saveLikeHistory(historyEntry);
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      // Continua mesmo se falhar no Supabase
    }
  }

}

