const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  email: 'teste@csv.com',
  password: 'teste123',
};

async function testNoticesFrontendFormat() {
  console.log('\n🧪 Testing Notices API with Frontend Format...\n');

  try {
    // Step 1: Login to get token
    console.log('1. 🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CONFIG),
    });

    if (!loginResponse.ok) {
      throw new Error(
        `Login failed: ${loginResponse.status} ${loginResponse.statusText}`
      );
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Test creating a notice with frontend data format
    console.log('\n2. 📝 Testing notice creation with frontend format...');

    // This is exactly what the frontend sends
    const frontendNoticeData = {
      title: 'Frontend Test Notice',
      content:
        'This is a test notice from frontend format with proper field names.',
      type: 'info',
      priority: 'medium',
      isPinned: false,
      expiryDate: '2025-12-31', // using expiryDate instead of expiresAt
    };

    console.log(
      'Sending frontend notice data:',
      JSON.stringify(frontendNoticeData, null, 2)
    );

    const createResponse = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frontendNoticeData),
    });

    console.log('Response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Response body:', JSON.stringify(createData, null, 2));

    if (!createResponse.ok) {
      console.error('❌ Notice creation failed');
      return;
    }

    console.log('✅ Notice created successfully with frontend format');

    // Step 3: Test with different types and priorities
    console.log('\n3. 🎯 Testing different types and priorities...');

    const testCases = [
      { type: 'announcement', priority: 'high' },
      { type: 'warning', priority: 'critical' },
      { type: 'urgent', priority: 'low' },
      { type: 'maintenance', priority: 'medium' },
    ];

    for (const testCase of testCases) {
      const testNoticeData = {
        title: `Test ${testCase.type} - ${testCase.priority}`,
        content: `Testing ${testCase.type} type with ${testCase.priority} priority.`,
        type: testCase.type,
        priority: testCase.priority,
        isPinned: false,
      };

      const testResponse = await fetch(`${BASE_URL}/notices`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNoticeData),
      });

      if (testResponse.ok) {
        console.log(`✅ ${testCase.type}/${testCase.priority} - Success`);
      } else {
        const errorData = await testResponse.json();
        console.log(
          `❌ ${testCase.type}/${testCase.priority} - Failed:`,
          errorData.message
        );
      }
    }

    // Step 4: Get all notices to verify they were created
    console.log('\n4. 📋 Verifying created notices...');
    const getResponse = await fetch(`${BASE_URL}/notices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log(`✅ Found ${getData.data?.count || 0} notices in total`);

      if (getData.data?.notices?.length > 0) {
        console.log('\n📑 Recent notices:');
        getData.data.notices.slice(0, 3).forEach((notice, index) => {
          console.log(
            `${index + 1}. ${notice.title} (${notice.type}/${notice.priority})`
          );
        });
      }
    } else {
      console.log('❌ Failed to retrieve notices');
    }
  } catch (error) {
    console.error('❌ Error during notices frontend test:', error.message);
  }
}

testNoticesFrontendFormat();
