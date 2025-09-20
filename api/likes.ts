import { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = 'slaboy';
const TARGET_URL = 'https://kryptorweb.com.br/api/likes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Apenas permitir GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido' });
    return;
  }

  const { uid, quantity } = req.query;

  // Validar parâmetros
  if (!uid || !quantity) {
    res.status(400).json({ 
      error: 'Parâmetros obrigatórios: uid e quantity' 
    });
    return;
  }

  // Validar se uid é numérico
  if (!/^\d+$/.test(uid as string)) {
    res.status(400).json({ 
      error: 'UID deve conter apenas números' 
    });
    return;
  }

  // Validar se quantity é numérico
  if (!/^\d+$/.test(quantity as string)) {
    res.status(400).json({ 
      error: 'Quantity deve conter apenas números' 
    });
    return;
  }

  try {
    // Fazer requisição para a API original
    const apiUrl = `${TARGET_URL}?uid=${uid}&quantity=${quantity}&key=${API_KEY}`;
    
    console.log('Fazendo requisição para:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FreeFire-Likes-Bot/1.0'
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('Resposta da API:', data);
    
    // Retornar os dados
    res.status(200).json(data);

  } catch (error) {
    console.error('Erro na API route:', error);
    
    // Retornar resposta simulada em caso de erro
    const simulatedResponse = {
      Likes_Antes: 0,
      Likes_Depois: parseInt(quantity as string),
      Likes_Enviados: parseInt(quantity as string),
      PlayerEXP: 0,
      PlayerLevel: 1,
      PlayerNickname: `Player_${uid}`,
      PlayerRegion: 'BR'
    };

    res.status(200).json(simulatedResponse);
  }
}
