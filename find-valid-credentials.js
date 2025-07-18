// Verificar usuários existentes e testar login
const axios = require('axios');

async function checkUsersAndLogin() {
  console.log('🔍 Verificando usuários e testando login...\n');

  try {
    // Tentar diferentes credenciais
    const credentials = [
      { email: 'admin@epu.com', password: 'admin123' },
      { email: 'admin@admin.com', password: 'admin123' },
      { email: 'test@test.com', password: 'test123' },
      { email: 'user@example.com', password: 'password123' },
    ];

    for (const cred of credentials) {
      console.log(`Tentando login com: ${cred.email}`);
      try {
        const response = await axios.post(
          'http://localhost:5000/api/auth/login',
          cred
        );
        const token = response.data.data?.token || response.data.token;

        if (token) {
          console.log(`✅ Login bem-sucedido com: ${cred.email}`);
          console.log(`Token: ${token.substring(0, 20)}...`);

          // Testar busca de projetos com este token
          const projectsResponse = await axios.get(
            'http://localhost:5000/api/projects',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const projects =
            projectsResponse.data.data?.data ||
            projectsResponse.data.data?.projects ||
            [];
          console.log(`📊 ${projects.length} projetos encontrados`);

          if (projects.length > 0) {
            const firstProject = projects[0];
            console.log(
              `📋 Primeiro projeto: ${firstProject.name || 'Sem nome'}`
            );
            console.log(`🆔 ID: ${firstProject._id || firstProject.id}`);
          }

          return { token, email: cred.email };
        }
      } catch (error) {
        console.log(
          `❌ Falha com ${cred.email}: ${error.response?.data?.message || error.message}`
        );
      }
    }

    console.log('\n❌ Nenhuma credencial funcionou. Vamos criar um usuário...');

    // Tentar criar usuário
    try {
      const newUser = {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
      };

      const createResponse = await axios.post(
        'http://localhost:5000/api/auth/register',
        newUser
      );
      console.log('✅ Usuário criado com sucesso');

      // Tentar login com o novo usuário
      const loginResponse = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email: newUser.email,
          password: newUser.password,
        }
      );

      const token = loginResponse.data.data?.token || loginResponse.data.token;
      console.log(`✅ Login com novo usuário: ${newUser.email}`);

      return { token, email: newUser.email };
    } catch (createError) {
      console.log(
        `❌ Erro ao criar usuário: ${createError.response?.data?.message || createError.message}`
      );
    }
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }

  return null;
}

checkUsersAndLogin().then((result) => {
  if (result) {
    console.log('\n🎯 CREDENCIAIS VÁLIDAS ENCONTRADAS:');
    console.log(`Email: ${result.email}`);
    console.log(`Token: ${result.token.substring(0, 30)}...`);
    console.log('\n✅ Agora você pode testar a navegação manualmente:');
    console.log('1. Abra: http://localhost:3000/projetos');
    console.log('2. Use estas credenciais se precisar fazer login');
    console.log('3. Clique nos cards para testar navegação');
  } else {
    console.log('\n❌ Não foi possível obter credenciais válidas');
  }
});
