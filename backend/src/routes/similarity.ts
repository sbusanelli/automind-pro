/**
 * Advanced Semantic Similarity API Routes
 * Provides enhanced similarity analysis capabilities
 */

import { Router } from 'express';
import { logger } from '../utils/logger';
import { SemanticSimilarityService } from '../services/semanticSimilarityService';

const router = Router();

// Initialize semantic similarity service
const similarityService = new SemanticSimilarityService();

// Initialize the service asynchronously
let serviceInitialized = false;
const initializeService = async () => {
  if (!serviceInitialized) {
    try {
      await similarityService.initialize();
      serviceInitialized = true;
      logger.info('Semantic Similarity Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Semantic Similarity Service:', error);
      throw error;
    }
  }
};

/**
 * Advanced similarity analysis with clustering and insights
 */
router.post('/analyze', async (req, res) => {
  try {
    const { query, types, threshold, limit, includeClusters, includeInsights, filters } = req.body;
    
    logger.info(`Starting advanced similarity analysis for query: ${query}`);
    
    await initializeService();
    const analysis = await similarityService.analyzeSimilarity(query, {
      types,
      threshold,
      limit,
      includeClusters,
      includeInsights,
      filters
    });
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error('Failed to analyze similarity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze similarity' 
    });
  }
});

/**
 * Multi-query comparison with different comparison strategies
 */
router.post('/compare', async (req, res) => {
  try {
    const { queries, comparisonType, threshold, limit } = req.body;
    
    logger.info(`Starting multi-query comparison with ${queries?.length || 0} queries`);
    
    await initializeService();
    const comparison = await similarityService.compareQueries({
      queries,
      comparisonType,
      threshold,
      limit
    });
    
    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    logger.error('Failed to compare queries:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to compare queries' 
    });
  }
});

/**
 * Cross-type similarity analysis
 */
router.post('/cross-type', async (req, res) => {
  try {
    const { sourceType, targetType, query, limit } = req.body;
    
    logger.info(`Starting cross-type similarity analysis: ${sourceType} -> ${targetType}`);
    
    await initializeService();
    const crossType = await similarityService.analyzeCrossTypeSimilarity(
      sourceType,
      targetType,
      query,
      limit
    );
    
    res.json({
      success: true,
      crossType
    });
  } catch (error) {
    logger.error('Failed to analyze cross-type similarity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze cross-type similarity' 
    });
  }
});

/**
 * Similarity clustering analysis
 */
router.post('/cluster', async (req, res) => {
  try {
    const { query, types, clusterCount, minClusterSize, threshold } = req.body;
    
    logger.info(`Starting similarity clustering for query: ${query}`);
    
    await initializeService();
    const clusters = await similarityService.clusterSimilarItems(query, {
      types,
      clusterCount,
      minClusterSize,
      threshold
    });
    
    res.json({
      success: true,
      clusters,
      clusterCount: clusters.length
    });
  } catch (error) {
    logger.error('Failed to cluster similar items:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to cluster similar items' 
    });
  }
});

/**
 * Quick similarity search (enhanced version of basic search)
 */
router.post('/search', async (req, res) => {
  try {
    const { query, type, limit, threshold, includeMetadata } = req.body;
    
    logger.info(`Quick similarity search: ${query} (${type})`);
    
    await initializeService();
    const analysis = await similarityService.analyzeSimilarity(query, {
      types: type ? [type] : ['conversation', 'knowledge', 'job'],
      threshold: threshold || 0.5,
      limit: limit || 10,
      includeClusters: false,
      includeInsights: false
    });
    
    res.json({
      success: true,
      query,
      type,
      results: analysis.results,
      metrics: analysis.metrics,
      count: analysis.results.length
    });
  } catch (error) {
    logger.error('Failed to perform quick similarity search:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform similarity search' 
    });
  }
});

/**
 * Get similarity insights and analytics
 */
router.post('/insights', async (req, res) => {
  try {
    const { query, types, limit } = req.body;
    
    logger.info(`Generating similarity insights for: ${query}`);
    
    await initializeService();
    const analysis = await similarityService.analyzeSimilarity(query, {
      types,
      limit: limit || 20,
      includeClusters: true,
      includeInsights: true
    });
    
    res.json({
      success: true,
      query,
      insights: analysis.insights,
      clusters: analysis.clusters,
      metrics: analysis.metrics
    });
  } catch (error) {
    logger.error('Failed to generate similarity insights:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate similarity insights' 
    });
  }
});

/**
 * Batch similarity analysis for multiple queries
 */
router.post('/batch', async (req, res) => {
  try {
    const { queries, options } = req.body;
    
    logger.info(`Starting batch similarity analysis for ${queries?.length || 0} queries`);
    
    await initializeService();
    
    const results = [];
    for (const query of queries) {
      try {
        const analysis = await similarityService.analyzeSimilarity(query.text, options);
        results.push({
          query: query.text,
          success: true,
          analysis
        });
      } catch (error) {
        results.push({
          query: query.text,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    res.json({
      success: true,
      results,
      processed: results.length,
      successful: results.filter(r => r.success).length
    });
  } catch (error) {
    logger.error('Failed to perform batch similarity analysis:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to perform batch similarity analysis' 
    });
  }
});

export default router;
