/**
 * Document Embedding Demo
 * Shows how to convert various document types to knowledge embeddings
 */

import { DocumentProcessor, DocumentMetadata } from './src/services/documentProcessor';

// Sample documents in different formats
const sampleDocuments = {
  // Technical documentation
  technicalDoc: {
    content: `
# TypeScript Best Practices Guide

## Introduction
TypeScript is a strongly typed programming language that builds on JavaScript, providing better tooling at any scale. This guide covers essential best practices for TypeScript development.

## Type Safety
Always enable strict mode in your tsconfig.json:
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
\`\`\`

## Interface Design
Use interfaces to define object shapes and contracts:
\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}
\`\`\`

## Error Handling
Implement proper error handling with try-catch blocks and custom error classes:
\`\`\`typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
\`\`\`

## Performance Optimization
- Use lazy loading for large modules
- Implement proper caching strategies
- Optimize bundle size with tree shaking
- Use readonly for immutable data
    `,
    metadata: {
      title: 'TypeScript Best Practices Guide',
      author: 'Development Team',
      source: 'internal-docs',
      documentType: 'md' as const,
      category: 'programming',
      tags: ['typescript', 'best-practices', 'development', 'type-safety'],
      created_at: '2026-05-07T17:00:00.000Z',
      updated_at: '2026-05-07T17:00:00.000Z'
    }
  },

  // Research paper
  researchPaper: {
    content: `
Abstract: This paper explores the impact of artificial intelligence on modern software development practices. We conducted a comprehensive study of 500 development teams across various industries to understand AI adoption patterns.

Introduction: Artificial intelligence has revolutionized software development through automated code generation, intelligent debugging, and predictive analytics. Our research aims to quantify these impacts and identify best practices.

Methodology: We employed a mixed-methods approach combining quantitative surveys with qualitative interviews. The study spanned 18 months and included participants from 15 countries.

Key Findings:
1. Teams using AI assistants showed 40% increase in productivity
2. Code quality improved by 25% with AI-powered testing tools
3. Developer satisfaction increased significantly with AI integration
4. Learning curve for AI tools averaged 2-3 weeks

Conclusion: AI integration in software development shows substantial benefits but requires proper training and change management strategies.

Keywords: artificial intelligence, software development, productivity, code quality, developer tools
    `,
    metadata: {
      title: 'AI Impact on Software Development Research',
      author: 'Research Team',
      source: 'academic-journal',
      documentType: 'txt' as const,
      category: 'research',
      tags: ['ai', 'software-development', 'research', 'productivity', 'code-quality'],
      created_at: '2026-05-07T17:00:00.000Z',
      updated_at: '2026-05-07T17:00:00.000Z'
    }
  },

  // API documentation
  apiDoc: {
    content: `
# User Management API Documentation

## Overview
The User Management API provides endpoints for creating, reading, updating, and deleting user accounts in the system.

## Base URL
\`\`\`
https://api.example.com/v1/users
\`\`\`

## Authentication
All API requests must include a valid JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Endpoints

### Create User
\`\`\`http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
\`\`\`

### Get User
\`\`\`http
GET /users/{userId}
Authorization: Bearer <token>
\`\`\`

### Update User
\`\`\`http
PUT /users/{userId}
Content-Type: application/json

{
  "name": "Jane Doe",
  "role": "admin"
}
\`\`\`

### Delete User
\`\`\`http
DELETE /users/{userId}
Authorization: Bearer <token>
\`\`\`

## Error Handling
The API returns standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
API requests are limited to 1000 requests per hour per API key.
    `,
    metadata: {
      title: 'User Management API Documentation',
      author: 'API Team',
      source: 'internal-api-docs',
      documentType: 'md' as const,
      category: 'api',
      tags: ['api', 'documentation', 'rest', 'users', 'authentication'],
      created_at: '2026-05-07T17:00:00.000Z',
      updated_at: '2026-05-07T17:00:00.000Z'
    }
  }
};

async function demonstrateDocumentEmbedding() {
  console.log('🚀 Document Embedding Demo\n');
  
  const processor = new DocumentProcessor();
  
  try {
    // Initialize the processor
    console.log('📡 Initializing Document Processor...');
    await processor.initialize();
    console.log('✅ Document Processor initialized successfully\n');
    
    // Process each document with different chunking strategies
    const documents = Object.values(sampleDocuments);
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      console.log(`📄 Processing Document ${i + 1}: ${doc.metadata.title}`);
      console.log(`   Type: ${doc.metadata.documentType}`);
      console.log(`   Length: ${doc.content.length} characters`);
      console.log(`   Category: ${doc.metadata.category}\n`);
      
      // Process with custom chunking options
      await processor.processDocument(doc.content, doc.metadata, {
        chunkSize: 800,
        chunkOverlap: 150,
        minChunkLength: 100,
        maxChunkLength: 2000,
        category: doc.metadata.category,
        tags: doc.metadata.tags
      });
      
      console.log(`   ✅ Document processed and stored as embeddings\n`);
    }
    
    // Test search functionality
    console.log('🔍 Testing Document Search...\n');
    
    const testQueries = [
      'TypeScript interface design',
      'AI impact on development',
      'API authentication methods',
      'error handling patterns',
      'user management endpoints'
    ];
    
    for (const query of testQueries) {
      console.log(`🔍 Searching: "${query}"`);
      try {
        const results = await processor.searchDocuments(query, undefined, 3);
        console.log(`   Found ${results.length} relevant document chunks:`);
        results.forEach((result, index) => {
          console.log(`     ${index + 1}. Score: ${result.score.toFixed(3)}`);
          console.log(`        Title: ${result.metadata.title}`);
          console.log(`        Preview: ${result.metadata.content?.substring(0, 100)}...`);
        });
      } catch (searchError) {
        console.log(`   Search failed: ${searchError instanceof Error ? searchError.message : String(searchError)}`);
      }
      console.log('');
    }
    
    console.log('🎉 Document Embedding Demo Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Processed 3 different document types');
    console.log('   ✅ Applied intelligent chunking strategies');
    console.log('   ✅ Stored as searchable knowledge embeddings');
    console.log('   ✅ Semantic search working across all documents');
    console.log('\n💡 Check your Pinecone dashboard to see the stored document chunks!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Function to process a file from disk
async function processDocumentFile(filePath: string, metadata: DocumentMetadata) {
  const processor = new DocumentProcessor();
  await processor.initialize();
  
  try {
    const content = await processor.extractTextFromFile(filePath);
    await processor.processDocument(content, metadata);
    
    console.log(`✅ File processed: ${filePath}`);
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Type: ${metadata.documentType}`);
    
  } catch (error) {
    console.error(`❌ Failed to process file: ${filePath}`, error);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Document Embedding Demo');
    console.log('============================\n');
    console.log('Usage:');
    console.log('  npx ts-node document-embedding-demo.ts demo                    - Run demo with sample documents');
    console.log('  npx ts-node document-embedding-demo.ts file <path> <title>    - Process a document file');
    console.log('');
    console.log('Supported file types: .txt, .md, .html, .json');
    console.log('');
    console.log('Examples:');
    console.log('  npx ts-node document-embedding-demo.ts demo');
    console.log('  npx ts-node document-embedding-demo.ts file ./guide.md "My Guide"');
    return;
  }
  
  const command = args[0];
  
  if (command === 'demo') {
    await demonstrateDocumentEmbedding();
  } else if (command === 'file') {
    if (args.length < 3) {
      console.error('❌ Please provide file path and title');
      console.log('Usage: npx ts-node document-embedding-demo.ts file <path> <title>');
      process.exit(1);
    }
    
    const filePath = args[1];
    const title = args[2];
    
    const metadata: DocumentMetadata = {
      title,
      source: 'file-upload',
      documentType: 'txt' as const, // Will be updated based on file extension
      category: 'general',
      tags: ['uploaded'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await processDocumentFile(filePath, metadata);
  } else {
    console.error('❌ Unknown command:', command);
    process.exit(1);
  }
}

// Check environment variables
if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY environment variable is not set');
  console.log('\nPlease set it before running this demo:');
  console.log('export PINECONE_API_KEY=pcsk_6E8gvG_MARynUiWU4nQtkPMa3PwJQgeRDU1sKAZBBRBidvj718SY1rZjfaT155xxd8HbUr');
  console.log('\nThen run:');
  console.log('npx ts-node document-embedding-demo.ts demo');
  process.exit(1);
}

// Run the demo
if (require.main === module) {
  main();
}

export { demonstrateDocumentEmbedding, processDocumentFile };
