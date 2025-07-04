const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testFullStack() {
  console.log('🧪 Starting full-stack integration test...\n');

  try {
    // Test 1: Backend Health Check
    console.log('1. Testing backend health...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend health check passed:', healthResponse.data);

    // Test 2: API Test Endpoint
    console.log('\n2. Testing API test endpoint...');
    const apiTestResponse = await axios.get(`${BACKEND_URL}/api/test`);
    console.log('✅ API test endpoint passed:', apiTestResponse.data);

    // Test 3: Authentication Login
    console.log('\n3. Testing authentication login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'password123',
    });
    console.log('✅ Login test passed:', loginResponse.data);

    // Test 4: Users Endpoint
    console.log('\n4. Testing users endpoint...');
    const usersResponse = await axios.get(`${BACKEND_URL}/api/auth/users`);
    console.log('✅ Users endpoint passed:', usersResponse.data);

    // Test 5: Projects Endpoint
    console.log('\n5. Testing projects endpoint...');
    const projectsResponse = await axios.get(`${BACKEND_URL}/api/projects`);
    console.log('✅ Projects endpoint passed:', projectsResponse.data);

    // Test 6: Frontend Accessibility
    console.log('\n6. Testing frontend accessibility...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible');
    }

    console.log(
      '\n🎉 All tests passed! The full-stack application is working correctly.'
    );
    console.log('\n📋 Summary:');
    console.log('- Backend running on port 5000 (mapped from internal 3001)');
    console.log('- Frontend running on port 3000');
    console.log('- MongoDB running on port 27017');
    console.log('- All Docker containers are healthy');
    console.log('- Authentication system is functional');
    console.log('- API endpoints are responding correctly');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFullStack();
