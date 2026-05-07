/**
 * Verification script for Pinecone integration
 * Run with: npx ts-node verify-pinecone.ts
 */

import { VectorService } from './src/services/vectorService';

async function verifyPineconeIntegration() {
  console.log('🚀 Verifying Pinecone Integration...\n');
  
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
      role: 'user' as const,
      timestamp: new Date().toISOString()
    };
    
    await vectorService.upsertConversationEmbedding(conversationData);
    console.log('✅ Conversation embedding stored successfully');
    console.log(`   - ID: ${conversationData.id}`);
    console.log(`   - Content: "${conversationData.content.substring(0, 50)}..."`);
    console.log(`   - Role: ${conversationData.role}\n`);
    
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
    console.log('✅ Knowledge embedding stored successfully');
    console.log(`   - ID: ${knowledgeData.id}`);
    console.log(`   - Title: ${knowledgeData.title}`);
    console.log(`   - Category: ${knowledgeData.category}\n`);
    
    // 4. Test searching conversations
    console.log('🔍 Testing conversation search...');
    const searchResults = await vectorService.searchSimilarConversations('TypeScript best practices', 'test-user-123', 5);
    console.log(`✅ Found ${searchResults.length} similar conversations:`);
    searchResults.forEach((result, index) => {
      console.log(`   ${index + 1}. ID: ${result.id}, Score: ${result.score.toFixed(3)}, Type: ${result.metadata.type}`);
    });
    console.log('');
    
    // 5. Test searching knowledge
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
    
    console.log('\n🎉 All tests passed! Pinecone integration is working correctly.');
    console.log('\n📝 Summary:');
    console.log('   - ✅ VectorService initialization');
    console.log('   - ✅ Conversation embedding storage');
    console.log('   - ✅ Knowledge embedding storage');
    console.log('   - ✅ Conversation search');
    console.log('   - ✅ Knowledge search');
    console.log('   - ✅ Service statistics');
    
  } catch (error) {
    console.error('❌ Verification failed:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    process.exit(1);
  }
}

// Check if required environment variables are set
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this verification:');
  console.log('export PINECONE_API_KEY=your-api-key-here');
  console.log('\nThen run:');
  console.log('npx ts-node verify-pinecone.ts');
  process.exit(1);
}

// Run the verification
verifyPineconeIntegration();
