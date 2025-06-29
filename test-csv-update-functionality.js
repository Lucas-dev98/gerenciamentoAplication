const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Test data for CSV content
const sampleCSVContent = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,ativo
Pedro Oliveira,11122233344,Técnico,inativo
Ana Costa,55566677788,Gerente,ativo`;

// Test user credentials
const TEST_USER = {
  name: 'CSV Test User',
  email: `csvtest${Date.now()}@test.com`,
  password: 'TestPassword123!',
  role: 'admin',
};

let authToken = null;

async function authenticateUser() {
  console.log('🔐 Authenticating user...');

  try {
    // Try to register the user first
    try {
      await axios.post(`${API_BASE}/auth/register`, TEST_USER);
      console.log('✅ User registered successfully');
    } catch (regError) {
      if (regError.response && regError.response.status === 400) {
        console.log('ℹ️ User may already exist, proceeding with login');
      } else {
        throw regError;
      }
    }

    // Login to get token
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    authToken = loginResponse.data.token;
    console.log('✅ User authenticated successfully');

    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    return authToken;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

async function testCSVUpdateFunctionality() {
  console.log('🧪 Testing CSV Update Functionality...\n');

  try {
    // Step 0: Authenticate
    await authenticateUser();

    // Step 1: Get list of existing projects
    console.log('\n1. Getting existing projects...');
    const projectsResponse = await axios.get(`${API_BASE}/projects`);
    const projects = projectsResponse.data;

    if (projects.length === 0) {
      console.log('❌ No projects found. Creating a test project first...');
      await createTestProject();
      return;
    }

    const testProject = projects[0];
    console.log(
      `✅ Found project: ${testProject.name} (ID: ${testProject._id})`
    );
    console.log(`   Current status: ${testProject.status || 'N/A'}`);
    console.log(`   Current workers count: ${testProject.workersCount || 0}`);

    // Step 2: Create a temporary CSV file for testing
    console.log('\n2. Creating temporary CSV file...');
    const tempCSVPath = path.join(__dirname, 'temp-update-test.csv');

    // Add some different data to see the update effect
    const updatedCSVContent = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,ativo
Pedro Oliveira,11122233344,Técnico,ativo
Ana Costa,55566677788,Gerente,ativo
Carlos Ferreira,99988877766,Supervisor,ativo
Lucia Mendes,33344455566,Coordenadora,inativo`;

    fs.writeFileSync(tempCSVPath, updatedCSVContent);
    console.log('✅ Temporary CSV file created');

    // Step 3: Test the CSV update API endpoint
    console.log('\n3. Testing CSV update API endpoint...');

    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(tempCSVPath));

    const updateResponse = await axios.put(
      `${API_BASE}/projects/${testProject._id}/update-csv`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
      }
    );

    console.log('✅ CSV update API response:', updateResponse.status);
    console.log('Response data:', JSON.stringify(updateResponse.data, null, 2));

    // Step 4: Verify the project was updated
    console.log('\n4. Verifying project was updated...');
    const updatedProjectResponse = await axios.get(
      `${API_BASE}/projects/${testProject._id}`
    );
    const updatedProject = updatedProjectResponse.data;

    console.log(`✅ Updated project status: ${updatedProject.status || 'N/A'}`);
    console.log(
      `✅ Updated workers count: ${updatedProject.workersCount || 0}`
    );
    console.log(`✅ Last updated: ${updatedProject.updatedAt}`);

    // Step 5: Compare before and after
    console.log('\n5. Comparison:');
    console.log(
      `Workers count: ${testProject.workersCount || 0} → ${updatedProject.workersCount || 0}`
    );
    console.log(
      `Status: ${testProject.status || 'N/A'} → ${updatedProject.status || 'N/A'}`
    );

    // Step 6: Clean up temporary file
    console.log('\n6. Cleaning up...');
    fs.unlinkSync(tempCSVPath);
    console.log('✅ Temporary file removed');

    console.log('\n🎉 CSV Update Functionality Test PASSED!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    // Clean up temp file even if test fails
    const tempCSVPath = path.join(__dirname, 'temp-update-test.csv');
    if (fs.existsSync(tempCSVPath)) {
      fs.unlinkSync(tempCSVPath);
      console.log('🧹 Cleaned up temporary file');
    }
  }
}

async function createTestProject() {
  console.log('\nCreating a test project for CSV update testing...');

  try {
    const tempCSVPath = path.join(__dirname, 'temp-create-test.csv');
    fs.writeFileSync(tempCSVPath, sampleCSVContent);

    const formData = new FormData();
    formData.append('name', 'Test Project for CSV Update');
    formData.append(
      'description',
      'Test project created for CSV update functionality testing'
    );
    formData.append('csvFile', fs.createReadStream(tempCSVPath));

    const response = await axios.post(`${API_BASE}/projects`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000,
    });

    console.log('✅ Test project created:', response.data.name);
    fs.unlinkSync(tempCSVPath);

    // Now run the CSV update test
    await testCSVUpdateFunctionality();
  } catch (error) {
    console.error('❌ Failed to create test project:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testCSVUpdateFunctionality();
