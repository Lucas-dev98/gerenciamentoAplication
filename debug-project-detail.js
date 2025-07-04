/**
 * Debug Project Detail Response Structure
 */

const axios = require('axios');

async function debugProjectDetail() {
  console.log('🔍 DEBUGGING PROJECT DETAIL RESPONSE');
  console.log('====================================\n');

  try {
    // Login
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: 'manager@epu.com',
        password: 'manager123',
      }
    );

    const authHeaders = { Authorization: `Bearer ${loginResponse.data.token}` };

    // Get project list to find a valid ID
    const listResponse = await axios.get('http://localhost:5000/api/projects', {
      headers: authHeaders,
    });
    const projectId = listResponse.data.data.data[0]._id;

    console.log('Using project ID:', projectId);

    // Get project detail and log full response
    const detailResponse = await axios.get(
      `http://localhost:5000/api/projects/${projectId}`,
      { headers: authHeaders }
    );

    console.log('\n📄 Full Project Detail Response:');
    console.log(JSON.stringify(detailResponse.data, null, 2));

    console.log('\n🔍 Response Structure Analysis:');
    console.log('- Status Code:', detailResponse.status);
    console.log('- Response Keys:', Object.keys(detailResponse.data));

    if (detailResponse.data.data) {
      console.log('- Data Keys:', Object.keys(detailResponse.data.data));
      console.log('- Project Name:', detailResponse.data.data.name);
      console.log('- Project Status:', detailResponse.data.data.status);
    }
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

debugProjectDetail().catch(console.error);
