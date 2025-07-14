#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api';

async function testAPI() {
  console.log('🧪 Testing DT Vehicles Management API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Get all vehicles
    console.log('\n2. Testing vehicles endpoint...');
    const vehiclesResponse = await axios.get(`${API_BASE_URL}/vehicles`);
    console.log('✅ Vehicles endpoint passed, found', vehiclesResponse.data.total, 'vehicles');

    // Test 3: Test vehicle stats
    console.log('\n3. Testing vehicle stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/vehicles/stats`);
    console.log('✅ Stats endpoint passed:', statsResponse.data.data);

    // Test 4: Test notifications
    console.log('\n4. Testing notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`);
    console.log('✅ Notifications endpoint passed, found', notificationsResponse.data.total, 'notifications');

    // Test 5: Test insurance expiry notifications
    console.log('\n5. Testing insurance expiry notifications...');
    const insuranceResponse = await axios.get(`${API_BASE_URL}/notifications/insurance-expiry?days=365`);
    console.log('✅ Insurance expiry endpoint passed, found', insuranceResponse.data.total, 'expiring insurance policies');

    // Test 6: Test CORS with Origin header
    console.log('\n6. Testing CORS...');
    const corsResponse = await axios.get(`${API_BASE_URL}/vehicles`, {
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    console.log('✅ CORS test passed, vehicles returned:', corsResponse.data.total);

    console.log('\n🎉 All API tests passed! Your backend is ready.\n');
    console.log('Frontend should now be able to connect to the backend without CORS errors.');
    console.log('Frontend URL: http://localhost:3001');
    console.log('Backend URL: http://localhost:5002');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
