/**
 * Debug Statistics Endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugStatistics() {
  try {
    // First authenticate using existing user
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'statsuser123@example.com',
      password: 'StatsPassword123!',
    });

    const token = authResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('🔍 Testing statistics endpoint...');

    // Test statistics endpoint directly
    const statsResponse = await axios.get(
      `${BASE_URL}/api/projects/statistics`,
      { headers }
    );
    console.log('✅ Statistics response:', statsResponse.data);
  } catch (error) {
    console.error(
      '❌ Statistics error:',
      error.response?.data || error.message
    );
    console.error('Error stack:', error.stack);
  }
}

debugStatistics();
