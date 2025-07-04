/**
 * Test available endpoints
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function createTestUser() {
  try {
    const userData = {
      username: 'endpointtest',
      fullName: 'Endpoint Test',
      email: 'endpoint.test@test.com',
      password: 'TestPass123',
      phone: '+1234567890',
    };

    const response = await axios.post(
      `${API_BASE}/api/auth/register`,
      userData
    );
    console.log('✅ Test user created');
    return userData;
  } catch (error) {
    if (
      error.response?.status === 400 &&
      error.response?.data?.message?.includes('Email já está em uso')
    ) {
      return {
        email: 'endpoint.test@test.com',
        password: 'TestPass123',
      };
    }
    throw error;
  }
}

async function getToken() {
  const credentials = await createTestUser();

  const response = await axios.post(`${API_BASE}/api/auth/login`, {
    email: credentials.email,
    password: credentials.password,
  });

  return response.data.token;
}

async function testEndpoint(token, method, endpoint, data = null) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_BASE}${endpoint}`, { headers });
    } else if (method === 'POST') {
      response = await axios.post(`${API_BASE}${endpoint}`, data, { headers });
    }

    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    if (response.data) {
      if (Array.isArray(response.data)) {
        console.log(`   Array with ${response.data.length} items`);
      } else {
        console.log(
          `   Response keys: ${Object.keys(response.data).join(', ')}`
        );
      }
    }
  } catch (error) {
    console.log(
      `❌ ${method} ${endpoint} - ${error.response?.status || 'ERROR'}: ${error.response?.data?.message || error.message}`
    );
  }
}

async function main() {
  console.log('🔍 Testing Available Endpoints...');

  const token = await getToken();
  console.log('🔐 Got auth token\n');

  // Test different project endpoints
  const projectEndpoints = [
    '/api/projects',
    '/api/projects-crud',
    '/api/projects/list',
    '/api/project',
    '/api/project/list',
  ];

  console.log('📋 Testing GET endpoints:');
  for (const endpoint of projectEndpoints) {
    await testEndpoint(token, 'GET', endpoint);
  }

  console.log('\n➕ Testing POST endpoints:');
  const testProject = {
    name: 'Test Project',
    description: 'Test description',
    status: 'draft',
    priority: 'medium',
  };

  for (const endpoint of projectEndpoints) {
    await testEndpoint(token, 'POST', endpoint, testProject);
  }

  // Test CSV endpoints
  console.log('\n📤 Testing CSV endpoints:');
  const csvEndpoints = [
    '/api/projects/import-csv',
    '/api/projects/upload-csv',
    '/api/projects-crud/import-csv',
  ];

  for (const endpoint of csvEndpoints) {
    await testEndpoint(token, 'POST', endpoint, {});
  }

  // Test statistics
  console.log('\n📊 Testing Statistics endpoints:');
  const statEndpoints = [
    '/api/projects/statistics',
    '/api/statistics/projects',
    '/api/dashboard/stats',
  ];

  for (const endpoint of statEndpoints) {
    await testEndpoint(token, 'GET', endpoint);
  }
}

main().catch(console.error);
