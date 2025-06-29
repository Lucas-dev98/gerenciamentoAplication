const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const TEST_CONFIG = {
  email: 'admin@test.com',
  password: 'admin123',
};

async function testDashboardOptimization() {
  console.log('\n🧪 Testing Dashboard Optimization and Rate Limiting...\n');

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

    // Step 2: Test multiple rapid dashboard API calls (simulating the issue)
    console.log(
      '\n2. 🚀 Testing rapid API calls (simulating dashboard loading)...'
    );

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Make 10 rapid concurrent calls to simulate what was happening
    const rapidCalls = [];
    for (let i = 0; i < 10; i++) {
      rapidCalls.push(
        Promise.all([
          fetch(`${BASE_URL}/projects`, { headers }),
          fetch(`${BASE_URL}/notices/active`, { headers }),
          fetch(`${BASE_URL}/events`, { headers }),
        ])
      );
    }

    console.log('Making 30 concurrent API calls (10 sets of 3 calls each)...');
    const startTime = Date.now();

    const results = await Promise.allSettled(rapidCalls);
    const endTime = Date.now();

    console.log(`⏱️  Completed in ${endTime - startTime}ms`);

    // Check results
    let successCount = 0;
    let rateLimitCount = 0;
    let errorCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled') {
        const [projectsRes, noticesRes, eventsRes] = result.value;

        if (
          projectsRes.status === 200 &&
          noticesRes.status === 200 &&
          eventsRes.status === 200
        ) {
          successCount++;
        } else if (
          projectsRes.status === 429 ||
          noticesRes.status === 429 ||
          eventsRes.status === 429
        ) {
          rateLimitCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Successful calls: ${successCount}/10`);
    console.log(`⚠️  Rate limited calls: ${rateLimitCount}/10`);
    console.log(`❌ Error calls: ${errorCount}/10`);

    if (rateLimitCount === 0) {
      console.log(
        '\n🎉 SUCCESS: No rate limiting detected! Dashboard optimization working.'
      );
    } else {
      console.log(
        '\n⚠️  WARNING: Rate limiting still occurring. May need further optimization.'
      );
    }

    // Step 3: Test individual endpoints for data structure
    console.log('\n3. 🔍 Testing individual endpoint responses...');

    const projectsResponse = await fetch(`${BASE_URL}/projects`, { headers });
    const noticesResponse = await fetch(`${BASE_URL}/notices/active`, {
      headers,
    });
    const eventsResponse = await fetch(`${BASE_URL}/events`, { headers });

    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      console.log(
        `✅ Projects API: ${projectsData.projects?.length || 0} projects found`
      );
    } else {
      console.log(`❌ Projects API failed: ${projectsResponse.status}`);
    }

    if (noticesResponse.ok) {
      const noticesData = await noticesResponse.json();
      console.log(
        `✅ Notices API: ${noticesData.notices?.length || 0} notices found`
      );
    } else {
      console.log(`❌ Notices API failed: ${noticesResponse.status}`);
    }

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      console.log(
        `✅ Events API: ${eventsData.events?.length || 0} events found`
      );
    } else {
      console.log(`❌ Events API failed: ${eventsResponse.status}`);
    }

    // Step 4: Test rate limiting boundaries
    console.log('\n4. 🔄 Testing rate limit boundaries...');

    const rateLimitTest = [];
    for (let i = 0; i < 50; i++) {
      rateLimitTest.push(fetch(`${BASE_URL}/projects`, { headers }));
    }

    const rateLimitResults = await Promise.allSettled(rateLimitTest);
    const rateLimitSuccessful = rateLimitResults.filter(
      (r) => r.status === 'fulfilled' && r.value.status === 200
    ).length;
    const rateLimitFailed = rateLimitResults.filter(
      (r) => r.status === 'fulfilled' && r.value.status === 429
    ).length;

    console.log(
      `📈 Rate limit test: ${rateLimitSuccessful}/50 successful, ${rateLimitFailed}/50 rate limited`
    );

    if (rateLimitFailed === 0) {
      console.log('✅ Rate limit is sufficient for normal usage');
    } else {
      console.log(
        '⚠️  Some rate limiting occurred, but this is expected for stress testing'
      );
    }

    console.log('\n🎯 Dashboard optimization test completed successfully!');
  } catch (error) {
    console.error(
      '❌ Error during dashboard optimization test:',
      error.message
    );
    if (error.code === 'ECONNREFUSED') {
      console.log(
        '💡 Make sure the backend server is running on http://localhost:5000'
      );
    }
  }
}

// Additional test for cache behavior
async function testCacheBehavior() {
  console.log('\n🧪 Testing Dashboard Cache Behavior...\n');

  try {
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_CONFIG),
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('Testing cache effectiveness...');

    // Make first request and measure time
    const start1 = Date.now();
    const response1 = await fetch(`${BASE_URL}/projects`, { headers });
    const end1 = Date.now();

    // Make second request immediately and measure time
    const start2 = Date.now();
    const response2 = await fetch(`${BASE_URL}/projects`, { headers });
    const end2 = Date.now();

    console.log(`First request: ${end1 - start1}ms`);
    console.log(`Second request: ${end2 - start2}ms`);

    if (response1.ok && response2.ok) {
      console.log('✅ Both requests successful - server handling load well');
    }
  } catch (error) {
    console.error('❌ Cache test error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testDashboardOptimization();
  await testCacheBehavior();
}

runAllTests();
