import { useSupabaseHistory, useSupabaseStats } from '@/hooks/useSupabase';
import { TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export const LikeHistory = () => {
  const { history, isLoading, error } = useSupabaseHistory(20, 0);
  const { stats } = useSupabaseStats();

  // Usar o total de likes das estatísticas globais (mais preciso)
  const totalLikesSent = stats?.total_likes_sent || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Likes
          </h2>
          <div className="text-sm text-muted-foreground ml-7">
            Carregando...
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Buscando dados do banco de dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Likes
          </h2>
          <div className="text-sm text-muted-foreground ml-7">
            Erro
          </div>
        </div>
        <div className="text-center text-red-500 py-8">
          <p className="text-lg font-semibold mb-2">Erro ao Carregar Histórico</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Likes
          </h2>
          <div className="text-sm text-muted-foreground ml-7">
            Total: <span className="font-bold text-primary">+0</span> likes enviados
          </div>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>Nenhum like enviado ainda.</p>
          <p className="text-sm">Envie seu primeiro like para ver o histórico aqui!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Histórico de Likes
        </h2>
        <div className="text-sm text-muted-foreground ml-7">
          Total: <span className="font-bold text-primary">+{totalLikesSent.toLocaleString()}</span> likes enviados
        </div>
      </div>

      {/* Cards individuais em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="gradient-card border-border/50 shadow-card backdrop-blur-sm rounded-lg p-3 hover:shadow-glow transition-gaming"
          >
            {/* Cabeçalho com status e nick */}
            <div className="mb-3">
              <div className="flex items-center gap-2">
                {entry.success ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
                <span className="font-medium text-card-foreground text-sm">
                  {entry.player_nickname}†
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.created_at)}
                </span>
              </div>
            </div>

            {/* Likes em grid compacto */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="font-bold text-primary" style={{ fontSize: '1.5rem' }}>
                  {entry.likes_antes.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Antes</div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-secondary" style={{ fontSize: '1.5rem' }}>
                  {entry.likes_depois.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Depois</div>
              </div>
              
              <div className="text-center">
                <div className="font-bold text-accent" style={{ fontSize: '1.5rem' }}>
                  +{entry.likes_enviados.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Enviados</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};