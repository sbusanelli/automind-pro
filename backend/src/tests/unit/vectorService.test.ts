/**
 * @jest-environment node
 */

import { VectorService } from '../../services/vectorService';

// Mock Pinecone for testing
jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      query: jest.fn().mockResolvedValue({
        matches: [
          { id: 'test-job-1', score: 0.95, metadata: { type: 'job', jobId: 'test-job-1' } },
          { id: 'test-job-2', score: 0.87, metadata: { type: 'job', jobId: 'test-job-2' } }
        ]
      }),
      upsert: jest.fn().mockResolvedValue(undefined),
      deleteOne: jest.fn().mockResolvedValue(undefined)
    }),
    listIndexes: jest.fn().mockResolvedValue([
      { name: 'automind-jobs', dimension: 128, metric: 'vectorCount' }
    ])
  }))
}));

// Set required environment variable
process.env.PINECONE_API_KEY = 'test-api-key';

describe('VectorService', () => {
  let vectorService: VectorService;

  beforeEach(() => {
    vectorService = new VectorService();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(vectorService.initialize()).resolves.not.toThrow();
    });
  });

  describe('Job Embeddings', () => {
    beforeEach(async () => {
      await vectorService.initialize();
    });

    it('should upsert job embedding', async () => {
      const jobData = {
        id: 'test-job-1',
        name: 'Test Job',
        description: 'A test job for embedding',
        requirements: ['TypeScript', 'Node.js'],
        schedule: '0 9 * * 1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(vectorService.upsertJobEmbedding(jobData)).resolves.not.toThrow();
    });

    it('should search similar jobs', async () => {
      const query = 'TypeScript developer';
      const limit = 5;

      const results = await vectorService.searchSimilarJobs(query, limit);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'test-job-1',
        score: 0.95,
        metadata: { type: 'job', jobId: 'test-job-1' }
      });
    });

    it('should delete job embedding', async () => {
      const jobId = 'test-job-1';

      await expect(vectorService.deleteJobEmbedding(jobId)).resolves.not.toThrow();
    });
  });

  describe('Conversation Embeddings', () => {
    beforeEach(async () => {
      await vectorService.initialize();
    });

    it('should upsert conversation embedding', async () => {
      const conversationData = {
        id: 'test-conversation-1',
        userId: 'test-user-1',
        content: 'This is a test conversation about TypeScript',
        role: 'user' as const,
        timestamp: '2024-01-01T00:00:00Z'
      };

      await expect(vectorService.upsertConversationEmbedding(conversationData)).resolves.not.toThrow();
    });

    it('should search similar conversations', async () => {
      const query = 'TypeScript best practices';
      const userId = 'test-user-1';
      const limit = 3;

      const results = await vectorService.searchSimilarConversations(query, userId, limit);

      expect(results).toHaveLength(2);
    });
  });

  describe('Knowledge Embeddings', () => {
    beforeEach(async () => {
      await vectorService.initialize();
    });

    it('should upsert knowledge embedding', async () => {
      const knowledgeData = {
        id: 'test-knowledge-1',
        title: 'TypeScript Best Practices',
        content: 'Use TypeScript interfaces for better type safety',
        category: 'programming',
        tags: ['typescript', 'best-practices', 'type-safety'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(vectorService.upsertKnowledgeEmbedding(knowledgeData)).resolves.not.toThrow();
    });

    it('should search knowledge base', async () => {
      const query = 'type safety in TypeScript';
      const category = 'programming';
      const limit = 5;

      const results = await vectorService.searchKnowledge(query, category, limit);

      expect(results).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await vectorService.initialize();
    });

    it('should get vector service stats', async () => {
      const stats = await vectorService.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when service not initialized', async () => {
      const newVectorService = new VectorService();

      await expect(newVectorService.upsertJobEmbedding({
        id: 'test-job-1',
        name: 'Test Job',
        description: 'A test job',
        requirements: [],
        schedule: '0 9 * * 1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      })).rejects.toThrow('Vector service not initialized');
    });

    it('should throw error when searching without initialization', async () => {
      const newVectorService = new VectorService();

      await expect(newVectorService.searchSimilarJobs('test', 5)).rejects.toThrow('Vector service not initialized');
    });
  });
});
