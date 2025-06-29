const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  email: 'teste@csv.com',
  password: 'teste123'
};

async function testNoticesAPI() {
  console.log('\n🧪 Testing Notices API...\n');

  try {
    // Step 1: Login to get token
    console.log('1. 🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CONFIG)
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Test creating a notice with minimal valid data
    console.log('\n2. 📝 Testing notice creation...');
    
    const noticeData = {
      title: 'Test Notice Title',
      content: 'This is a test notice content with more than 10 characters to meet validation requirements.',
      type: 'announcement',
      priority: 'medium',
      isPinned: false
    };

    console.log('Sending notice data:', JSON.stringify(noticeData, null, 2));

    const createResponse = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(noticeData)
    });

    console.log('Response status:', createResponse.status);
    const responseText = await createResponse.text();
    console.log('Response body:', responseText);

    if (!createResponse.ok) {
      console.log('❌ Create notice failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', JSON.stringify(errorData, null, 2));
      } catch (e) {
        console.log('Raw error response:', responseText);
      }
    } else {
      console.log('✅ Notice created successfully');
      const noticeResult = JSON.parse(responseText);
      console.log('Created notice:', JSON.stringify(noticeResult, null, 2));
    }

    // Step 3: Test getting all notices
    console.log('\n3. 📋 Testing get all notices...');
    const getResponse = await fetch(`${BASE_URL}/notices`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (getResponse.ok) {
      const noticesData = await getResponse.json();
      console.log('✅ Get notices successful');
      console.log(`Found ${noticesData.notices?.length || 0} notices`);
    } else {
      console.log('❌ Get notices failed:', getResponse.status);
    }

  } catch (error) {
    console.error('❌ Error during notices API test:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on http://localhost:5000');
    }
  }
}

testNoticesAPI();
