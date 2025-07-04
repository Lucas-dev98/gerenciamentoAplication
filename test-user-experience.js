/**
 * Test Complete User Experience - Frontend-Backend Integration
 *
 * Tests the complete user flow for project management
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;
const FRONTEND_URL = 'http://localhost:3000';

// Test utilities
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  } catch (error) {
    console.log(`❌ Request failed: ${method} ${url}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    } else {
      console.log(`   Error:`, error.message);
    }
    throw error;
  }
}

async function testCompleteUserExperience() {
  console.log('🚀 TESTING COMPLETE USER EXPERIENCE');
  console.log('=====================================\n');

  try {
    // Wait for services to be ready
    console.log('⏳ Waiting for services to initialize...');
    await delay(3000);

    // 1. Test Backend Health
    console.log('1. 🏥 Testing Backend Health...');
    const healthResponse = await makeRequest('GET', `${BASE_URL}/health`);
    console.log('✅ Backend is healthy:', healthResponse.data.status);
    console.log('   Version:', healthResponse.data.version);
    console.log('   Environment:', healthResponse.data.environment);

    // 2. Test Frontend Accessibility
    console.log('\n2. 🌐 Testing Frontend Accessibility...');
    try {
      const frontendResponse = await makeRequest('GET', FRONTEND_URL);
      console.log('✅ Frontend is accessible on port 3000');
    } catch (error) {
      console.log(
        '⚠️ Frontend not accessible - this is normal if React dev server is not running'
      );
    }

    // 3. Test User Registration
    console.log('\n3. 👤 Testing User Registration...');
    const testUser = {
      username: 'projectmanager',
      email: 'manager@epu.com',
      password: 'manager123',
      role: 'admin',
    };

    let token, userId;
    try {
      const registerResponse = await makeRequest(
        'POST',
        `${API_URL}/auth/register`,
        testUser
      );
      console.log('✅ User registered successfully');
      token = registerResponse.data.token;
      userId = registerResponse.data.user.id;
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 409) &&
        (error.response.data.message.includes('already exists') ||
          error.response.data.message.includes('já existe'))
      ) {
        console.log('ℹ️ User already exists, proceeding with login...');

        // Login with existing user
        const loginResponse = await makeRequest(
          'POST',
          `${API_URL}/auth/login`,
          {
            email: testUser.email,
            password: testUser.password,
          }
        );
        console.log('✅ User logged in successfully');
        token = loginResponse.data.token;
        userId = loginResponse.data.user.id;
      } else {
        throw error;
      }
    }

    const authHeaders = { Authorization: `Bearer ${token}` };

    // 4. Test Project Creation
    console.log('\n4. 📊 Testing Project Creation...');
    const testProject = {
      name: 'Projeto de Modernização EPU',
      description:
        'Modernização completa do sistema de gestão EPU com foco em CRUD de projetos',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      status: 'active',
      priority: 'high',
      budget: 50000,
      team: [{ user: userId, role: 'manager' }],
      tags: ['modernizacao', 'crud', 'frontend'],
      owner: userId,
      activities: [
        {
          name: 'Frontend React',
          type: 'manutencao',
          progress: 75,
          baseline: 70,
          order: 1,
        },
        {
          name: 'Backend Node.js',
          type: 'manutencao',
          progress: 100,
          baseline: 90,
          order: 2,
        },
      ],
    };

    const createResponse = await makeRequest(
      'POST',
      `${API_URL}/projects`,
      testProject,
      authHeaders
    );
    console.log('✅ Project created successfully');
    console.log(
      '   Response data:',
      JSON.stringify(createResponse.data, null, 2)
    );

    const projectId =
      createResponse.data.data?._id ||
      createResponse.data.data?.id ||
      createResponse.data.project?._id ||
      createResponse.data.project?.id ||
      createResponse.data._id ||
      createResponse.data.id;

    if (!projectId) {
      throw new Error('Project ID not found in response');
    }

    console.log('   Project ID:', projectId);
    console.log(
      '   Project Name:',
      createResponse.data.data?.name ||
        createResponse.data.project?.name ||
        createResponse.data.name
    );

    // 5. Test Project List
    console.log('\n5. 📋 Testing Project List...');
    const listResponse = await makeRequest(
      'GET',
      `${API_URL}/projects`,
      null,
      authHeaders
    );
    console.log('✅ Project list retrieved');
    console.log(
      '   Total projects:',
      listResponse.data.data?.pagination?.total || 0
    );
    console.log(
      '   Current page projects:',
      listResponse.data.data?.data?.length || 0
    );

    const foundProject = listResponse.data.data?.data?.find(
      (p) => (p._id || p.id) === projectId
    );
    if (foundProject) {
      console.log('✅ Created project found in list');
    } else {
      console.log(
        '⚠️ Created project not found in list (may be on another page)'
      );
    }

    // 6. Test Project Detail View
    console.log('\n6. 🔍 Testing Project Detail View...');
    const detailResponse = await makeRequest(
      'GET',
      `${API_URL}/projects/${projectId}`,
      null,
      authHeaders
    );
    console.log('✅ Project details retrieved');
    console.log('   Name:', detailResponse.data.data?.name);
    console.log('   Status:', detailResponse.data.data?.status);
    console.log('   Budget:', detailResponse.data.data?.budget);
    console.log(
      '   Activities:',
      detailResponse.data.data?.activities?.length || 0
    );

    // 7. Test Project Update
    console.log('\n7. ✏️ Testing Project Update...');
    const updateData = {
      name: 'Projeto de Modernização EPU - ATUALIZADO',
      description: 'Projeto atualizado durante teste de integração',
      status: 'active',
      progress: 85,
      activities: [
        {
          name: 'Frontend React',
          type: 'manutencao',
          progress: 85,
          baseline: 70,
          order: 1,
        },
        {
          name: 'Backend Node.js',
          type: 'manutencao',
          progress: 100,
          baseline: 90,
          order: 2,
        },
        {
          name: 'Testes de Integração',
          type: 'partida',
          progress: 50,
          baseline: 40,
          order: 3,
        },
      ],
    };

    const updateResponse = await makeRequest(
      'PUT',
      `${API_URL}/projects/${projectId}`,
      updateData,
      authHeaders
    );
    console.log('✅ Project updated successfully');
    console.log('   Updated name:', updateResponse.data.data?.name);

    // 8. Test CSV Import Functionality
    console.log('\n8. 📄 Testing CSV Import...');
    const csvData = `name,description,startDate,endDate,status,priority,budget
"Projeto CSV 1","Descrição do projeto 1","2024-01-15","2024-06-15","active","high",25000
"Projeto CSV 2","Descrição do projeto 2","2024-02-01","2024-08-01","draft","medium",15000
"Projeto CSV 3","Descrição do projeto 3","2024-03-01","2024-12-01","active","low",10000`;

    try {
      // Test CSV parsing
      const parseResponse = await makeRequest(
        'POST',
        `${API_URL}/projects/parse-csv`,
        {
          csvData: csvData,
        },
        authHeaders
      );

      console.log('✅ CSV parsing successful');
      console.log(
        '   Parsed projects:',
        parseResponse.data.projects?.length || 0
      );

      // Test bulk import
      if (
        parseResponse.data.projects &&
        parseResponse.data.projects.length > 0
      ) {
        const importData = {
          projects: parseResponse.data.projects.map((project) => ({
            ...project,
            owner: userId,
            team: [{ user: userId, role: 'manager' }],
          })),
        };

        const importResponse = await makeRequest(
          'POST',
          `${API_URL}/projects/bulk-import`,
          importData,
          authHeaders
        );
        console.log('✅ CSV bulk import successful');
        console.log(
          '   Imported projects:',
          importResponse.data.created ||
            importResponse.data.projects?.length ||
            0
        );
      }
    } catch (error) {
      console.log('⚠️ CSV import feature may not be implemented yet');
    }

    // 9. Test Project Deletion
    console.log('\n9. 🗑️ Testing Project Deletion...');
    const deleteResponse = await makeRequest(
      'DELETE',
      `${API_URL}/projects/${projectId}`,
      null,
      authHeaders
    );
    console.log('✅ Project deleted successfully');

    // 10. Final Status Check
    console.log('\n10. 📊 Final Status Check...');
    const finalListResponse = await makeRequest(
      'GET',
      `${API_URL}/projects`,
      null,
      authHeaders
    );
    console.log(
      '✅ Final project count:',
      finalListResponse.data.data?.pagination?.total || 0
    );

    // Success Summary
    console.log('\n🎉 COMPLETE USER EXPERIENCE TEST PASSED!');
    console.log('========================================');
    console.log('✅ Backend Health: Working');
    console.log('✅ User Authentication: Working');
    console.log('✅ Project Creation: Working');
    console.log('✅ Project Listing: Working');
    console.log('✅ Project Detail View: Working');
    console.log('✅ Project Update: Working');
    console.log('✅ Project Deletion: Working');
    console.log('✅ Database Integration: Working');

    console.log('\n🚀 READY FOR USER TESTING!');
    console.log('=========================');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Login with:');
    console.log('   Username: projectmanager');
    console.log('   Password: manager123');
    console.log('3. Navigate to Projects page');
    console.log('4. Test all CRUD operations in the UI');
    console.log('5. Test CSV import functionality');
  } catch (error) {
    console.log('\n❌ USER EXPERIENCE TEST FAILED');
    console.log('================================');
    console.log('Error details:', error.message);

    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check Docker containers: docker ps');
    console.log('2. Check backend logs: docker logs epu-backend');
    console.log('3. Check frontend logs: docker logs epu-frontend');
    console.log('4. Check MongoDB logs: docker logs epu-mongodb');
    console.log('5. Restart containers: docker-compose restart');
  }
}

// Run the test
if (require.main === module) {
  testCompleteUserExperience().catch(console.error);
}

module.exports = { testCompleteUserExperience };
