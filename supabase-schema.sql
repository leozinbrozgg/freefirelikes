-- Schema para o banco de dados Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela para histórico de likes
CREATE TABLE IF NOT EXISTS like_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id VARCHAR(20) NOT NULL,
  player_nickname VARCHAR(50) NOT NULL,
  player_region VARCHAR(10) NOT NULL DEFAULT 'BR',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  likes_antes INTEGER NOT NULL CHECK (likes_antes >= 0),
  likes_depois INTEGER NOT NULL CHECK (likes_depois >= 0),
  likes_enviados INTEGER NOT NULL CHECK (likes_enviados >= 0),
  player_level INTEGER NOT NULL CHECK (player_level > 0),
  player_exp INTEGER NOT NULL CHECK (player_exp >= 0),
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_ip INET
);

-- Tabela para estatísticas globais
CREATE TABLE IF NOT EXISTS global_stats (
  id VARCHAR(20) PRIMARY KEY DEFAULT 'main',
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  total_likes_sent INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_like_history_player_id ON like_history(player_id);
CREATE INDEX IF NOT EXISTS idx_like_history_created_at ON like_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_like_history_success ON like_history(success);

-- Função para atualizar estatísticas automaticamente
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza as estatísticas globais quando uma nova entrada é inserida
  INSERT INTO global_stats (id, total_requests, successful_requests, failed_requests, total_likes_sent, last_updated)
  VALUES (
    'main',
    (SELECT COUNT(*) FROM like_history),
    (SELECT COUNT(*) FROM like_history WHERE success = true),
    (SELECT COUNT(*) FROM like_history WHERE success = false),
    (SELECT COALESCE(SUM(likes_enviados), 0) FROM like_history WHERE success = true),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    successful_requests = EXCLUDED.successful_requests,
    failed_requests = EXCLUDED.failed_requests,
    total_likes_sent = EXCLUDED.total_likes_sent,
    last_updated = EXCLUDED.last_updated;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas automaticamente
DROP TRIGGER IF EXISTS trigger_update_global_stats ON like_history;
CREATE TRIGGER trigger_update_global_stats
  AFTER INSERT ON like_history
  FOR EACH ROW
  EXECUTE FUNCTION update_global_stats();

-- Política RLS (Row Level Security) - permite leitura e escrita para todos
ALTER TABLE like_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_stats ENABLE ROW LEVEL SECURITY;

-- Políticas para like_history
CREATE POLICY "Permitir leitura de like_history para todos" ON like_history
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de like_history para todos" ON like_history
  FOR INSERT WITH CHECK (true);

-- Políticas para global_stats
CREATE POLICY "Permitir leitura de global_stats para todos" ON global_stats
  FOR SELECT USING (true);

CREATE POLICY "Permitir atualização de global_stats para todos" ON global_stats
  FOR UPDATE USING (true);

CREATE POLICY "Permitir inserção de global_stats para todos" ON global_stats
  FOR INSERT WITH CHECK (true);

-- Inserir registro inicial de estatísticas
INSERT INTO global_stats (id, total_requests, successful_requests, failed_requests, total_likes_sent, last_updated)
VALUES ('main', 0, 0, 0, 0, NOW())
ON CONFLICT (id) DO NOTHING;
