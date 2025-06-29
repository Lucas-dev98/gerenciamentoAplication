const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function debugFrontendUpload() {
  console.log('🔍 DEBUGGING FRONTEND CSV UPLOAD ISSUE');
  console.log('=====================================');

  try {
    // 1. First, let's create a test user and login
    console.log('\n1. Creating test user...');
    const timestamp = Date.now();
    const registerResponse = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        username: `testuser${timestamp}`,
        email: `test-${timestamp}@test.com`,
        password: 'password123',
        fullName: 'Test User',
      }
    );
    console.log('✅ User created:', registerResponse.data);

    // 2. Login to get token
    console.log('\n2. Logging in...');
    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: registerResponse.data.user.email,
        password: 'password123',
      }
    );
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // 3. Create a test project
    console.log('\n3. Creating test project...');
    const projectResponse = await axios.post(
      'http://localhost:5000/api/projects',
      {
        name: 'Test Project for CSV Upload',
        description: 'Test project to debug CSV upload',
        status: 'draft',
        priority: 'medium',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log('Full project response:', projectResponse.data);
    const projectId =
      projectResponse.data.data?.project?.id ||
      projectResponse.data.project?._id ||
      projectResponse.data._id ||
      projectResponse.data.id;
    console.log('✅ Project created:', projectId);

    // 4. Create test CSV file
    console.log('\n4. Creating test CSV file...');
    const csvContent = `Nome,Descrição,Status,Prioridade
Frente 1,Descrição da frente 1,pendente,alta
Frente 2,Descrição da frente 2,em_progresso,media`;

    const csvPath = path.join(__dirname, 'test-upload.csv');
    fs.writeFileSync(csvPath, csvContent);
    console.log('✅ CSV file created:', csvPath);

    // 5. Upload CSV using the same approach as frontend
    console.log('\n5. Uploading CSV...');
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(csvPath));

    const uploadResponse = await axios.put(
      `http://localhost:5000/api/projects/${projectId}/update-csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    console.log('\n📋 COMPLETE UPLOAD RESPONSE:');
    console.log('============================');
    console.log('Status Code:', uploadResponse.status);
    console.log('Headers:', uploadResponse.headers);
    console.log('Data:', JSON.stringify(uploadResponse.data, null, 2));
    console.log(
      'typeof response.data.status:',
      typeof uploadResponse.data.status
    );
    console.log(
      'response.data.status === "success"?',
      uploadResponse.data.status === 'success'
    );

    // 6. Test the exact condition used in frontend
    console.log('\n🔍 FRONTEND CONDITION TEST:');
    console.log('===========================');
    const response = uploadResponse.data; // This is what frontend receives
    console.log('response:', response);
    console.log('response.status:', response.status);
    console.log('typeof response.status:', typeof response.status);
    console.log(
      'response.status === "success":',
      response.status === 'success'
    );

    if (response.status === 'success') {
      console.log('✅ FRONTEND CONDITION WOULD PASS - SUCCESS BRANCH');
    } else {
      console.log('❌ FRONTEND CONDITION WOULD FAIL - ERROR BRANCH');
      console.log('Expected: "success", Got:', response.status);
    }

    // 7. Clean up
    fs.unlinkSync(csvPath);
    console.log('\n🧹 Test CSV file deleted');
  } catch (error) {
    console.error('\n❌ ERROR OCCURRED:');
    console.error('==================');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

debugFrontendUpload();
