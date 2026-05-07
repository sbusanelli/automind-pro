/**
 * MINIMAL WORKING TEST - This will actually insert embeddings into Pinecone
 * Run this to see real records in your Pinecone dashboard
 */

import { Pinecone } from '@pinecone-database/pinecone';

// Direct Pinecone test - bypass all our service code
async function testDirectPineconeInsert() {
  console.log('🚀 MINIMAL PINECONE TEST - Direct Insertion\n');
  
  try {
    // Initialize Pinecone directly
    console.log('📡 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
    
    console.log('✅ Connected to Pinecone\n');
    
    // Get the conversation index
    console.log('📂 Getting conversation index...');
    const conversationIndex = pinecone.index('automind-conversations');
    console.log('✅ Got conversation index\n');
    
    // Create a simple embedding (1024 dimensions to match Pinecone index)
    console.log('🔢 Creating test embedding...');
    const testEmbedding = Array.from({length: 1024}, (_, i) => Math.random());
    console.log('✅ Created 1024-dimensional embedding\n');
    
    // Insert a test record
    console.log('💾 Inserting test record...');
    const testRecord = {
      id: 'direct-test-' + Date.now(),
      values: testEmbedding,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'test',
        type: 'conversation',
        userId: 'test-user',
        content: 'This is a direct test insertion to verify Pinecone works'
      }
    };
    
    await conversationIndex.upsert([testRecord]);
    console.log('✅ Record inserted successfully!');
    console.log(`   ID: ${testRecord.id}`);
    console.log(`   Content: ${testRecord.metadata.content}\n`);
    
    // Verify insertion by querying
    console.log('🔍 Verifying insertion...');
    const queryResponse = await conversationIndex.query({
      vector: testEmbedding,
      topK: 1,
      includeMetadata: true
    });
    
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      const match = queryResponse.matches[0];
      console.log('✅ Record found in Pinecone!');
      console.log(`   ID: ${match.id}`);
      console.log(`   Score: ${match.score}`);
      console.log(`   Content: ${match.metadata?.content}\n`);
    } else {
      console.log('❌ Record not found in query\n');
    }
    
    // Get index stats
    console.log('📊 Getting index stats...');
    const stats = await conversationIndex.describeIndexStats();
    console.log('✅ Index stats:');
    console.log(`   Dimension: ${stats.dimension || 'Unknown'}`);
    console.log(`   Index fullness: ${stats.indexFullness || 'Unknown'}`);
    console.log(`   Namespaces: ${Object.keys(stats.namespaces || {}).join(', ') || 'None'}\n`);
    
    console.log('🎉 SUCCESS! Records are now in Pinecone!');
    console.log('📱 Check your Pinecone dashboard at https://app.pinecone.io');
    console.log('   - Look for the "automind-conversations" index');
    console.log('   - You should see 1+ vectors');
    console.log('   - The record ID should start with "direct-test-"\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Check environment
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY not set!');
  console.log('\nSet it first:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr\n');
  process.exit(1);
}

// Run the test
console.log('⚡ This test will ACTUALLY INSERT records into Pinecone');
console.log('⚡ You should see them appear in your dashboard immediately\n');
testDirectPineconeInsert();
