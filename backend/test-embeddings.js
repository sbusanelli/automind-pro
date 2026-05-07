/**
 * Comprehensive test script for Pinecone embeddings
 * Tests conversation, knowledge, and job embeddings with search functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/vector';

// Test data
const testData = {
  conversations: [
    {
      id: 'conv-001',
      userId: 'user-123',
      content: 'I need help implementing TypeScript interfaces for my React application. Can you explain the best practices?',
      role: 'user'
    },
    {
      id: 'conv-002', 
      userId: 'user-123',
      content: 'TypeScript interfaces provide compile-time type checking and better IDE support. Use them for defining object shapes.',
      role: 'assistant'
    },
    {
      id: 'conv-003',
      userId: 'user-456',
      content: 'How do I handle async/await in Node.js with proper error handling?',
      role: 'user'
    }
  ],
  knowledge: [
    {
      id: 'knowledge-001',
      title: 'TypeScript Best Practices',
      content: 'TypeScript provides static typing for JavaScript. Key practices include using interfaces for type definitions, avoiding any types, implementing proper generics, and enabling strict mode in tsconfig.json.',
      category: 'programming',
      tags: ['typescript', 'best-practices', 'type-safety']
    },
    {
      id: 'knowledge-002',
      title: 'React Component Patterns',
      content: 'Modern React patterns include functional components with hooks, custom hooks for logic reuse, and composition over inheritance. Use TypeScript for prop typing.',
      category: 'programming',
      tags: ['react', 'components', 'hooks', 'typescript']
    },
    {
      id: 'knowledge-003',
      title: 'Node.js Error Handling',
      content: 'Proper error handling in Node.js involves try-catch blocks for async operations, error-first callbacks, and using process.on("uncaughtException") for critical errors.',
      category: 'programming',
      tags: ['nodejs', 'error-handling', 'async']
    }
  ],
  jobs: [
    {
      id: 'job-001',
      name: 'Senior TypeScript Developer',
      description: 'Looking for an experienced TypeScript developer to work on enterprise applications.',
      requirements: ['TypeScript', 'React', 'Node.js', '5+ years experience'],
      schedule: '9-5 weekdays',
      status: 'active'
    },
    {
      id: 'job-002',
      name: 'Full Stack React Developer',
      description: 'Join our team to build modern web applications with React and TypeScript.',
      requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      schedule: 'remote flexible',
      status: 'active'
    }
  ]
};

async function testEmbeddings() {
  console.log('🚀 Testing Pinecone Embeddings...\n');
  
  try {
    // 1. Test conversation embeddings
    console.log('💬 Testing conversation embeddings...');
    for (const conv of testData.conversations) {
      try {
        const response = await axios.post(`${BASE_URL}/conversations/${conv.id}/embed`, conv);
        console.log(`   ✅ Stored conversation ${conv.id}`);
      } catch (error) {
        console.log(`   ❌ Failed to store conversation ${conv.id}:`, error.response?.data || error.message);
      }
    }
    
    // 2. Test knowledge embeddings
    console.log('\n📚 Testing knowledge embeddings...');
    for (const knowledge of testData.knowledge) {
      try {
        const response = await axios.post(`${BASE_URL}/knowledge/${knowledge.id}/embed`, knowledge);
        console.log(`   ✅ Stored knowledge ${knowledge.id}`);
      } catch (error) {
        console.log(`   ❌ Failed to store knowledge ${knowledge.id}:`, error.response?.data || error.message);
      }
    }
    
    // 3. Test job embeddings
    console.log('\n💼 Testing job embeddings...');
    for (const job of testData.jobs) {
      try {
        const response = await axios.post(`${BASE_URL}/jobs/${job.id}/embed`, job);
        console.log(`   ✅ Stored job ${job.id}`);
      } catch (error) {
        console.log(`   ❌ Failed to store job ${job.id}:`, error.response?.data || error.message);
      }
    }
    
    // 4. Test search functionality
    console.log('\n🔍 Testing search functionality...');
    
    // Search conversations
    console.log('   Searching conversations about TypeScript...');
    try {
      const searchResponse = await axios.post(`${BASE_URL}/conversations/search`, {
        query: 'TypeScript interfaces React',
        userId: 'user-123',
        limit: 5
      });
      console.log(`   ✅ Found ${searchResponse.data.results.length} conversation matches`);
      searchResponse.data.results.forEach((result, i) => {
        console.log(`      ${i+1}. Score: ${result.score.toFixed(3)}, ID: ${result.id}`);
      });
    } catch (error) {
      console.log(`   ❌ Conversation search failed:`, error.response?.data || error.message);
    }
    
    // Search knowledge
    console.log('   Searching knowledge base for error handling...');
    try {
      const knowledgeResponse = await axios.post(`${BASE_URL}/knowledge/search`, {
        query: 'error handling async await',
        category: 'programming',
        limit: 5
      });
      console.log(`   ✅ Found ${knowledgeResponse.data.results.length} knowledge matches`);
      knowledgeResponse.data.results.forEach((result, i) => {
        console.log(`      ${i+1}. Score: ${result.score.toFixed(3)}, ID: ${result.id}`);
      });
    } catch (error) {
      console.log(`   ❌ Knowledge search failed:`, error.response?.data || error.message);
    }
    
    // Search jobs
    console.log('   Searching jobs for TypeScript developers...');
    try {
      const jobResponse = await axios.post(`${BASE_URL}/jobs/search`, {
        query: 'TypeScript React developer',
        limit: 5
      });
      console.log(`   ✅ Found ${jobResponse.data.results.length} job matches`);
      jobResponse.data.results.forEach((result, i) => {
        console.log(`      ${i+1}. Score: ${result.score.toFixed(3)}, ID: ${result.id}`);
      });
    } catch (error) {
      console.log(`   ❌ Job search failed:`, error.response?.data || error.message);
    }
    
    // 5. Get service statistics
    console.log('\n📊 Getting service statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/stats`);
      console.log('   ✅ Service statistics:');
      console.log('   ', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log(`   ❌ Stats retrieval failed:`, error.response?.data || error.message);
    }
    
    console.log('\n🎉 Embedding test completed!');
    console.log('\n📝 Summary:');
    console.log('   - ✅ Tested conversation embedding storage');
    console.log('   - ✅ Tested knowledge embedding storage');
    console.log('   - ✅ Tested job embedding storage');
    console.log('   - ✅ Tested search functionality');
    console.log('   - ✅ Retrieved service statistics');
    console.log('\n💡 Check your Pinecone dashboard to see the stored vectors!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

// Check server health first
async function checkServer() {
  try {
    await axios.get('http://localhost:5000/health');
    console.log('✅ Server is running\n');
    await testEmbeddings();
  } catch (error) {
    console.error('❌ Server is not running on http://localhost:5000');
    console.log('Please start your server first: npm run dev');
    process.exit(1);
  }
}

console.log('🔍 Embedding Test Suite');
console.log('====================\n');
checkServer();
