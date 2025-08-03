// Test script to debug save functionality
// Run with: node test-save.js

const fetch = require('node-fetch');

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';

async function testSaveFunction() {
  console.log('🧪 Testing save functionality...');
  
  // Test 1: Check if API is accessible
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }
  
  // Test 2: Try to authenticate (you'll need to provide credentials)
  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASSWORD;
  
  if (!testEmail || !testPassword) {
    console.log('⚠️  Skipping authentication test - set TEST_EMAIL and TEST_PASSWORD env vars');
    console.log('📝 To test with credentials:');
    console.log('   TEST_EMAIL=your@email.com TEST_PASSWORD=yourpassword node test-save.js');
    return;
  }
  
  try {
    console.log('🔐 Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginData.token;
    
    // Test 3: Get characters
    console.log('📋 Fetching characters...');
    const charactersResponse = await fetch(`${BASE_URL}/api/characters`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const charactersData = await charactersResponse.json();
    console.log('📋 Characters:', charactersData);
    
    if (charactersData.characters && charactersData.characters.length > 0) {
      const characterId = charactersData.characters[0].id;
      console.log(`🎯 Testing save with character ID: ${characterId}`);
      
      // Test 4: Update character
      const testData = {
        characterData: {
          name: 'Test Character',
          testField: 'This is a test save',
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('💾 Attempting to save character data...');
      const updateResponse = await fetch(`${BASE_URL}/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ Save successful:', updateData);
      } else {
        console.error('❌ Save failed:', updateData);
      }
    } else {
      console.log('⚠️  No characters found to test with');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSaveFunction();