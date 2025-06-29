const axios = require('axios');

async function testDeleteProject() {
  try {
    console.log('🧪 Testing project deletion...');

    // 1. Create a unique user and login
    const timestamp = Date.now();
    const registerResponse = await axios.post(
      'http://localhost:5000/api/auth/register',
      {
        username: `deletetest${timestamp}`,
        email: `deletetest-${timestamp}@test.com`,
        password: 'password123',
        fullName: 'Delete Test User',
      }
    );

    console.log('✅ User created');

    const loginResponse = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email: registerResponse.data.user.email,
        password: 'password123',
      }
    );

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // 2. Create a test project
    const projectResponse = await axios.post(
      'http://localhost:5000/api/projects',
      {
        name: 'Project to Delete',
        description: 'Test project for deletion',
        status: 'draft',
        priority: 'medium',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const projectId = projectResponse.data.data.project.id;
    console.log('✅ Project created:', projectId);

    // 3. Test deletion
    console.log('🗑️  Testing deletion...');
    const deleteResponse = await axios.delete(
      `http://localhost:5000/api/projects/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✅ Project deleted successfully');
    console.log('Response:', deleteResponse.data);

    // 4. Test multiple deletions to check rate limiting
    console.log('🔄 Testing multiple deletions...');
    for (let i = 0; i < 3; i++) {
      try {
        // Create another project
        const testProject = await axios.post(
          'http://localhost:5000/api/projects',
          {
            name: `Test Project ${i}`,
            description: `Test project ${i} for deletion`,
            status: 'draft',
            priority: 'medium',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const testProjectId = testProject.data.data.project.id;

        // Delete it
        await axios.delete(
          `http://localhost:5000/api/projects/${testProjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`✅ Project ${i + 1} deleted successfully`);
      } catch (error) {
        console.error(
          `❌ Error deleting project ${i + 1}:`,
          error.response?.data || error.message
        );
      }
    }

    console.log('🎉 Delete test completed!');
  } catch (error) {
    console.error(
      '❌ Error in delete test:',
      error.response?.data || error.message
    );
  }
}

testDeleteProject();
