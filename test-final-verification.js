/**
 * Final Integration Verification Script
 * Tests all CRUD endpoints, CSV import, and statistics
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
  username: 'testuser123',
  email: 'testuser123@example.com',
  password: 'TestPassword123!',
  department: 'TI',
  role: 'user',
};

let authToken = null;
let createdProjectId = null;

class FinalVerificationTester {
  constructor() {
    this.results = {
      auth: false,
      projectCreation: false,
      projectListing: false,
      projectUpdate: false,
      projectDeletion: false,
      csvImport: false,
      statistics: false,
      crudRoutes: false,
    };
  }

  async log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const prefix = isError ? '❌ ERROR' : '✅ SUCCESS';
    console.log(`[${timestamp}] ${prefix}: ${message}`);
  }

  async testAuthentication() {
    try {
      console.log('\n🔐 Testing Authentication...');

      // Try to login with existing user
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: testUser.email,
          password: testUser.password,
        });

        authToken = loginResponse.data.token;
        this.results.auth = true;
        await this.log('Authentication successful with existing user');
      } catch (loginError) {
        // If login fails, try to register
        if (
          loginError.response?.status === 401 ||
          loginError.response?.status === 404
        ) {
          console.log('Login failed, attempting registration...');

          const registerResponse = await axios.post(
            `${BASE_URL}/api/auth/register`,
            testUser
          );

          const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: testUser.email,
            password: testUser.password,
          });

          authToken = loginResponse.data.token;
          this.results.auth = true;
          await this.log(
            'Authentication successful with new user registration'
          );
        } else {
          throw loginError;
        }
      }

      return true;
    } catch (error) {
      await this.log(`Authentication failed: ${error.message}`, true);
      return false;
    }
  }

  async testProjectCRUD() {
    try {
      console.log('\n📝 Testing Project CRUD Operations...');

      const headers = { Authorization: `Bearer ${authToken}` };

      // 1. Create Project
      const projectData = {
        name: `Test Project ${Date.now()}`,
        description: 'Test project for verification',
        status: 'draft',
        priority: 'medium',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 50000,
        manager: 'Test Manager',
        team: [], // Empty team array to avoid ObjectId issues
        tags: ['test', 'verification'],
      };

      const createResponse = await axios.post(
        `${BASE_URL}/api/projects`,
        projectData,
        { headers }
      );
      createdProjectId = createResponse.data.data._id;
      this.results.projectCreation = true;
      await this.log(`Project created with ID: ${createdProjectId}`);

      // 2. List Projects
      const listResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers,
      });
      const projects = listResponse.data.data.data; // The actual array is nested deeper

      if (Array.isArray(projects) && projects.length > 0) {
        this.results.projectListing = true;
        await this.log(
          `Projects listed successfully. Found ${projects.length} projects`
        );
      }

      // 3. Update Project
      const updateData = {
        name: `Updated Test Project ${Date.now()}`,
        status: 'active',
      };

      const updateResponse = await axios.put(
        `${BASE_URL}/api/projects/${createdProjectId}`,
        updateData,
        { headers }
      );
      this.results.projectUpdate = true;
      await this.log(`Project updated successfully`);

      // 4. Get Project by ID
      const getResponse = await axios.get(
        `${BASE_URL}/api/projects/${createdProjectId}`,
        { headers }
      );
      if (getResponse.data.data._id === createdProjectId) {
        await this.log(`Project retrieved by ID successfully`);
      }

      return true;
    } catch (error) {
      await this.log(
        `Project CRUD failed: ${error.response?.data?.message || error.message}`,
        true
      );
      return false;
    }
  }

  async testCRUDRoutes() {
    try {
      console.log('\n🔄 Testing CRUD Routes (/api/projects-crud)...');

      const headers = { Authorization: `Bearer ${authToken}` };

      // Test the CRUD alias routes
      const listResponse = await axios.get(`${BASE_URL}/api/projects-crud`, {
        headers,
      });

      if (listResponse.status === 200) {
        this.results.crudRoutes = true;
        await this.log('CRUD routes working correctly');
      }

      return true;
    } catch (error) {
      await this.log(
        `CRUD routes test failed: ${error.response?.data?.message || error.message}`,
        true
      );
      return false;
    }
  }

  async testCSVImport() {
    try {
      console.log('\n📊 Testing CSV Import...');

      const headers = { Authorization: `Bearer ${authToken}` };

      // Create test CSV content
      const csvContent = `name,description,status,priority,budget,manager
Test CSV Project 1,Description 1,draft,high,75000,Manager A
Test CSV Project 2,Description 2,active,medium,60000,Manager B
Test CSV Project 3,Description 3,completed,low,45000,Manager C`;

      const csvPath = path.join(__dirname, 'test-projects.csv');
      fs.writeFileSync(csvPath, csvContent);

      // Test main CSV route
      const formData = new FormData();
      formData.append('file', fs.createReadStream(csvPath));

      const importResponse = await axios.post(
        `${BASE_URL}/api/projects/upload-csv`,
        formData,
        {
          headers: {
            ...headers,
            ...formData.getHeaders(),
          },
        }
      );

      // Test alias CSV route
      const formData2 = new FormData();
      formData2.append('file', fs.createReadStream(csvPath));

      const aliasResponse = await axios.post(
        `${BASE_URL}/api/projects/import-csv`,
        formData2,
        {
          headers: {
            ...headers,
            ...formData2.getHeaders(),
          },
        }
      );

      this.results.csvImport = true;
      await this.log(
        `CSV import successful. Imported projects via both routes`
      );

      // Clean up
      fs.unlinkSync(csvPath);

      return true;
    } catch (error) {
      await this.log(
        `CSV import failed: ${error.response?.data?.message || error.message}`,
        true
      );
      return false;
    }
  }

  async testStatistics() {
    try {
      console.log('\n📈 Testing Statistics Endpoint...');

      const headers = { Authorization: `Bearer ${authToken}` };

      const statsResponse = await axios.get(
        `${BASE_URL}/api/projects/statistics`,
        { headers }
      );
      const stats = statsResponse.data.data;

      if (stats && typeof stats.totalProjects === 'number') {
        this.results.statistics = true;
        await this.log(
          `Statistics retrieved successfully. Total projects: ${stats.totalProjects}`
        );
      }

      return true;
    } catch (error) {
      await this.log(
        `Statistics test failed: ${error.response?.data?.message || error.message}`,
        true
      );
      return false;
    }
  }

  async cleanup() {
    try {
      console.log('\n🧹 Cleaning up test data...');

      if (createdProjectId && authToken) {
        const headers = { Authorization: `Bearer ${authToken}` };

        await axios.delete(`${BASE_URL}/api/projects/${createdProjectId}`, {
          headers,
        });
        this.results.projectDeletion = true;
        await this.log('Test project deleted successfully');
      }
    } catch (error) {
      await this.log(`Cleanup failed: ${error.message}`, true);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Final Integration Verification...\n');

    try {
      // Test in sequence
      await this.testAuthentication();

      if (this.results.auth) {
        await this.testProjectCRUD();
        await this.testCRUDRoutes();
        await this.testCSVImport();
        await this.testStatistics();
        await this.cleanup();
      }

      // Print results summary
      this.printSummary();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Authentication', status: this.results.auth },
      { name: 'Project Creation', status: this.results.projectCreation },
      { name: 'Project Listing', status: this.results.projectListing },
      { name: 'Project Update', status: this.results.projectUpdate },
      { name: 'Project Deletion', status: this.results.projectDeletion },
      {
        name: 'CRUD Routes (/api/projects-crud)',
        status: this.results.crudRoutes,
      },
      { name: 'CSV Import', status: this.results.csvImport },
      { name: 'Statistics Endpoint', status: this.results.statistics },
    ];

    tests.forEach((test) => {
      const icon = test.status ? '✅' : '❌';
      const status = test.status ? 'PASS' : 'FAIL';
      console.log(`${icon} ${test.name}: ${status}`);
    });

    const passedTests = tests.filter((t) => t.status).length;
    const totalTests = tests.length;

    console.log('\n' + '='.repeat(60));
    console.log(`🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Integration is complete and working.');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }

    console.log('='.repeat(60));
  }
}

// Run the tests
const tester = new FinalVerificationTester();
tester.runAllTests().catch(console.error);
