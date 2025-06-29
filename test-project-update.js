// Test script to verify project update functionality with mock data
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testProjectUpdate() {
  try {
    console.log('🧪 Testing Project Update with Mock Data...\n');

    // Step 1: Register user first
    console.log('1. Registrando usuário...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123!',
        fullName: 'Test User',
        phone: '1234567890',
      });
      console.log('✅ Usuário registrado com sucesso');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 409) {
        console.log('ℹ️ Usuário já existe, continuando...');
      } else {
        throw error;
      }
    }

    // Step 2: Login to get token
    console.log('\n2. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 3: Get list of projects to verify mock data
    console.log('\n3. Listando projetos disponíveis...');
    const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log('Response data:', projectsResponse.data);

    const projects = projectsResponse.data.data.projects;
    console.log('✅ Projetos encontrados:', projects.length);

    if (projects.length > 0) {
      const firstProject = projects[0];
      console.log('Primeiro projeto:', {
        id: firstProject._id,
        name: firstProject.name,
        status: firstProject.status,
        progress: firstProject.progress,
      });
      console.log('Full project object:', firstProject);

      // Step 4: Test update project with mock ID
      console.log('\n4. Testando atualização de projeto...');
      const updateData = {
        name: 'Projeto Atualizado - Teste',
        description: 'Descrição atualizada via teste',
        status: 'active',
        progress: 85,
        priority: 'medium',
      };

      const updateResponse = await axios.put(
        `${BASE_URL}/projects/${firstProject.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Projeto atualizado com sucesso!');
      console.log('Update response:', updateResponse.data);
      const updatedProject =
        updateResponse.data.data?.project || updateResponse.data.project;

      if (updatedProject) {
        console.log('Dados atualizados:', {
          id: updatedProject.id || updatedProject._id,
          name: updatedProject.name,
          status: updatedProject.status,
          progress: updatedProject.progress,
          priority: updatedProject.priority,
        });
      }

      // Step 5: Verify the update by getting the project again
      console.log('\n5. Verificando se a atualização foi persistida...');
      const verifyResponse = await axios.get(
        `${BASE_URL}/projects/${firstProject.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Verificação bem-sucedida!');
      console.log('Verify response:', verifyResponse.data);
      const verifiedProject =
        verifyResponse.data.data?.project || verifyResponse.data.project;

      if (verifiedProject) {
        console.log('Projeto após atualização:', {
          id: verifiedProject.id || verifiedProject._id,
          name: verifiedProject.name,
          status: verifiedProject.status,
          progress: verifiedProject.progress,
          priority: verifiedProject.priority,
          updatedAt: verifiedProject.updatedAt,
        });
      }
    } else {
      console.log('❌ Nenhum projeto encontrado para testar atualização');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
}

testProjectUpdate();
