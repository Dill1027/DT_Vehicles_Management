const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

const createAdminViaAPI = async () => {
  try {
    console.log('🚗 DT Vehicles Management - Admin Creation via API');
    console.log('=' .repeat(60));
    console.log(`🔗 Connecting to API: ${API_BASE_URL}`);
    
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@deeptec.com',
      password: 'admin@123',
      role: 'Admin',
      department: 'Administration',
      employeeId: 'ADMIN001',
      phoneNumber: '+1234567890'
    };

    console.log('👤 Creating admin user via registration API...');
    
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, adminData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('\n🎉 Admin user created successfully via API!');
      console.log('=' .repeat(50));
      console.log('📧 Email: admin@deeptec.com');
      console.log('🔑 Password: admin@123');
      console.log('👤 Role: Admin');
      console.log('🏢 Department: Administration');
      console.log('🆔 Employee ID: ADMIN001');
      console.log('=' .repeat(50));
      console.log('\n🚀 You can now login to the system!');
      console.log('⚠️  Remember to change the password after first login!');
      
      // Display user info from response
      if (response.data.data && response.data.data.user) {
        console.log('\n📋 User Details from Server:');
        const user = response.data.data.user;
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Department: ${user.department}`);
      }
    } else {
      console.error('❌ API returned error:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user via API:');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || 'Unknown error');
      
      if (error.response.data?.errors) {
        console.error('Validation Errors:');
        error.response.data.errors.forEach(err => {
          console.error(`  - ${err.msg || err.message}: ${err.param || ''}`);
        });
      }
      
      if (error.response.status === 400 && error.response.data?.message?.includes('already exists')) {
        console.log('\n💡 The admin user might already exist. Try logging in with:');
        console.log('📧 Email: admin@deeptec.com');
        console.log('🔑 Password: admin@123');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ No response from server. Make sure the server is running on', API_BASE_URL);
      console.log('\n💡 To start the server:');
      console.log('1. cd server');
      console.log('2. npm run dev');
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
  }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('🚗 DT Vehicles Management - API Admin Creation Script');
  console.log('=' .repeat(60));
  console.log('Usage: node createAdminAPI.js');
  console.log('');
  console.log('This script creates an admin user using the registration API.');
  console.log('Make sure your server is running before using this script.');
  console.log('');
  console.log('Environment Variables:');
  console.log('- API_BASE_URL: Server URL (default: http://localhost:5000)');
  process.exit(0);
}

// Run the script
createAdminViaAPI();
