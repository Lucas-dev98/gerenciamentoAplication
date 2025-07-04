/**
 * Debug Authentication Issue
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugAuth() {
  try {
    console.log('🔍 Testing backend connectivity...');

    // Test basic connectivity
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    console.log('\n🔍 Testing auth endpoints...');

    // Test registration with detailed error info
    const testUser = {
      username: 'debuguser123',
      email: 'debuguser123@example.com',
      password: 'DebugPassword123!',
      department: 'TI',
      role: 'user',
    };

    try {
      const registerResponse = await axios.post(
        `${BASE_URL}/api/auth/register`,
        testUser
      );
      console.log('✅ Registration successful:', registerResponse.data);
    } catch (regError) {
      console.log(
        '❌ Registration error:',
        regError.response?.data || regError.message
      );
    }

    // Test login
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: testUser.username,
        password: testUser.password,
      });
      console.log('✅ Login successful:', loginResponse.data);
    } catch (loginError) {
      console.log(
        '❌ Login error:',
        loginError.response?.data || loginError.message
      );
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

debugAuth();
