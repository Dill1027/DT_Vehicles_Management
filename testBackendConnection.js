#!/usr/bin/env node
/**
 * Test script to verify backend connectivity
 * Run with: node testBackendConnection.js
 */

const fetch = require('node-fetch');

// Update these URLs to match your actual deployment
const BACKEND_URL = 'https://server-akucfqon0-dill1027s-projects.vercel.app/api';
const CLIENT_URL = 'https://dt-vehicles-client-a0zmg9j7k-dill1027s-projects.vercel.app';

async function testBackendConnection() {
  console.log('\n🔍 Testing backend connectivity...');
  console.log(`🌐 Backend URL: ${BACKEND_URL}`);
  console.log(`🌐 Client URL: ${CLIENT_URL}\n`);

  try {
    // Test health endpoint
    console.log('Testing /api/health endpoint...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      headers: {
        'Origin': CLIENT_URL
      }
    });
    
    console.log(`Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Health check successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
      
      // Check if we got the expected response structure
      if (data.status === 'OK') {
        console.log('✅ Backend is responding correctly');
      } else {
        console.log('⚠️ Backend response structure unexpected');
      }
    } else {
      console.log('❌ Health check failed');
    }

    // Check CORS headers
    console.log('\nChecking CORS headers...');
    const corsHeaders = Array.from(healthResponse.headers.entries())
      .filter(([key]) => key.toLowerCase().startsWith('access-control'));
    
    if (corsHeaders.length > 0) {
      console.log('✅ CORS headers found:');
      corsHeaders.forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('❌ No CORS headers found in response');
    }

  } catch (error) {
    console.error('❌ Error testing backend connection:', error.message);
  }
  
  console.log('\n🔍 Test complete');
}

testBackendConnection().catch(console.error);
