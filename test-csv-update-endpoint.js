const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testCSVUpdateEndpointDirectly() {
  console.log('🔍 Testing CSV Update Endpoint Directly...\n');

  try {
    // Step 1: First, let's create a test user and login
    const timestamp = Date.now();
    const testUser = {
      username: `testuser${timestamp}`,
      email: `testuser${timestamp}@test.com`,
      password: 'TestPassword123!',
      fullName: 'CSV Test User',
    };

    console.log('1. Registering user...');
    const registerResponse = await axios.post(
      `${API_BASE}/auth/register`,
      testUser
    );
    console.log('✅ User registered successfully');

    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
      username: testUser.username,
    });
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 3: Create a project using the correct endpoint format
    console.log('3. Creating test project...');

    // Create CSV file
    const initialCSVContent = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,inativo
Pedro Costa,33344455566,Técnico,ativo`;

    const csvPath = path.join(__dirname, 'temp-test.csv');
    fs.writeFileSync(csvPath, initialCSVContent);

    // Use direct form data construction
    const formData = new FormData();
    formData.append('name', 'CSV Update Test Project');
    formData.append('description', 'Testing CSV update functionality');
    formData.append('status', 'active');
    formData.append('csvFile', fs.createReadStream(csvPath));

    const createResponse = await axios.post(`${API_BASE}/projects`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000,
    });

    const projectId = createResponse.data.data.project.id;
    console.log(`✅ Project created: ${createResponse.data.data.project.name}`);
    console.log(`   Project ID: ${projectId}`);
    console.log(
      `   Initial workers: ${createResponse.data.data.project.workersCount || 0}`
    );

    // Clean up initial CSV
    fs.unlinkSync(csvPath);

    // Step 4: NOW TEST the CSV UPDATE endpoint
    console.log('\n4. Testing CSV UPDATE endpoint...');

    const updatedCSVContent = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,ativo
Pedro Costa,33344455566,Técnico,ativo
Ana Souza,77788899900,Coordenadora,ativo
Carlos Lima,11155577799,Supervisor,inativo
Lucia Ferreira,22266688800,Analista,ativo`;

    const updateCSVPath = path.join(__dirname, 'temp-update.csv');
    fs.writeFileSync(updateCSVPath, updatedCSVContent);

    const updateFormData = new FormData();
    updateFormData.append('csvFile', fs.createReadStream(updateCSVPath));

    console.log(
      `   Sending PUT request to: ${API_BASE}/projects/${projectId}/update-csv`
    );

    const updateResponse = await axios.put(
      `${API_BASE}/projects/${projectId}/update-csv`,
      updateFormData,
      {
        headers: {
          ...updateFormData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );

    console.log('✅ CSV Update successful!');
    console.log('Update Response Status:', updateResponse.status);
    console.log(
      'Update Response Data:',
      JSON.stringify(updateResponse.data, null, 2)
    );

    // Step 5: Verify the update worked
    console.log('\n5. Verifying the update...');
    const verifyResponse = await axios.get(
      `${API_BASE}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const updatedProject = verifyResponse.data.data
      ? verifyResponse.data.data.project
      : verifyResponse.data;
    console.log('✅ Project verification:');
    console.log(`   Name: ${updatedProject.name || 'N/A'}`);
    console.log(`   Workers Count: ${updatedProject.workersCount || 0}`);
    console.log(`   Status: ${updatedProject.status || 'N/A'}`);
    console.log(`   Last Updated: ${updatedProject.updatedAt || 'N/A'}`);

    // Clean up
    fs.unlinkSync(updateCSVPath);

    console.log('\n🎉 CSV UPDATE FUNCTIONALITY TEST PASSED!');
    console.log('\n📊 Summary:');
    console.log(`   Project ID: ${projectId}`);
    console.log(
      `   Initial workers: ${createResponse.data.data.project.workersCount || 0}`
    );
    console.log(`   Updated workers: ${updatedProject.workersCount || 0}`);
    console.log(
      `   Workers difference: ${(updatedProject.workersCount || 0) - (createResponse.data.data.project.workersCount || 0)}`
    );
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error(
        'Response Data:',
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request Method:', error.config.method);
    }

    // Clean up any temp files
    ['temp-test.csv', 'temp-update.csv'].forEach((filename) => {
      const filePath = path.join(__dirname, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Cleaned up ${filename}`);
      }
    });
  }
}

testCSVUpdateEndpointDirectly();
