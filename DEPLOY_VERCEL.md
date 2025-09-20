# Deploy no Vercel - Free Fire Likes Bot

## 🚀 Instruções de Deploy

### 1. Preparação
- O projeto já está configurado para funcionar no Vercel
- A API route foi criada em `api/likes.ts`
- O arquivo `vercel.json` configura CORS e timeouts

### 2. Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel

# Deploy em produção
vercel --prod
```

### 3. Deploy via GitHub
1. Conectar repositório no Vercel
2. Configurar build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4. Configurações Importantes

#### API Route
- **Arquivo**: `api/likes.ts`
- **Endpoint**: `https://seu-dominio.vercel.app/api/likes`
- **Método**: GET
- **Parâmetros**: `uid`, `quantity`

#### CORS
- Configurado para aceitar requisições de qualquer origem
- Headers configurados no `vercel.json`

#### Fallback
- Se a API principal falhar, usa proxy público
- Se tudo falhar, retorna resposta simulada

### 5. Testando

#### Teste Local
```bash
npm run dev
# Acesse: http://localhost:8080
```

#### Teste da API
```bash
curl "https://seu-dominio.vercel.app/api/likes?uid=12345678&quantity=100"
```

### 6. Monitoramento

#### Logs da Vercel
- Acesse o dashboard da Vercel
- Vá em Functions > api/likes
- Veja os logs de execução

#### Console do Navegador
- Abra DevTools (F12)
- Veja os logs de requisições
- Verifique se está usando a API route

### 7. Troubleshooting

#### Problema: CORS Error
- **Solução**: Verificar se `vercel.json` está correto
- **Verificar**: Headers CORS na API route

#### Problema: API não responde
- **Solução**: Verificar logs da Vercel
- **Verificar**: Se a API externa está funcionando

#### Problema: Timeout
- **Solução**: Aumentar `maxDuration` no `vercel.json`
- **Verificar**: Se a API externa responde rapidamente

### 8. Variáveis de Ambiente (Opcional)

Se quiser usar variáveis de ambiente:

```bash
# No dashboard da Vercel
API_KEY=slaboy
TARGET_URL=https://kryptorweb.com.br/api/likes
```

E atualizar `api/likes.ts`:
```typescript
const API_KEY = process.env.API_KEY || 'slaboy';
const TARGET_URL = process.env.TARGET_URL || 'https://kryptorweb.com.br/api/likes';
```

## ✅ Checklist de Deploy

- [ ] Código commitado no GitHub
- [ ] Vercel conectado ao repositório
- [ ] Build configurado (Vite)
- [ ] API route funcionando
- [ ] CORS configurado
- [ ] Teste realizado
- [ ] Logs monitorados

## 🎯 Resultado Esperado

Após o deploy, o sistema deve:
1. ✅ Carregar normalmente no Vercel
2. ✅ Fazer requisições para `/api/likes`
3. ✅ Receber dados da API externa
4. ✅ Exibir modal com informações do jogador
5. ✅ Funcionar sem erros de CORS
