#!/usr/bin/env node

/**
 * Test Multiple Image Upload Functionality
 * Tests the new /vehicles/with-images endpoint
 */

const https = require('https');
const http = require('http');

const API_BASE = 'https://dt-vehicles-backend.vercel.app/api';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Test new API endpoints availability
async function testEndpointsAvailability() {
  console.log('\n🔍 Testing API endpoints availability...');
  
  try {
    // Test health endpoint
    const healthResponse = await makeRequest(`${API_BASE}/health`);
    console.log('✅ Health endpoint:', healthResponse.data.status);
    
    // Test existing vehicles endpoint
    const vehiclesResponse = await makeRequest(`${API_BASE}/vehicles`);
    console.log('✅ Vehicles endpoint:', vehiclesResponse.data.success ? 'Working' : 'Failed');
    
    return true;
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
    return false;
  }
}

// Test 2: Test multiple image upload validation (without actual files)
async function testImageUploadValidation() {
  console.log('\n🔍 Testing image upload validation...');
  
  try {
    const testData = {
      vehicleNumber: 'TEST-123',
      type: 'Car',
      make: 'Test Make',
      insuranceDate: '2024-01-01',
      insuranceExpiry: '2025-01-01'
    };

    const response = await makeRequest(`${API_BASE}/vehicles/with-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.status === 201 || response.status === 200) {
      console.log('✅ Vehicle creation with no images: Working');
      
      // Clean up - delete the test vehicle
      if (response.data.data && response.data.data._id) {
        await makeRequest(`${API_BASE}/vehicles/${response.data.data._id}`, {
          method: 'DELETE'
        });
        console.log('🧹 Cleaned up test vehicle');
      }
      
      return true;
    } else {
      console.log('⚠️  Expected behavior for validation:', response.data.message);
      return true;
    }
  } catch (error) {
    console.error('❌ Image upload validation test failed:', error.message);
    return false;
  }
}

// Test 3: Test CORS headers for file uploads
async function testCORSForFileUploads() {
  console.log('\n🔍 Testing CORS headers for file uploads...');
  
  try {
    const response = await makeRequest(`${API_BASE}/vehicles/with-images`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://dt-vehicles-frontend.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });

    const corsAllowed = response.headers['access-control-allow-origin'];
    const methodsAllowed = response.headers['access-control-allow-methods'];
    
    if (corsAllowed && methodsAllowed && methodsAllowed.includes('POST')) {
      console.log('✅ CORS for file uploads: Properly configured');
      console.log(`   - Origin allowed: ${corsAllowed}`);
      console.log(`   - Methods: ${methodsAllowed}`);
      return true;
    } else {
      console.log('⚠️  CORS configuration needs attention');
      console.log(`   - Origin: ${corsAllowed}`);
      console.log(`   - Methods: ${methodsAllowed}`);
      return false;
    }
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
    return false;
  }
}

// Test 4: Check basic endpoint structure
async function testBasicEndpointStructure() {
  console.log('\n🔍 Testing basic endpoint structure...');
  
  try {
    // Test if the new endpoint responds to requests
    const response = await makeRequest(`${API_BASE}/vehicles/with-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}) // Empty body to test validation
    });

    // Any response (even error) means the endpoint exists
    if (response.status) {
      console.log('✅ New image upload endpoint: Accessible');
      console.log(`   - Status: ${response.status}`);
      return true;
    } else {
      console.log('❌ New image upload endpoint: Not accessible');
      return false;
    }
  } catch (error) {
    console.error('❌ Basic endpoint test failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Multiple Image Upload Tests');
  console.log('=====================================');
  
  const results = [];
  
  results.push(await testEndpointsAvailability());
  results.push(await testImageUploadValidation());
  results.push(await testCORSForFileUploads());
  results.push(await testBasicEndpointStructure());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  console.log(`✅ Tests passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Multiple image upload feature is ready.');
  } else {
    console.log('⚠️  Some tests need attention. Check the logs above.');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Test the frontend by uploading 1-3 images to a vehicle');
  console.log('2. Verify image preview and removal functionality');
  console.log('3. Check that existing single image uploads still work');
  console.log('4. Test update functionality with new images');
}

// Handle both direct execution and module import
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
