const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Simple test user that should work
const TEST_USER = {
  username: 'testuser123',
  email: 'testuser123@test.com',
  password: '123456789',
  fullName: 'Test User CSV',
};

async function testCSVUpdate() {
  console.log('🧪 Testing CSV Update Functionality (Simple)...\n');

  try {
    // Step 1: Register and login
    console.log('1. Setting up authentication...');

    // Try to register
    try {
      const registerResponse = await axios.post(
        `${API_BASE}/auth/register`,
        TEST_USER
      );
      console.log('✅ User registered');
    } catch (error) {
      console.log('ℹ️ User probably exists, proceeding...');
    }

    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
      username: TEST_USER.username,
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Create a test project first
    console.log('\n2. Creating test project...');

    const createCSV = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,inativo`;

    const createCSVPath = path.join(__dirname, 'temp-create.csv');
    fs.writeFileSync(createCSVPath, createCSV);

    const createFormData = new FormData();
    createFormData.append('name', 'CSV Update Test Project');
    createFormData.append('description', 'Test project for CSV update');
    createFormData.append('csvFile', fs.createReadStream(createCSVPath));

    const createResponse = await axios.post(
      `${API_BASE}/projects`,
      createFormData,
      {
        headers: {
          ...createFormData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const projectId = createResponse.data._id;
    console.log(
      `✅ Project created: ${createResponse.data.name} (ID: ${projectId})`
    );
    console.log(`   Initial workers: ${createResponse.data.workersCount || 0}`);

    // Clean up temp file
    fs.unlinkSync(createCSVPath);

    // Step 3: Test CSV update
    console.log('\n3. Testing CSV update...');

    const updateCSV = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,ativo
Pedro Oliveira,11122233344,Técnico,ativo
Ana Costa,55566677788,Gerente,ativo
Carlos Ferreira,99988877766,Supervisor,inativo`;

    const updateCSVPath = path.join(__dirname, 'temp-update.csv');
    fs.writeFileSync(updateCSVPath, updateCSV);

    const updateFormData = new FormData();
    updateFormData.append('csvFile', fs.createReadStream(updateCSVPath));

    const updateResponse = await axios.put(
      `${API_BASE}/projects/${projectId}/update-csv`,
      updateFormData,
      {
        headers: {
          ...updateFormData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('✅ CSV update successful!');
    console.log(
      'Update response:',
      JSON.stringify(updateResponse.data, null, 2)
    );

    // Step 4: Verify the update
    console.log('\n4. Verifying update...');

    const verifyResponse = await axios.get(
      `${API_BASE}/projects/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedProject = verifyResponse.data;
    console.log(
      `✅ Updated workers count: ${updatedProject.workersCount || 0}`
    );
    console.log(`✅ Updated status: ${updatedProject.status || 'N/A'}`);

    // Clean up
    fs.unlinkSync(updateCSVPath);

    console.log('\n🎉 CSV Update Test PASSED!');
    console.log('\nSummary:');
    console.log(`- Project ID: ${projectId}`);
    console.log(`- Initial workers: ${createResponse.data.workersCount || 0}`);
    console.log(`- Updated workers: ${updatedProject.workersCount || 0}`);
    console.log(`- Project status: ${updatedProject.status || 'N/A'}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }

    // Clean up any temp files
    ['temp-create.csv', 'temp-update.csv'].forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

testCSVUpdate();
