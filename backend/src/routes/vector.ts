import { Router } from 'express';
import { logger } from '../utils/logger';
import { VectorService } from '../services/vectorService';

const router = Router();

// Initialize vector service
const vectorService = new VectorService();

// Initialize the vector service asynchronously
let vectorServiceInitialized = false;
const initializeVectorService = async () => {
  if (!vectorServiceInitialized) {
    try {
      await vectorService.initialize();
      vectorServiceInitialized = true;
      logger.info('Vector service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize vector service:', error);
      throw error;
    }
  }
};

/**
 * Store job embedding for semantic search
 */
router.post('/jobs/:jobId/embed', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, description, requirements, schedule, status } = req.body;
    
    logger.info(`Creating embedding for job: ${jobId}`);
    
    const jobData = {
      id: jobId,
      name,
      description,
      requirements: requirements || [],
      schedule,
      status: status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await initializeVectorService();
    await vectorService.upsertJobEmbedding(jobData);
    
    res.json({
      message: 'Job embedding created successfully',
      jobId
    });
  } catch (error) {
    logger.error('Failed to create job embedding:', error);
    res.status(500).json({ error: 'Failed to create job embedding' });
  }
});

/**
 * Search for similar jobs
 */
router.post('/jobs/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    logger.info(`Searching similar jobs for query: ${query}`);
    
    await initializeVectorService();
    const similarJobs = await vectorService.searchSimilarJobs(query, limit);
    
    res.json({
      query,
      results: similarJobs,
      count: similarJobs.length
    });
  } catch (error) {
    logger.error('Failed to search similar jobs:', error);
    res.status(500).json({ error: 'Failed to search similar jobs' });
  }
});

/**
 * Store conversation embedding
 */
router.post('/conversations/:conversationId/embed', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, content, role } = req.body;
    
    logger.info(`Creating embedding for conversation: ${conversationId}`);
    
    const conversationData = {
      id: conversationId,
      userId,
      content,
      role: role || 'user',
      timestamp: new Date().toISOString()
    };
    
    await initializeVectorService();
    await vectorService.upsertConversationEmbedding(conversationData);
    
    res.json({
      message: 'Conversation embedding created successfully',
      conversationId
    });
  } catch (error) {
    logger.error('Failed to create conversation embedding:', error);
    res.status(500).json({ error: 'Failed to create conversation embedding' });
  }
});

/**
 * Search similar conversations
 */
router.post('/conversations/search', async (req, res) => {
  try {
    const { query, userId, limit = 10 } = req.body;
    
    logger.info(`Searching similar conversations for query: ${query}`);
    
    await initializeVectorService();
    const similarConversations = await vectorService.searchSimilarConversations(query, userId, limit);
    
    res.json({
      query,
      userId,
      results: similarConversations,
      count: similarConversations.length
    });
  } catch (error) {
    logger.error('Failed to search similar conversations:', error);
    res.status(500).json({ error: 'Failed to search similar conversations' });
  }
});

/**
 * Store knowledge base embedding
 */
router.post('/knowledge/:knowledgeId/embed', async (req, res) => {
  try {
    const { knowledgeId } = req.params;
    const { title, content, category, tags } = req.body;
    
    logger.info(`Creating embedding for knowledge: ${knowledgeId}`);
    
    const knowledgeData = {
      id: knowledgeId,
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await initializeVectorService();
    await vectorService.upsertKnowledgeEmbedding(knowledgeData);
    
    res.json({
      message: 'Knowledge embedding created successfully',
      knowledgeId
    });
  } catch (error) {
    logger.error('Failed to create knowledge embedding:', error);
    res.status(500).json({ error: 'Failed to create knowledge embedding' });
  }
});

/**
 * Search knowledge base
 */
router.post('/knowledge/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.body;
    
    logger.info(`Searching knowledge base for query: ${query}`);
    
    await initializeVectorService();
    const knowledgeResults = await vectorService.searchKnowledge(query, category, limit);
    
    res.json({
      query,
      category,
      results: knowledgeResults,
      count: knowledgeResults.length
    });
  } catch (error) {
    logger.error('Failed to search knowledge base:', error);
    res.status(500).json({ error: 'Failed to search knowledge base' });
  }
});

/**
 * Delete job embedding
 */
router.delete('/jobs/:jobId/embed', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    logger.info(`Deleting embedding for job: ${jobId}`);
    
    await vectorService.deleteJobEmbedding(jobId);
    
    res.json({
      message: 'Job embedding deleted successfully',
      jobId
    });
  } catch (error) {
    logger.error('Failed to delete job embedding:', error);
    res.status(500).json({ error: 'Failed to delete job embedding' });
  }
});

/**
 * Get vector service statistics
 */
router.get('/stats', async (req, res) => {
  try {
    logger.info('Getting vector service statistics');
    
    await initializeVectorService();
    const stats = await vectorService.getStats();
    
    res.json({
      message: 'Vector service statistics retrieved successfully',
      stats
    });
  } catch (error) {
    logger.error('Failed to get vector stats:', error);
    res.status(500).json({ error: 'Failed to get vector stats' });
  }
});

export default router;
