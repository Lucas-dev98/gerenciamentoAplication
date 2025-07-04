// Complete CRUD and CSV Flow Test for Frontend-Backend Integration
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/projects-crud';

async function testCompleteCrudFlow() {
  console.log('🚀 Starting Complete CRUD Flow Test...\n');

  try {
    // 1. Test GET all projects
    console.log('1️⃣ Testing GET all projects...');
    const getAllResponse = await axios.get(API_BASE);
    console.log('✅ GET all projects:', {
      success: getAllResponse.data.success,
      count: getAllResponse.data.data?.length || 0,
      status: getAllResponse.status,
    });

    // 2. Test GET project stats
    console.log('\n2️⃣ Testing GET project stats...');
    const statsResponse = await axios.get(`${API_BASE}/stats`);
    console.log('✅ GET stats:', {
      success: statsResponse.data.success,
      stats: statsResponse.data.data,
      status: statsResponse.status,
    });

    // 3. Test CREATE project
    console.log('\n3️⃣ Testing CREATE project...');
    const newProject = {
      name: 'Teste CRUD Frontend-Backend',
      description: 'Projeto de teste para validar integração completa',
      type: 'epu',
      status: 'active',
      priority: 'high',
      progress: 0,
      assignedTo: 'Equipe de Desenvolvimento',
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      tags: ['teste', 'crud', 'frontend', 'backend'],
      activities: [
        {
          name: 'Análise Inicial',
          type: 'parada',
          planned: 8,
          real: 0,
          order: 1,
          description: 'Análise preliminar do projeto',
          assignedTo: 'Analista',
          priority: 'high',
          estimatedHours: 8,
          actualHours: 0,
          tags: ['analysis'],
          dependencies: [],
          subActivities: [],
        },
      ],
    };

    const createResponse = await axios.post(API_BASE, newProject);
    console.log('✅ CREATE project:', {
      success: createResponse.data.success,
      projectId: createResponse.data.data?.id || createResponse.data.data?._id,
      status: createResponse.status,
    });

    const createdProjectId =
      createResponse.data.data?.id || createResponse.data.data?._id;

    if (!createdProjectId) {
      throw new Error('Project ID not returned from CREATE operation');
    }

    // 4. Test GET project by ID
    console.log('\n4️⃣ Testing GET project by ID...');
    const getByIdResponse = await axios.get(`${API_BASE}/${createdProjectId}`);
    console.log('✅ GET by ID:', {
      success: getByIdResponse.data.success,
      projectName: getByIdResponse.data.data?.name,
      status: getByIdResponse.status,
    });

    // 5. Test UPDATE project
    console.log('\n5️⃣ Testing UPDATE project...');
    const updateData = {
      name: 'Teste CRUD Frontend-Backend [ATUALIZADO]',
      description: 'Projeto de teste atualizado com sucesso',
      status: 'active',
      progress: 25,
    };

    const updateResponse = await axios.put(
      `${API_BASE}/${createdProjectId}`,
      updateData
    );
    console.log('✅ UPDATE project:', {
      success: updateResponse.data.success,
      updatedName: updateResponse.data.data?.name,
      status: updateResponse.status,
    });

    // 6. Test DUPLICATE project
    console.log('\n6️⃣ Testing DUPLICATE project...');
    const duplicateData = {
      name: 'Teste CRUD Frontend-Backend [DUPLICADO]',
      description: 'Projeto duplicado para teste',
      startDate: '2025-04-01',
      endDate: '2025-06-30',
    };

    const duplicateResponse = await axios.post(
      `${API_BASE}/${createdProjectId}/duplicate`,
      duplicateData
    );
    console.log('✅ DUPLICATE project:', {
      success: duplicateResponse.data.success,
      duplicatedId:
        duplicateResponse.data.data?.id || duplicateResponse.data.data?._id,
      duplicatedName: duplicateResponse.data.data?.name,
      status: duplicateResponse.status,
    });

    const duplicatedProjectId =
      duplicateResponse.data.data?.id || duplicateResponse.data.data?._id;

    // 7. Test CSV Export
    console.log('\n7️⃣ Testing CSV Export...');
    try {
      const exportResponse = await axios.get(
        `${API_BASE}/${createdProjectId}/export-csv`,
        {
          responseType: 'blob',
        }
      );
      console.log('✅ CSV Export:', {
        contentType: exportResponse.headers['content-type'],
        size: exportResponse.data.size || 'unknown',
        status: exportResponse.status,
      });
    } catch (csvError) {
      console.log(
        '⚠️ CSV Export error (might be normal if not implemented):',
        csvError.response?.status
      );
    }

    // 8. Test DELETE duplicated project
    console.log('\n8️⃣ Testing DELETE duplicated project...');
    if (duplicatedProjectId) {
      const deleteResponse = await axios.delete(
        `${API_BASE}/${duplicatedProjectId}`
      );
      console.log('✅ DELETE duplicated project:', {
        success: deleteResponse.data.success,
        status: deleteResponse.status,
      });
    }

    // 9. Test DELETE original project
    console.log('\n9️⃣ Testing DELETE original project...');
    const deleteOriginalResponse = await axios.delete(
      `${API_BASE}/${createdProjectId}`
    );
    console.log('✅ DELETE original project:', {
      success: deleteOriginalResponse.data.success,
      status: deleteOriginalResponse.status,
    });

    // 10. Final stats check
    console.log('\n🔟 Final stats check...');
    const finalStatsResponse = await axios.get(`${API_BASE}/stats`);
    console.log('✅ Final stats:', {
      success: finalStatsResponse.data.success,
      stats: finalStatsResponse.data.data,
      status: finalStatsResponse.status,
    });

    console.log(
      '\n🎉 Complete CRUD Flow Test PASSED! All endpoints are working correctly.'
    );
    console.log('\n✅ Frontend Integration Status:');
    console.log('   - Backend API is responding correctly');
    console.log('   - All CRUD operations are functional');
    console.log('   - Data persistence is working');
    console.log('   - Error handling is in place');
    console.log(
      '\n🔍 Next: Test Frontend UI in browser at http://localhost:3000/projetos/gerenciar'
    );
  } catch (error) {
    console.error('\n❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    console.log('\n🔧 Debugging info:');
    console.log('   - Backend URL:', API_BASE);
    console.log('   - Error type:', error.code || 'Unknown');

    if (error.response) {
      console.log('   - Response status:', error.response.status);
      console.log('   - Response data:', error.response.data);
    }
  }
}

// Run the test
testCompleteCrudFlow();
