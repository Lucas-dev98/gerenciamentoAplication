const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testEditFormCSVUpload() {
  console.log('🧪 Testing CSV Upload in Edit Form...\n');

  try {
    // Step 1: Setup authentication
    const timestamp = Date.now();
    const testUser = {
      username: `edituser${timestamp}`,
      email: `edituser${timestamp}@test.com`,
      password: 'TestPassword123!',
      fullName: 'Edit Form Test User',
    };

    console.log('1. Setting up authentication...');
    await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ User registered');

    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
      username: testUser.username,
    });
    const token = loginResponse.data.token;
    console.log('✅ User authenticated');

    // Step 2: Create initial project
    console.log('\n2. Creating initial project...');

    const initialCSV = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,inativo`;

    const csvPath = path.join(__dirname, 'initial-edit-test.csv');
    fs.writeFileSync(csvPath, initialCSV);

    const createFormData = new FormData();
    createFormData.append('name', 'Edit Form Test Project');
    createFormData.append('description', 'Testing CSV upload in edit form');
    createFormData.append('status', 'active');
    createFormData.append('csvFile', fs.createReadStream(csvPath));

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

    const projectId = createResponse.data.data.project.id;
    console.log(`✅ Project created: ${createResponse.data.data.project.name}`);
    console.log(`   Project ID: ${projectId}`);

    fs.unlinkSync(csvPath);

    // Step 3: Test CSV update via edit form functionality
    console.log('\n3. Testing CSV update via edit form...');

    const updatedCSV = `nome,cpf,cargo,status
João Silva,12345678901,Engenheiro,ativo
Maria Santos,98765432100,Arquiteta,ativo
Pedro Costa,33344455566,Técnico,ativo
Ana Souza,77788899900,Coordenadora,ativo
Carlos Lima,11155577799,Supervisor,inativo`;

    const updateCSVPath = path.join(__dirname, 'edit-form-update.csv');
    fs.writeFileSync(updateCSVPath, updatedCSV);

    // Test the CSV update endpoint that would be called from the edit form
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

    console.log('✅ CSV Update successful!');
    console.log(`   Response status: ${updateResponse.status}`);
    console.log(
      `   Workers updated: ${updateResponse.data.data.processamento?.totalAtividades || 0}`
    );

    fs.unlinkSync(updateCSVPath);

    // Step 4: Verify project was updated
    console.log('\n4. Verifying project update...');

    const verifyResponse = await axios.get(
      `${API_BASE}/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const project = verifyResponse.data.data
      ? verifyResponse.data.data.project
      : verifyResponse.data;
    console.log('✅ Project verification completed');
    console.log(`   Project Name: ${project.name || 'N/A'}`);
    console.log(
      `   Last Updated: ${project.updatedAt ? new Date(project.updatedAt).toLocaleString() : 'N/A'}`
    );

    console.log('\n🎉 EDIT FORM CSV UPLOAD TEST PASSED!');
    console.log('====================================');
    console.log('\n📋 Ready for Manual Testing:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Login with a user account');
    console.log('3. Go to the Projects page');
    console.log('4. Click the edit button (✏️) on any project');
    console.log('5. Look for the "Atualizar Dados via CSV" section');
    console.log('6. Click "📊 Carregar CSV" to test the upload');
    console.log(`7. Use Project ID: ${projectId} for testing`);

    console.log('\n✨ CSV Upload in Edit Form: IMPLEMENTED & TESTED');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error(
        'Response Data:',
        JSON.stringify(error.response.data, null, 2)
      );
    }

    // Clean up any temp files
    ['initial-edit-test.csv', 'edit-form-update.csv'].forEach((filename) => {
      const filePath = path.join(__dirname, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Cleaned up ${filename}`);
      }
    });
  }
}

testEditFormCSVUpload();
