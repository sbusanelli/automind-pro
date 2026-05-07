/**
 * Test Pinecone integration via API endpoints
 * Run with: node test-api-endpoints.js
 * Make sure your backend server is running first
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/vector';

async function testPineconeAPI() {
  console.log('🚀 Testing Pinecone Integration via API Endpoints...\n');
  
  try {
    // 1. Test conversation embedding storage
    console.log('💬 Testing conversation embedding storage...');
    const conversationData = {
      userId: 'test-user-123',
      content: 'This is a test prompt about TypeScript best practices and how to implement proper type safety in large applications',
      role: 'user'
    };
    
    const conversationResponse = await axios.post(`${BASE_URL}/conversations/test-conversation-${Date.now()}/embed`, conversationData);
    console.log('✅ Conversation embedding stored successfully');
    console.log('   Response:', conversationResponse.data);
    console.log('');
    
    // 2. Test knowledge embedding storage
    console.log('📚 Testing knowledge embedding storage...');
    const knowledgeData = {
      title: 'TypeScript Best Practices Guide',
      content: 'TypeScript provides static typing for JavaScript, enabling better code quality and developer experience. Key practices include using interfaces for type definitions, avoiding any types, and implementing proper generics.',
      category: 'programming',
      tags: ['typescript', 'best-practices', 'type-safety']
    };
    
    const knowledgeResponse = await axios.post(`${BASE_URL}/knowledge/test-knowledge-${Date.now()}/embed`, knowledgeData);
    console.log('✅ Knowledge embedding stored successfully');
    console.log('   Response:', knowledgeResponse.data);
    console.log('');
    
    // 3. Test conversation search
    console.log('🔍 Testing conversation search...');
    const searchConversationData = {
      query: 'TypeScript best practices',
      userId: 'test-user-123',
      limit: 5
    };
    
    const searchResponse = await axios.post(`${BASE_URL}/conversations/search`, searchConversationData);
    console.log('✅ Conversation search completed');
    console.log('   Results:', searchResponse.data);
    console.log('');
    
    // 4. Test knowledge search
    console.log('🔍 Testing knowledge search...');
    const searchKnowledgeData = {
      query: 'type safety',
      category: 'programming',
      limit: 5
    };
    
    const knowledgeSearchResponse = await axios.post(`${BASE_URL}/knowledge/search`, searchKnowledgeData);
    console.log('✅ Knowledge search completed');
    console.log('   Results:', knowledgeSearchResponse.data);
    console.log('');
    
    // 5. Get vector service stats
    console.log('📊 Getting vector service statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Stats retrieved');
    console.log('   Stats:', JSON.stringify(statsResponse.data, null, 2));
    console.log('');
    
    console.log('🎉 All API tests passed! Pinecone integration is working correctly.');
    console.log('\n📝 Summary:');
    console.log('   - ✅ Conversation embedding storage via API');
    console.log('   - ✅ Knowledge embedding storage via API');
    console.log('   - ✅ Conversation search via API');
    console.log('   - ✅ Knowledge search via API');
    console.log('   - ✅ Service statistics via API');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Instructions
console.log('📋 Instructions:');
console.log('1. Make sure your backend server is running on http://localhost:3000');
console.log('2. Make sure PINECONE_API_KEY environment variable is set');
console.log('3. Run this script: node test-api-endpoints.js\n');

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/health');
    await testPineconeAPI();
  } catch (error) {
    console.error('❌ Server is not running or not accessible at http://localhost:3000');
    console.log('\nPlease start your backend server first:');
    console.log('npm run dev');
    process.exit(1);
  }
}

checkServer();
