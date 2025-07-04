/**
 * Debug Project Listing Issue
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugListing() {
  try {
    // First authenticate
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'statsuser123@example.com',
      password: 'StatsPassword123!',
    });

    const token = authResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('🔍 Testing project listing...');

    // Test project listing
    const listResponse = await axios.get(`${BASE_URL}/api/projects`, {
      headers,
    });

    console.log('✅ Raw response status:', listResponse.status);
    console.log(
      '✅ Response data structure:',
      JSON.stringify(listResponse.data, null, 2)
    );

    // Check what the test condition is evaluating
    const projects = listResponse.data.data;
    console.log('Projects variable:', projects);
    console.log('Is array?', Array.isArray(projects));
    console.log('Length:', projects ? projects.length : 'undefined');
    console.log('Type:', typeof projects);
  } catch (error) {
    console.error('❌ Listing error:', error.response?.data || error.message);
  }
}

debugListing();
