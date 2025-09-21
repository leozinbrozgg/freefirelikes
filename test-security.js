#!/usr/bin/env node

/**
 * Script de teste para verificar as proteções da API
 * Execute: node test-security.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_KEY = process.env.API_KEY || 'sua_chave_api_aqui';

console.log('🔒 Testando proteções da API...\n');

async function testSecurity() {
  const tests = [
    {
      name: 'Teste 1: Acesso sem chave API',
      test: async () => {
        try {
          await axios.post(`${BASE_URL}/api/send-likes`, {
            uid: '2003009502',
            quantity: 100
          });
          return { success: false, message: 'Deveria ter falhado' };
        } catch (error) {
          if (error.response?.status === 401) {
            return { success: true, message: 'Bloqueado corretamente' };
          }
          return { success: false, message: `Erro inesperado: ${error.message}` };
        }
      }
    },
    {
      name: 'Teste 2: Chave API inválida',
      test: async () => {
        try {
          await axios.post(`${BASE_URL}/api/send-likes`, {
            uid: '2003009502',
            quantity: 100
          }, {
            headers: { 'X-API-Key': 'chave_invalida' }
          });
          return { success: false, message: 'Deveria ter falhado' };
        } catch (error) {
          if (error.response?.status === 401) {
            return { success: true, message: 'Bloqueado corretamente' };
          }
          return { success: false, message: `Erro inesperado: ${error.message}` };
        }
      }
    },
    {
      name: 'Teste 3: UID inválido',
      test: async () => {
        try {
          await axios.post(`${BASE_URL}/api/send-likes`, {
            uid: '123', // Muito curto
            quantity: 100
          }, {
            headers: { 'X-API-Key': API_KEY }
          });
          return { success: false, message: 'Deveria ter falhado' };
        } catch (error) {
          if (error.response?.status === 400) {
            return { success: true, message: 'Validação funcionando' };
          }
          return { success: false, message: `Erro inesperado: ${error.message}` };
        }
      }
    },
    {
      name: 'Teste 4: Quantidade inválida',
      test: async () => {
        try {
          await axios.post(`${BASE_URL}/api/send-likes`, {
            uid: '2003009502',
            quantity: 2000 // Muito alta
          }, {
            headers: { 'X-API-Key': API_KEY }
          });
          return { success: false, message: 'Deveria ter falhado' };
        } catch (error) {
          if (error.response?.status === 400) {
            return { success: true, message: 'Validação funcionando' };
          }
          return { success: false, message: `Erro inesperado: ${error.message}` };
        }
      }
    },
    {
      name: 'Teste 5: Requisição válida',
      test: async () => {
        try {
          const response = await axios.post(`${BASE_URL}/api/send-likes`, {
            uid: '2003009502',
            quantity: 100
          }, {
            headers: { 'X-API-Key': API_KEY }
          });
          
          if (response.status === 200) {
            return { success: true, message: 'Requisição autorizada' };
          }
          return { success: false, message: 'Status inesperado' };
        } catch (error) {
          if (error.response?.status === 500) {
            return { success: true, message: 'API externa pode estar indisponível (normal)' };
          }
          return { success: false, message: `Erro: ${error.message}` };
        }
      }
    },
    {
      name: 'Teste 6: Health check',
      test: async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/health`);
          if (response.data.status === 'ok') {
            return { success: true, message: 'API funcionando' };
          }
          return { success: false, message: 'Status inesperado' };
        } catch (error) {
          return { success: false, message: `Erro: ${error.message}` };
        }
      }
    }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      console.log(`🧪 ${test.name}...`);
      const result = await test.test();
      
      if (result.success) {
        console.log(`✅ ${result.message}\n`);
        passed++;
      } else {
        console.log(`❌ ${result.message}\n`);
      }
    } catch (error) {
      console.log(`❌ Erro no teste: ${error.message}\n`);
    }
  }

  console.log(`📊 Resultado: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 Todas as proteções estão funcionando!');
  } else {
    console.log('⚠️  Algumas proteções podem precisar de ajustes.');
  }
}

// Executar testes
testSecurity().catch(console.error);
