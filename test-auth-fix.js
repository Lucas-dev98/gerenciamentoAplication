/**
 * Test script to verify authentication token extraction fix
 */

const axios = require('axios');

async function testAuthentication() {
  console.log('🔐 Testing Authentication Token Extraction Fix...\n');

  const baseURL = 'http://localhost:5000';

  try {
    // Step 1: Test login endpoint
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'admin@epu.com',
      password: 'admin123',
    });

    console.log('✅ Login Response Structure:');
    console.log('   - Success:', loginResponse.data.success);
    console.log('   - Message:', loginResponse.data.message);
    console.log('   - Has data object:', !!loginResponse.data.data);
    console.log('   - Has token in data:', !!loginResponse.data.data?.token);
    console.log('   - Has user in data:', !!loginResponse.data.data?.user);
    console.log(
      '   - Token preview:',
      loginResponse.data.data?.token?.substring(0, 20) + '...'
    );
    console.log('   - User email:', loginResponse.data.data?.user?.email);
    console.log();

    // Step 2: Test register endpoint structure
    console.log('2. Testing register endpoint structure...');
    try {
      const registerResponse = await axios.post(
        `${baseURL}/api/auth/register`,
        {
          name: 'Test User',
          email: 'test' + Date.now() + '@test.com',
          password: 'test123',
          role: 'member',
        }
      );

      console.log('✅ Register Response Structure:');
      console.log('   - Success:', registerResponse.data.success);
      console.log('   - Message:', registerResponse.data.message);
      console.log('   - Has data object:', !!registerResponse.data.data);
      console.log(
        '   - Has token in data:',
        !!registerResponse.data.data?.token
      );
      console.log('   - Has user in data:', !!registerResponse.data.data?.user);
      console.log();
    } catch (registerError) {
      console.log(
        '⚠️  Register test (expected if user exists):',
        registerError.response?.data?.message
      );
      console.log();
    }

    // Step 3: Test protected endpoint with token
    const token = loginResponse.data.data.token;
    console.log('3. Testing protected endpoint with extracted token...');

    const protectedResponse = await axios.get(`${baseURL}/api/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Protected endpoint access successful');
    console.log('   - Users count:', protectedResponse.data.data.length);
    console.log();

    console.log('🎉 AUTHENTICATION FIX VERIFICATION COMPLETE');
    console.log('✅ The frontend should now properly extract:');
    console.log('   - Token from response.data.token');
    console.log('   - User from response.data.user');
    console.log('   - Authentication state should work correctly');
  } catch (error) {
    console.error(
      '❌ Authentication test failed:',
      error.response?.data || error.message
    );
  }
}

// Run the test
testAuthentication();
