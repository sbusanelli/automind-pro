import { logger } from '../utils/logger';
import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorMetadata {
  timestamp: string;
  source: string;
  type: 'job' | 'conversation' | 'knowledge' | 'user';
  userId?: string;
  jobId?: string;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

export interface JobVectorData {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  schedule: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationVectorData {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  embedding?: number[];
}

export interface KnowledgeVectorData {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export class VectorService {
  private pinecone: Pinecone;
  private isInitialized: boolean = false;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      const indexList = await this.pinecone.listIndexes();
      const indexNames: string[] = [];
      if (indexList && Array.isArray(indexList)) {
        for (const index of indexList) {
          indexNames.push(index.name);
        }
      }
      /**
 * @jest-environment node
 */
      logger.info('Pinecone initialized successfully', { 
        environment: process.env.PINECONE_ENV || 'us-west1-gcp-free'
      });
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize Pinecone:', error);
      throw new Error('Vector service initialization failed');
    }
  }


  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Vector service not initialized. Call initialize() first.');
    }
  }

  /**
   * Store job embedding for semantic search
   */
  async upsertJobEmbedding(jobData: JobVectorData): Promise<void> {
    this.ensureInitialized();
    
    try {
      const jobIndex = this.pinecone.index('automind-jobs');
      
      // Create embedding text from job data
      const embeddingText = [
        jobData.name,
        jobData.description || '',
        jobData.requirements.join(' '),
        jobData.schedule,
        jobData.status
      ].join(' ');

      // In production, this would use OpenAI embeddings
      // For now, we'll use a simple hash-based embedding
      const embedding = await this.generateEmbedding(embeddingText);
      
      await jobIndex.upsert([{
        id: jobData.id,
        values: embedding,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'job',
          type: 'job',
          jobId: jobData.id,
          name: jobData.name,
          description: jobData.description,
          status: jobData.status
        }
      }]);

      logger.info('Job embedding stored', { jobId: jobData.id });
    } catch (error) {
      logger.error('Failed to store job embedding:', error);
      throw new Error(`Failed to store job embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store conversation embedding for semantic search
   */
  async upsertConversationEmbedding(conversationData: ConversationVectorData): Promise<void> {
    this.ensureInitialized();
    
    try {
      const conversationIndex = this.pinecone.index('automind-conversations');
      
      const embedding = await this.generateEmbedding(conversationData.content);
      
      await conversationIndex.upsert([{
        id: conversationData.id,
        values: embedding,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'conversation',
          type: 'conversation',
          userId: conversationData.userId,
          role: conversationData.role
        }
      }]);

      logger.info('Conversation embedding stored', { conversationId: conversationData.id });
    } catch (error) {
      logger.error('Failed to store conversation embedding:', error);
      throw new Error(`Failed to store conversation embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store knowledge base embedding
   */
  async upsertKnowledgeEmbedding(knowledgeData: KnowledgeVectorData): Promise<void> {
    this.ensureInitialized();
    
    try {
      const knowledgeIndex = this.pinecone.index('automind-knowledge');
      
      const embeddingText = [
        knowledgeData.title,
        knowledgeData.content,
        knowledgeData.category,
        knowledgeData.tags.join(' ')
      ].join(' ');

      const embedding = await this.generateEmbedding(embeddingText);
      
      await knowledgeIndex.upsert([{
        id: knowledgeData.id,
        values: embedding,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'knowledge',
          type: 'knowledge',
          category: knowledgeData.category,
          tags: knowledgeData.tags
        }
      }]);

      logger.info('Knowledge embedding stored', { knowledgeId: knowledgeData.id });
    } catch (error) {
      logger.error('Failed to store knowledge embedding:', error);
      throw new Error(`Failed to store knowledge embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store multiple knowledge embeddings in batch
   */
  async upsertKnowledgeEmbeddingsBatch(knowledgeDataArray: KnowledgeVectorData[]): Promise<void> {
    this.ensureInitialized();
    
    if (knowledgeDataArray.length === 0) {
      logger.info('No knowledge embeddings to store');
      return;
    }
    
    try {
      const knowledgeIndex = this.pinecone.index('automind-knowledge');
      
      // Process in batches of 100 to avoid hitting Pinecone limits
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < knowledgeDataArray.length; i += batchSize) {
        batches.push(knowledgeDataArray.slice(i, i + batchSize));
      }
      
      logger.info(`Processing ${knowledgeDataArray.length} knowledge items in ${batches.length} batches`);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Generate embeddings for the batch
        const vectors = [];
        
        for (const knowledgeData of batch) {
          const embeddingText = [
            knowledgeData.title,
            knowledgeData.content,
            knowledgeData.category,
            knowledgeData.tags.join(' ')
          ].join(' ');

          const embedding = await this.generateEmbedding(embeddingText);
          
          vectors.push({
            id: knowledgeData.id,
            values: embedding,
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'knowledge',
              type: 'knowledge',
              category: knowledgeData.category,
              tags: knowledgeData.tags,
              title: knowledgeData.title
            }
          });
        }
        
        // Upsert the batch
        await knowledgeIndex.upsert(vectors);
        
        logger.info(`Batch ${batchIndex + 1}/${batches.length} completed`, {
          batchSize: batch.length,
          totalProcessed: (batchIndex + 1) * batchSize
        });
      }
      
      logger.info('All knowledge embeddings stored successfully', {
        totalItems: knowledgeDataArray.length,
        batchesProcessed: batches.length
      });
      
    } catch (error) {
      logger.error('Failed to store knowledge embeddings in batch:', error);
      throw new Error(`Failed to store knowledge embeddings in batch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search for similar jobs based on embedding
   */
  async searchSimilarJobs(query: string, limit: number = 10): Promise<VectorSearchResult[]> {
    this.ensureInitialized();
    
    try {
      const jobIndex = this.pinecone.index('automind-jobs');
      const queryEmbedding = await this.generateEmbedding(query);
      
      const queryResponse = await jobIndex.query({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
        filter: { type: 'job' }
      });

      return queryResponse.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as unknown as VectorMetadata
      })) || [];
    } catch (error) {
      logger.error('Failed to search similar jobs:', error);
      throw new Error(`Failed to search similar jobs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search for similar conversations
   */
  async searchSimilarConversations(query: string, userId?: string, limit: number = 10): Promise<VectorSearchResult[]> {
    this.ensureInitialized();
    
    try {
      const conversationIndex = this.pinecone.index('automind-conversations');
      const queryEmbedding = await this.generateEmbedding(query);
      
      const filter = userId ? { type: 'conversation', userId } : { type: 'conversation' };
      
      const queryResponse = await conversationIndex.query({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
        filter
      });

      return queryResponse.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as unknown as VectorMetadata
      })) || [];
    } catch (error) {
      logger.error('Failed to search similar conversations:', error);
      throw new Error(`Failed to search similar conversations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search knowledge base
   */
  async searchKnowledge(query: string, category?: string, limit: number = 10): Promise<VectorSearchResult[]> {
    this.ensureInitialized();
    
    try {
      const knowledgeIndex = this.pinecone.index('automind-knowledge');
      const queryEmbedding = await this.generateEmbedding(query);
      
      const filter = category ? { type: 'knowledge', category } : { type: 'knowledge' };
      
      const queryResponse = await knowledgeIndex.query({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
        filter
      });

      return queryResponse.matches?.map(match => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata as unknown as VectorMetadata
      })) || [];
    } catch (error) {
      logger.error('Failed to search knowledge base:', error);
      throw new Error(`Failed to search knowledge base: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate text embedding (placeholder for now, would use OpenAI in production)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simple hash-based embedding for development
    // In production, replace with OpenAI embeddings
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    
    // Convert hash to numeric vector (1024 dimensions to match Pinecone index)
    const embedding = [];
    for (let i = 0; i < 1024; i++) {
      embedding.push(parseInt(hash.substr((i % 32) * 2, 2), 16) / 65535);
    }
    
    return embedding;
  }

  /**
   * Delete job embedding
   */
  async deleteJobEmbedding(jobId: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const jobIndex = this.pinecone.index('automind-jobs');
      await jobIndex.deleteOne(jobId);
      logger.info('Job embedding deleted', { jobId });
    } catch (error) {
      logger.error('Failed to delete job embedding:', error);
      throw new Error(`Failed to delete job embedding: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get vector service statistics
   */
  async getStats(): Promise<any> {
    this.ensureInitialized();
    
    try {
      const indexList = await this.pinecone.listIndexes();
      const stats: any = {};
      
      if (indexList.indexes) {
        for (const index of indexList.indexes) {
          const indexStats = await this.pinecone.index(index.name).describeIndexStats();
          stats[index.name] = {
            vectorCount: indexStats.dimension,
            dimension: indexStats.dimension,
            indexFullness: indexStats.indexFullness
          };
        }
      }
      
      return stats;
    } catch (error) {
      logger.error('Failed to get vector stats:', error);
      throw new Error(`Failed to get vector stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
