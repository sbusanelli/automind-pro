/**
 * Direct Pinecone test using curl commands
 * This will insert records directly into your index
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testPineconeDirectly() {
  console.log('🚀 Testing Pinecone Directly...\n');
  
  try {
    // Test 1: Insert a conversation embedding
    console.log('💬 Inserting conversation embedding...');
    const timestamp = Date.now();
    
    const insertCommand = `curl -X POST https://52b6411f-54b4-4add-a927-674955b620a5.svc.apw5-4e7b-81fa.pinecone.io/vectors/upsert \
      -H "Api-Key: ${process.env.PINECONE_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "vectors": [
          {
            "id": "test-conversation-${timestamp}",
            "values": [${Array.from({length: 128}, () => Math.random()).join(',')}],
            "metadata": {
              "timestamp": "${new Date().toISOString()}",
              "source": "test",
              "type": "conversation",
              "userId": "test-user-123",
              "content": "This is a test conversation about TypeScript best practices"
            }
          }
        ]
      }'`;
    
    const { stdout, stderr } = await execPromise(insertCommand);
    console.log('✅ Insert response:', stdout);
    
    // Test 2: Query the inserted record
    console.log('\n🔍 Querying the inserted record...');
    const queryCommand = `curl -X POST https://52b6411f-54b4-4add-a927-674955b620a5.svc.apw5-4e7b-81fa.pinecone.io/vectors/query \
      -H "Api-Key: ${process.env.PINECONE_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "vector": [${Array.from({length: 128}, () => Math.random()).join(',')}],
        "topK": 1,
        "includeMetadata": true
      }'`;
    
    const queryResult = await execPromise(queryCommand);
    console.log('✅ Query response:', queryResult.stdout);
    
    console.log('\n🎉 Test completed!');
    console.log('📱 Check your Pinecone dashboard at the URL you provided');
    console.log('   You should see the test record with ID starting with "test-conversation-"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check environment
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY not set!');
  console.log('Set it first:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  process.exit(1);
}

console.log('🔧 This test will use your Pinecone index directly');
console.log('🔧 You should see records appear immediately in your dashboard\n');
testPineconeDirectly();
