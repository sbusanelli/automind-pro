/**
 * Batch Knowledge Processor for Pinecone Vector Database
 * Use this script to add multiple knowledge items to your vector database
 */

import { VectorService } from './src/services/vectorService';

// Sample knowledge data structure
interface KnowledgeData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Sample knowledge data - replace with your actual data
const sampleKnowledgeData: KnowledgeData[] = [
  {
    id: 'kb-001',
    title: 'Introduction to TypeScript',
    content: 'TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. TypeScript adds static types, classes, and modules to JavaScript, enabling better IDE support, compile-time error checking, and improved code maintainability.',
    category: 'programming',
    tags: ['typescript', 'javascript', 'programming', 'types'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kb-002',
    title: 'React Hooks Best Practices',
    content: 'React Hooks provide a more direct API to React concepts you already know: props, state, context, refs, and lifecycle. Best practices include keeping hooks at the top level, only calling hooks from React functions, using custom hooks for reusable logic, and following the rules of hooks.',
    category: 'programming',
    tags: ['react', 'hooks', 'frontend', 'javascript'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kb-003',
    title: 'Node.js Error Handling Patterns',
    content: 'Proper error handling in Node.js is crucial for building robust applications. Common patterns include try-catch blocks for async operations, error-first callbacks, using process.on for uncaught exceptions, implementing global error handlers, and creating custom error classes for better error management.',
    category: 'programming',
    tags: ['nodejs', 'error-handling', 'backend', 'javascript'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kb-004',
    title: 'Database Design Principles',
    content: 'Good database design follows principles like normalization to reduce redundancy, proper indexing for performance, foreign key constraints for data integrity, and choosing appropriate data types. Understanding relationships between entities and designing efficient queries are also essential.',
    category: 'database',
    tags: ['database', 'design', 'sql', 'normalization'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'kb-005',
    title: 'API Security Best Practices',
    content: 'Securing APIs involves implementing authentication and authorization, using HTTPS for encryption, validating input data, implementing rate limiting, using proper CORS policies, and following the principle of least privilege. Regular security audits and keeping dependencies updated are also important.',
    category: 'security',
    tags: ['api', 'security', 'authentication', 'https'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Function to load knowledge from JSON file
async function loadKnowledgeFromFile(filePath: string): Promise<KnowledgeData[]> {
  try {
    const fs = require('fs').promises;
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load knowledge from ${filePath}:`, error);
    return [];
  }
}

// Function to generate knowledge data from CSV (basic implementation)
async function loadKnowledgeFromCSV(filePath: string): Promise<KnowledgeData[]> {
  try {
    const fs = require('fs').promises;
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line: string, index: number) => {
      const values = line.split(',');
      return {
        id: values[0] || `kb-${index + 1}`,
        title: values[1] || '',
        content: values[2] || '',
        category: values[3] || 'general',
        tags: values[4] ? values[4].split(';') : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }).filter((item: any) => item.title && item.content);
  } catch (error) {
    console.error(`Failed to load knowledge from ${filePath}:`, error);
    return [];
  }
}

// Main batch processing function
async function processKnowledgeBatch(knowledgeData: KnowledgeData[], options: {
  batchSize?: number;
  skipExisting?: boolean;
} = {}) {
  console.log('🚀 Starting batch knowledge processing...\n');
  
  const vectorService = new VectorService();
  
  try {
    // Initialize the service
    console.log('📡 Initializing VectorService...');
    await vectorService.initialize();
    console.log('✅ VectorService initialized successfully\n');
    
    // Process the batch
    console.log(`📚 Processing ${knowledgeData.length} knowledge items...`);
    
    const startTime = Date.now();
    await vectorService.upsertKnowledgeEmbeddingsBatch(knowledgeData);
    const endTime = Date.now();
    
    console.log(`\n✅ Batch processing completed in ${endTime - startTime}ms`);
    console.log(`📊 Processed ${knowledgeData.length} knowledge items`);
    console.log(`📈 Average time per item: ${((endTime - startTime) / knowledgeData.length).toFixed(2)}ms\n`);
    
    // Test search functionality
    console.log('🔍 Testing search functionality...');
    const testQueries = [
      'TypeScript programming',
      'React hooks',
      'error handling',
      'database design',
      'API security'
    ];
    
    for (const query of testQueries) {
      try {
        const results = await vectorService.searchKnowledge(query, undefined, 3);
        console.log(`   Query: "${query}" - Found ${results.length} results`);
        results.forEach((result, index) => {
          console.log(`     ${index + 1}. Score: ${result.score.toFixed(3)}, ID: ${result.id}`);
        });
      } catch (searchError) {
        console.log(`   Query: "${query}" - Search failed: ${searchError instanceof Error ? searchError.message : String(searchError)}`);
      }
    }
    
    console.log('\n🎉 Batch knowledge processing completed successfully!');
    console.log('💡 Check your Pinecone dashboard to see the stored vectors');
    
  } catch (error) {
    console.error('❌ Batch processing failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Usage:');
    console.log('  npx ts-node batch-knowledge-processor.ts <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  sample                    - Process sample knowledge data');
    console.log('  file <path>               - Load knowledge from JSON file');
    console.log('  csv <path>                 - Load knowledge from CSV file');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node batch-knowledge-processor.ts sample');
    console.log('  npx ts-node batch-knowledge-processor.ts file ./knowledge.json');
    console.log('  npx ts-node batch-knowledge-processor.ts csv ./knowledge.csv');
    console.log('');
    console.log('CSV format: id,title,content,category,tags (semicolon-separated)');
    return;
  }
  
  const command = args[0];
  let knowledgeData: KnowledgeData[] = [];
  
  switch (command) {
    case 'sample':
      knowledgeData = sampleKnowledgeData;
      break;
    case 'file':
      if (args.length < 2) {
        console.error('❌ Please provide a file path');
        process.exit(1);
      }
      knowledgeData = await loadKnowledgeFromFile(args[1]);
      break;
    case 'csv':
      if (args.length < 2) {
        console.error('❌ Please provide a CSV file path');
        process.exit(1);
      }
      knowledgeData = await loadKnowledgeFromCSV(args[1]);
      break;
    default:
      console.error('❌ Unknown command:', command);
      process.exit(1);
  }
  
  if (knowledgeData.length === 0) {
    console.error('❌ No knowledge data to process');
    process.exit(1);
  }
  
  await processKnowledgeBatch(knowledgeData);
}

// Check environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this script:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  console.log('\nThen run:');
  console.log('npx ts-node batch-knowledge-processor.ts sample');
  process.exit(1);
}

// Run the script
if (require.main === module) {
  main();
}

export { processKnowledgeBatch, loadKnowledgeFromFile, loadKnowledgeFromCSV };
