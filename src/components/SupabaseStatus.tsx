import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSupabase, useSupabaseStats } from '@/hooks/useSupabase';
import { CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';

export const SupabaseStatus = () => {
  const { isConnected, isLoading, error, testConnection } = useSupabase();
  const { stats, refetch: refetchStats } = useSupabaseStats();

  const handleTestConnection = async () => {
    const connected = await testConnection();
    if (connected) {
      refetchStats();
    }
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Testando...
      </Badge>;
    }

    if (isConnected === null) {
      return <Badge variant="outline">Desconhecido</Badge>;
    }

    if (isConnected) {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        Conectado
      </Badge>;
    }

    return <Badge variant="destructive" className="flex items-center gap-1">
      <XCircle className="h-3 w-3" />
      Desconectado
    </Badge>;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5" />
          Status do Supabase
        </CardTitle>
        <CardDescription>
          Conexão com o banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Conexão:</span>
          {getStatusBadge()}
        </div>

        {isConnected && stats && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Estatísticas Globais:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono">{stats.total_requests}</span>
              </div>
              <div className="flex justify-between">
                <span>Sucessos:</span>
                <span className="font-mono text-green-600">{stats.successful_requests}</span>
              </div>
              <div className="flex justify-between">
                <span>Falhas:</span>
                <span className="font-mono text-red-600">{stats.failed_requests}</span>
              </div>
              <div className="flex justify-between">
                <span>Likes:</span>
                <span className="font-mono text-blue-600">{stats.total_likes_sent}</span>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleTestConnection} 
          disabled={isLoading}
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Testar Conexão
            </>
          )}
        </Button>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Erro: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
