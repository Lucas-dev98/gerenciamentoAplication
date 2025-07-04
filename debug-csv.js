/**
 * Debug CSV Import Issue
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';

async function debugCSV() {
  try {
    // First authenticate
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'statsuser123@example.com',
      password: 'StatsPassword123!',
    });

    const token = authResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('🔍 Testing CSV import...');

    // Create test CSV content with just the minimal required fields
    const csvContent = `name,description
Test CSV Project 1,Description for project 1
Test CSV Project 2,Description for project 2`;

    const csvPath = path.join(__dirname, 'debug-test.csv');
    fs.writeFileSync(csvPath, csvContent);

    // Test CSV import with detailed error logging
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(csvPath));

      console.log('Uploading CSV to /api/projects/upload-csv...');

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

      console.log('✅ CSV import successful:', importResponse.data);
    } catch (csvError) {
      console.error('❌ CSV import error details:');
      console.error('Status:', csvError.response?.status);
      console.error('Data:', csvError.response?.data);
      console.error('Headers:', csvError.response?.headers);
    }

    // Clean up
    fs.unlinkSync(csvPath);
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

debugCSV();
