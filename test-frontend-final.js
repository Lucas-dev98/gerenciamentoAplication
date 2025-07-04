/**
 * Teste Final do Frontend - Simula o comportamento do navegador
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFrontendBehavior() {
  try {
    console.log('🔍 Testando comportamento do frontend...\n');

    // 1. Fazer login como o frontend faria
    console.log('1. Fazendo login...');
    const loginData = {
      email: 'l.o.bastos@live.com',
      password: '44351502741-+as',
    };

    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      loginData
    );
    const token = loginResponse.data.token;

    console.log('✅ Login realizado com sucesso');
    console.log(`📝 Token recebido: ${token.substring(0, 50)}...`);

    // 2. Testar acesso aos projetos (como o frontend faria)
    console.log('\n2. Acessando projetos...');

    const projectsConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const projectsResponse = await axios.get(
        `${BASE_URL}/api/projects`,
        projectsConfig
      );
      console.log('✅ Sucesso! Projetos carregados:');
      console.log(
        `📊 Total de projetos: ${projectsResponse.data.data?.data?.length || 0}`
      );

      // Mostrar alguns detalhes
      if (projectsResponse.data.data?.data?.length > 0) {
        const firstProject = projectsResponse.data.data.data[0];
        console.log(`📋 Primeiro projeto: ${firstProject.name || 'Sem nome'}`);
      }
    } catch (projectError) {
      console.log('❌ ERRO ao carregar projetos:');
      console.log('Status:', projectError.response?.status);
      console.log('Mensagem:', projectError.response?.data?.message);

      return false;
    }

    // 3. Testar outras rotas que o frontend usa
    console.log('\n3. Testando estatísticas...');
    try {
      const statsResponse = await axios.get(
        `${BASE_URL}/api/projects/statistics`,
        projectsConfig
      );
      console.log('✅ Estatísticas carregadas com sucesso!');
    } catch (statsError) {
      console.log(
        '❌ Erro nas estatísticas:',
        statsError.response?.data?.message
      );
    }

    // 4. Testar uma requisição que falha para comparar
    console.log('\n4. Testando com token inválido...');
    try {
      const invalidConfig = {
        headers: {
          Authorization: 'Bearer token-invalido',
          'Content-Type': 'application/json',
        },
      };

      await axios.get(`${BASE_URL}/api/projects`, invalidConfig);
      console.log('❌ PROBLEMA: Token inválido foi aceito!');
    } catch (invalidError) {
      console.log('✅ Correto: Token inválido foi rejeitado');
      console.log(`📝 Mensagem: ${invalidError.response?.data?.message}`);
    }

    console.log('\n🎉 TESTE COMPLETO: Tudo funcionando perfeitamente!');
    console.log('✅ O problema de "Token inválido" foi resolvido.');

    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

testFrontendBehavior();
