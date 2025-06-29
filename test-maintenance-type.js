const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  email: 'teste@csv.com',
  password: 'teste123',
};

async function testMaintenanceType() {
  console.log('\n🧪 Testing Maintenance Type...\n');

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

    // Step 2: Test maintenance type specifically
    console.log('\n2. 🔧 Testing maintenance type...');

    const maintenanceNotice = {
      title: 'Maintenance Test Notice',
      content: 'This is a test notice for maintenance type validation.',
      type: 'maintenance',
      priority: 'medium',
      isPinned: false,
    };

    console.log(
      'Sending maintenance notice data:',
      JSON.stringify(maintenanceNotice, null, 2)
    );

    const createResponse = await fetch(`${BASE_URL}/notices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(maintenanceNotice),
    });

    console.log('Response status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Response body:', JSON.stringify(createData, null, 2));

    if (!createResponse.ok) {
      console.error('❌ Maintenance notice creation failed');
      return;
    }

    console.log('✅ Maintenance notice created successfully');
  } catch (error) {
    console.error('❌ Error during maintenance test:', error.message);
  }
}

testMaintenanceType();
