/**
 * Simple Database Check - Verify MongoDB connection and data
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

async function checkDatabase() {
  console.log('🔍 CHECKING DATABASE STATUS');
  console.log('============================\n');

  try {
    // Login to get token
    console.log('1. 👤 Getting authentication token...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'manager@epu.com',
      password: 'manager123',
    });

    const token = loginResponse.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('✅ Authentication successful');

    // Check projects with different query parameters
    console.log('\n2. 📊 Checking projects with different parameters...');

    // No parameters
    console.log('\n🔸 Request: GET /api/projects (no parameters)');
    const response1 = await axios.get(`${API_URL}/projects`, {
      headers: authHeaders,
    });
    console.log('   Response structure:', Object.keys(response1.data));
    console.log('   Data:', JSON.stringify(response1.data, null, 2));

    // With large limit
    console.log('\n🔸 Request: GET /api/projects?limit=100');
    const response2 = await axios.get(`${API_URL}/projects?limit=100`, {
      headers: authHeaders,
    });
    console.log('   Projects found:', response2.data?.data?.length || 0);
    console.log('   Total count:', response2.data?.pagination?.total || 0);

    // Check specific project ID from our previous test
    const projectId = '6867c9682c14b94f431cc7b9'; // From previous test output
    console.log(`\n🔸 Request: GET /api/projects/${projectId}`);
    try {
      const response3 = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: authHeaders,
      });
      console.log('   Project found:', response3.data?.data?.name || 'No name');
      console.log('   Response structure:', Object.keys(response3.data));
    } catch (error) {
      console.log('   Error:', error.response?.data || error.message);
    }

    // Create a simple test project
    console.log('\n3. 🆕 Creating a simple test project...');
    const simpleProject = {
      name: 'Simple Test Project',
      description: 'A minimal test project',
      owner: loginResponse.data.user.id,
    };

    const createResponse = await axios.post(
      `${API_URL}/projects`,
      simpleProject,
      { headers: authHeaders }
    );
    console.log('✅ Simple project created');
    console.log('   Project ID:', createResponse.data.data?._id);
    console.log('   Project Name:', createResponse.data.data?.name);

    // Check list again
    console.log('\n4. 📋 Checking project list after creation...');
    const finalResponse = await axios.get(`${API_URL}/projects?limit=100`, {
      headers: authHeaders,
    });
    console.log('   Projects found:', finalResponse.data?.data?.length || 0);
    console.log('   Total count:', finalResponse.data?.pagination?.total || 0);

    if (finalResponse.data?.data?.length > 0) {
      console.log('\n📄 Project list:');
      finalResponse.data.data.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.name} (ID: ${project._id})`);
      });
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

checkDatabase().catch(console.error);
