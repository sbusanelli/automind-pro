/**
 * Direct test of VectorService without API routes
 * This tests the core Pinecone integration directly
 */

import { VectorService } from './src/services/vectorService';

async function testVectorServiceDirectly() {
  console.log('🚀 Testing VectorService Directly...\n');
  
  const vectorService = new VectorService();
  
  try {
    // 1. Initialize the service
    console.log('📡 Initializing VectorService...');
    await vectorService.initialize();
    console.log('✅ VectorService initialized successfully\n');
    
    // 2. Test conversation embedding
    console.log('💬 Testing conversation embedding...');
    const conversationData = {
      id: 'direct-test-conv-' + Date.now(),
      userId: 'test-user-123',
      content: 'I need help implementing TypeScript interfaces for my React application. Can you explain the best practices?',
      role: 'user' as const,
      timestamp: new Date().toISOString()
    };
    
    await vectorService.upsertConversationEmbedding(conversationData);
    console.log('✅ Conversation embedding stored successfully');
    console.log(`   ID: ${conversationData.id}`);
    console.log(`   Content: "${conversationData.content.substring(0, 50)}..."`);
    console.log(`   Role: ${conversationData.role}\n`);
    
    // 3. Test knowledge embedding
    console.log('📚 Testing knowledge embedding...');
    const knowledgeData = {
      id: 'direct-test-knowledge-' + Date.now(),
      title: 'TypeScript Best Practices Guide',
      content: 'TypeScript provides static typing for JavaScript, enabling better code quality and developer experience. Key practices include using interfaces for type definitions, avoiding any types, and implementing proper generics.',
      category: 'programming',
      tags: ['typescript', 'best-practices', 'type-safety'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await vectorService.upsertKnowledgeEmbedding(knowledgeData);
    console.log('✅ Knowledge embedding stored successfully');
    console.log(`   ID: ${knowledgeData.id}`);
    console.log(`   Title: ${knowledgeData.title}`);
    console.log(`   Category: ${knowledgeData.category}\n`);
    
    // 4. Test conversation search
    console.log('🔍 Testing conversation search...');
    const searchResults = await vectorService.searchSimilarConversations('TypeScript interfaces React', 'test-user-123', 5);
    console.log(`✅ Found ${searchResults.length} similar conversations:`);
    searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ID: ${result.id}, Score: ${result.score.toFixed(3)}, Type: ${result.metadata.type}`);
    });
    console.log('');
    
    // 5. Test knowledge search
    console.log('🔍 Testing knowledge search...');
    const knowledgeResults = await vectorService.searchKnowledge('type safety', 'programming', 5);
    console.log(`✅ Found ${knowledgeResults.length} knowledge items:`);
    knowledgeResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ID: ${result.id}, Score: ${result.score.toFixed(3)}, Type: ${result.metadata.type}`);
    });
    console.log('');
    
    // 6. Get stats
    console.log('📊 Getting vector service stats...');
    const stats = await vectorService.getStats();
    console.log('✅ Stats retrieved:');
    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n🎉 Direct VectorService test completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - ✅ VectorService initialization');
    console.log('   - ✅ Conversation embedding storage');
    console.log('   - ✅ Knowledge embedding storage');
    console.log('   - ✅ Conversation search');
    console.log('   - ✅ Knowledge search');
    console.log('   - ✅ Service statistics');
    console.log('\n💡 Check your Pinecone dashboard to see the stored vectors!');
    
  } catch (error) {
    console.error('❌ Direct test failed:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this test:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  console.log('\nThen run:');
  console.log('npx ts-node direct-vector-test.ts');
  process.exit(1);
}

// Run the test
testVectorServiceDirectly();
