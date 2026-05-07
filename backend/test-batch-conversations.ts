/**
 * Test batch processing with conversation index (since knowledge index doesn't exist yet)
 */

import { VectorService } from './src/services/vectorService';

// Sample conversation data
interface ConversationData {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

const sampleConversations: ConversationData[] = [
  {
    id: 'conv-batch-001',
    userId: 'user-123',
    content: 'How do I implement TypeScript interfaces in React components?',
    role: 'user',
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv-batch-002',
    userId: 'user-123',
    content: 'You can define interfaces for your props and state in React components. For example: interface UserProps { name: string; age: number; }',
    role: 'assistant',
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv-batch-003',
    userId: 'user-456',
    content: 'What are the best practices for Node.js error handling?',
    role: 'user',
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv-batch-004',
    userId: 'user-456',
    content: 'Use try-catch blocks for async operations, implement global error handlers, and create custom error classes for better error management.',
    role: 'assistant',
    timestamp: new Date().toISOString()
  },
  {
    id: 'conv-batch-005',
    userId: 'user-789',
    content: 'Can you explain React hooks and when to use them?',
    role: 'user',
    timestamp: new Date().toISOString()
  }
];

async function testBatchConversations() {
  console.log('🚀 Testing batch conversation processing...\n');
  
  const vectorService = new VectorService();
  
  try {
    // Initialize the service
    console.log('📡 Initializing VectorService...');
    await vectorService.initialize();
    console.log('✅ VectorService initialized successfully\n');
    
    // Process conversations individually (since we don't have batch conversation method yet)
    console.log(`💬 Processing ${sampleConversations.length} conversations...`);
    
    const startTime = Date.now();
    
    for (let i = 0; i < sampleConversations.length; i++) {
      const conv = sampleConversations[i];
      await vectorService.upsertConversationEmbedding(conv);
      console.log(`   ✅ Processed ${i + 1}/${sampleConversations.length}: ${conv.id}`);
    }
    
    const endTime = Date.now();
    
    console.log(`\n✅ Batch processing completed in ${endTime - startTime}ms`);
    console.log(`📊 Processed ${sampleConversations.length} conversations`);
    console.log(`📈 Average time per item: ${((endTime - startTime) / sampleConversations.length).toFixed(2)}ms\n`);
    
    // Test search functionality
    console.log('🔍 Testing search functionality...');
    const testQueries = [
      'TypeScript React',
      'error handling',
      'React hooks'
    ];
    
    for (const query of testQueries) {
      try {
        const results = await vectorService.searchSimilarConversations(query, undefined, 3);
        console.log(`   Query: "${query}" - Found ${results.length} results`);
        results.forEach((result, index) => {
          console.log(`     ${index + 1}. Score: ${result.score.toFixed(3)}, ID: ${result.id}`);
        });
      } catch (searchError) {
        console.log(`   Query: "${query}" - Search failed: ${searchError instanceof Error ? searchError.message : String(searchError)}`);
      }
    }
    
    console.log('\n🎉 Batch conversation processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this script:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  console.log('\nThen run:');
  console.log('npx ts-node test-batch-conversations.ts');
  process.exit(1);
}

// Run the test
testBatchConversations();
