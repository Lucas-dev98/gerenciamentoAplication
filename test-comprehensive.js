// Comprehensive test script to validate all mock functionalities
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runComprehensiveTests() {
  try {
    console.log('🧪 Comprehensive Test Suite - EPU-Gestão Mock Mode\n');
    console.log('='.repeat(50));

    let token = '';

    // Test 1: User Registration
    console.log('\n📝 TEST 1: User Registration');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        username: 'comprehensive-test',
        email: 'comprehensive@test.com',
        password: 'Test123!',
        fullName: 'Comprehensive Test User',
        phone: '9876543210',
      });
      console.log(
        '✅ Registration successful:',
        registerResponse.data.user.username
      );
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, continuing...');
      } else {
        throw error;
      }
    }

    // Test 2: User Login
    console.log('\n🔐 TEST 2: User Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'comprehensive@test.com',
      password: 'Test123!',
    });
    token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test 3: List All Projects
    console.log('\n📋 TEST 3: List All Projects');
    const projectsResponse = await axios.get(`${BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const projects = projectsResponse.data.data.projects;
    console.log(`✅ Projects listed: ${projects.length} found`);

    if (projects.length > 0) {
      console.log(
        `   - First project: "${projects[0].name}" (ID: ${projects[0].id})`
      );
    }

    // Test 4: Get Project by ID
    if (projects.length > 0) {
      console.log('\n🔍 TEST 4: Get Project by ID');
      const projectId = projects[0].id;
      const projectResponse = await axios.get(
        `${BASE_URL}/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const project = projectResponse.data.data.project;
      console.log(`✅ Project retrieved: "${project.name}"`);
      console.log(
        `   - Status: ${project.status}, Progress: ${project.progress}%`
      );
    }

    // Test 5: Create New Project
    console.log('\n➕ TEST 5: Create New Project');
    const newProjectData = {
      name: 'Projeto Teste Criado via API',
      description: 'Este projeto foi criado automaticamente durante os testes',
      status: 'draft',
      priority: 'medium',
      progress: 0,
    };
    const createResponse = await axios.post(
      `${BASE_URL}/projects`,
      newProjectData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const createdProject = createResponse.data.data.project;
    console.log(
      `✅ Project created: "${createdProject.name}" (ID: ${createdProject.id})`
    );

    // Test 6: Update Project
    console.log('\n✏️ TEST 6: Update Project');
    const updateData = {
      name: 'Projeto Teste Atualizado',
      description: 'Descrição atualizada automaticamente',
      status: 'active',
      priority: 'high',
      progress: 30,
    };
    const updateResponse = await axios.put(
      `${BASE_URL}/projects/${createdProject.id}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const updatedProject = updateResponse.data.data.project;
    console.log(`✅ Project updated: "${updatedProject.name}"`);
    console.log(
      `   - New status: ${updatedProject.status}, Progress: ${updatedProject.progress}%`
    );

    // Test 7: List All Notices
    console.log('\n📢 TEST 7: List All Notices');
    const noticesResponse = await axios.get(`${BASE_URL}/notices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notices =
      noticesResponse.data.data?.notices || noticesResponse.data.notices || [];
    console.log(`✅ Notices listed: ${notices.length} found`);

    if (notices.length > 0) {
      console.log(
        `   - First notice: "${notices[0].title}" (Type: ${notices[0].type})`
      );
    }

    // Test 8: Create New Notice
    console.log('\n📝 TEST 8: Create New Notice');
    const newNoticeData = {
      title: 'Aviso de Teste Criado via API',
      content:
        'Este aviso foi criado automaticamente durante os testes para verificar o funcionamento do sistema.',
      type: 'info',
      priority: 'medium',
    };
    const createNoticeResponse = await axios.post(
      `${BASE_URL}/notices`,
      newNoticeData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const createdNotice =
      createNoticeResponse.data.data?.notice ||
      createNoticeResponse.data.notice;
    console.log(
      `✅ Notice created: "${createdNotice.title}" (ID: ${createdNotice.id || createdNotice._id})`
    );

    // Test 9: Delete Project
    console.log('\n🗑️ TEST 9: Delete Project');
    const deleteResponse = await axios.delete(
      `${BASE_URL}/projects/${createdProject.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`✅ Project deleted: "${createdProject.name}"`);

    // Final Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log('✅ User registration and login working');
    console.log('✅ Project CRUD operations working with mock data');
    console.log('✅ Notice creation and listing working with mock data');
    console.log('✅ API responses are properly structured');
    console.log('✅ Mock mode is functioning correctly without database');
    console.log('\n🔧 System Status: READY FOR DEVELOPMENT');
  } catch (error) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    console.log(
      '\n📋 Test Summary: Some tests failed - check error details above'
    );
  }
}

runComprehensiveTests();
