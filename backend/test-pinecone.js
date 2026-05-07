/**
 * Simple test script to verify Pinecone integration
 * Run with: node test-pinecone.js
 */

const { VectorService } = require('./dist/services/vectorService.js');

async function testPineconeIntegration() {
  console.log('🚀 Testing Pinecone Integration...\n');
  
  const vectorService = new VectorService();
  
  try {
    // 1. Initialize the service
    console.log('📡 Initializing VectorService...');
    await vectorService.initialize();
    console.log('✅ VectorService initialized successfully\n');
    
    // 2. Test conversation embedding (this is what you asked about)
    console.log('💬 Testing conversation embedding storage...');
    const conversationData = {
      id: 'test-conversation-' + Date.now(),
      userId: 'test-user-123',
      content: 'This is a test prompt about TypeScript best practices and how to implement proper type safety in large applications',
      role: 'user',
      timestamp: new Date().toISOString()
    };
    
    await vectorService.upsertConversationEmbedding(conversationData);
    console.log('✅ Conversation embedding stored successfully\n');
    
    // 3. Test knowledge embedding
    console.log('📚 Testing knowledge embedding storage...');
    const knowledgeData = {
      id: 'test-knowledge-' + Date.now(),
      title: 'TypeScript Best Practices Guide',
      content: 'TypeScript provides static typing for JavaScript, enabling better code quality and developer experience. Key practices include using interfaces for type definitions, avoiding any types, and implementing proper generics.',
      category: 'programming',
      tags: ['typescript', 'best-practices', 'type-safety'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await vectorService.upsertKnowledgeEmbedding(knowledgeData);
    console.log('✅ Knowledge embedding stored successfully\n');
    
    // 4. Test searching conversations
    console.log('🔍 Testing conversation search...');
    const searchResults = await vectorService.searchSimilarConversations('TypeScript best practices', 'test-user-123', 5);
    console.log(`✅ Found ${searchResults.length} similar conversations`);
    searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ID: ${result.id}, Score: ${result.score.toFixed(3)}`);
    });
    console.log('');
    
    // 5. Test searching knowledge
    console.log('🔍 Testing knowledge search...');
    const knowledgeResults = await vectorService.searchKnowledge('type safety', 'programming', 5);
    console.log(`✅ Found ${knowledgeResults.length} knowledge items`);
    knowledgeResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ID: ${result.id}, Score: ${result.score.toFixed(3)}`);
    });
    console.log('');
    
    // 6. Get stats
    console.log('📊 Getting vector service stats...');
    const stats = await vectorService.getStats();
    console.log('✅ Stats retrieved:', JSON.stringify(stats, null, 2));
    
    console.log('\n🎉 All tests passed! Pinecone integration is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Check if required environment variables are set
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('Please set it before running this test:');
  console.log('export PINECONE_API_KEY=your-api-key-here');
  process.exit(1);
}

// Run the test
testPineconeIntegration();
