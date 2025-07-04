/**
 * Create test user and run frontend integration test
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_BASE = 'http://localhost:5000';

async function createTestUser() {
  console.log('👤 Creating test user...');

  try {
    const userData = {
      username: 'testadmin',
      fullName: 'Test Admin',
      email: 'test.admin@frontend.com',
      password: 'TestPass123',
      phone: '+1234567890',
    };

    const response = await axios.post(
      `${API_BASE}/api/auth/register`,
      userData
    );

    console.log('✅ Test user created successfully');
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Email: ${response.data.user.email}`);

    return userData;
  } catch (error) {
    if (
      (error.response?.status === 400 &&
        error.response?.data?.message?.includes('Email já está em uso')) ||
      (error.response?.status === 409 &&
        error.response?.data?.message?.includes('já existe'))
    ) {
      console.log('ℹ️ Test user already exists, proceeding with login...');
      return {
        email: 'test.admin@frontend.com',
        password: 'TestPass123',
      };
    }

    console.error(
      '❌ Failed to create test user:',
      error.response?.data || error.message
    );
    throw error;
  }
}

async function loginTestUser(credentials) {
  console.log('🔐 Logging in test user...');

  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password,
    });

    console.log('✅ Login successful');
    console.log(
      `   Token received: ${response.data.token.substring(0, 20)}...`
    );

    return {
      token: response.data.token,
      userId: response.data.user.id,
    };
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testFrontendOperations(token, userId) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('\n🧪 Testing Frontend Operations...');
  console.log('='.repeat(50));

  // Test 1: Projects List
  console.log('\n📋 1. Testing Projects List...');
  try {
    const response = await axios.get(`${API_BASE}/api/projects-crud`, {
      headers,
    });
    console.log(`✅ Projects list: ${response.data.length} projects found`);
  } catch (error) {
    console.error(
      '❌ Projects list failed:',
      error.response?.data || error.message
    );
  }

  // Test 2: Create Project
  console.log('\n➕ 2. Testing Project Creation...');
  let projectId = null;
  try {
    const projectData = {
      name: `Frontend Test Project ${Date.now()}`,
      description: 'Test project for frontend integration',
      status: 'draft', // Correct enum value
      priority: 'medium', // Correct enum value
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 50000,
      owner: userId,
    };

    const response = await axios.post(
      `${API_BASE}/api/projects-crud`,
      projectData,
      { headers }
    );
    projectId = response.data._id;

    console.log(`✅ Project created: ${response.data.name}`);
    console.log(`   ID: ${projectId}`);
  } catch (error) {
    console.error(
      '❌ Project creation failed:',
      error.response?.data || error.message
    );
  }

  // Test 3: Get Project Detail
  if (projectId) {
    console.log('\n🔍 3. Testing Project Detail...');
    try {
      const response = await axios.get(
        `${API_BASE}/api/projects-crud/${projectId}`,
        { headers }
      );
      console.log(`✅ Project detail: ${response.data.name}`);
      console.log(`   Status: ${response.data.status}`);
    } catch (error) {
      console.error(
        '❌ Project detail failed:',
        error.response?.data || error.message
      );
    }
  }

  // Test 4: Update Project
  if (projectId) {
    console.log('\n✏️ 4. Testing Project Update...');
    try {
      const updateData = {
        name: `Updated Frontend Test ${Date.now()}`,
        status: 'active', // Correct enum value
        priority: 'high', // Correct enum value
      };

      const response = await axios.put(
        `${API_BASE}/api/projects-crud/${projectId}`,
        updateData,
        { headers }
      );
      console.log(`✅ Project updated: ${response.data.name}`);
      console.log(`   New status: ${response.data.status}`);
    } catch (error) {
      console.error(
        '❌ Project update failed:',
        error.response?.data || error.message
      );
    }
  }

  // Test 5: CSV Import (the key frontend feature)
  console.log('\n📤 5. Testing CSV Import...');
  try {
    const csvContent = `Nome do Projeto,Descrição,Status,Prioridade,Data Início,Data Fim,Orçamento,Equipe
CSV Test Project ${Date.now()},Imported from CSV,draft,high,2024-01-15,2024-06-15,80000,CSV Team`;

    const csvFile = 'frontend-test.csv';
    fs.writeFileSync(csvFile, csvContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(csvFile));

    const response = await axios.post(
      `${API_BASE}/api/projects/import-csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('✅ CSV import successful!');
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));

    // Cleanup
    fs.unlinkSync(csvFile);
  } catch (error) {
    console.error(
      '❌ CSV import failed:',
      error.response?.data || error.message
    );

    // Try cleanup anyway
    try {
      fs.unlinkSync('frontend-test.csv');
    } catch (e) {}
  }

  // Test 6: Project Statistics
  console.log('\n📊 6. Testing Project Statistics...');
  try {
    const response = await axios.get(`${API_BASE}/api/projects/statistics`, {
      headers,
    });
    console.log('✅ Statistics retrieved:');
    console.log(`   Total projects: ${response.data.totalProjects}`);
    console.log(`   Active projects: ${response.data.activeProjects}`);
  } catch (error) {
    console.error(
      '❌ Statistics failed:',
      error.response?.data || error.message
    );
  }

  // Test 7: Cleanup - Delete test project
  if (projectId) {
    console.log('\n🗑️ 7. Testing Project Deletion...');
    try {
      await axios.delete(`${API_BASE}/api/projects-crud/${projectId}`, {
        headers,
      });
      console.log('✅ Project deleted successfully');
    } catch (error) {
      console.error(
        '❌ Project deletion failed:',
        error.response?.data || error.message
      );
    }
  }

  console.log('\n🎉 Frontend Integration Test Complete!');
  console.log('='.repeat(50));
}

async function main() {
  try {
    console.log('🚀 Frontend-Backend Integration Test');
    console.log('='.repeat(60));

    const userCredentials = await createTestUser();
    const auth = await loginTestUser(userCredentials);
    await testFrontendOperations(auth.token, auth.userId);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

main();
