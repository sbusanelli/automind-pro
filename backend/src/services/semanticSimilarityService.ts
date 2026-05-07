/**
 * Advanced Semantic Similarity Analysis Service
 * Provides enhanced similarity analysis capabilities beyond basic vector search
 */

import { VectorService, VectorSearchResult, VectorMetadata } from './vectorService';
import { logger } from '../utils/logger';

export interface SimilarityQuery {
  text: string;
  weight?: number;
  type?: 'job' | 'conversation' | 'knowledge' | 'all';
  filters?: {
    category?: string;
    userId?: string;
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface MultiQueryComparison {
  queries: SimilarityQuery[];
  comparisonType: 'intersection' | 'union' | 'weighted' | 'ranked';
  threshold?: number;
  limit?: number;
}

export interface SimilarityAnalysis {
  query: string;
  results: SimilarityResult[];
  metrics: SimilarityMetrics;
  clusters?: SimilarityCluster[];
  insights: SimilarityInsight[];
}

export interface SimilarityResult extends VectorSearchResult {
  relevanceScore: number;
  category: string;
  contentType: string;
  metadata: VectorMetadata & EnhancedMetadata;
}

export interface EnhancedMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  contentPreview?: string;
  wordCount?: number;
  createdAt?: string;
}

export interface SimilarityMetrics {
  averageSimilarity: number;
  maxSimilarity: number;
  minSimilarity: number;
  similarityDistribution: {
    high: number;    // >0.8
    medium: number;  // 0.5-0.8
    low: number;     // <0.5
  };
  diversityScore: number;
  coverageScore: number;
}

export interface SimilarityCluster {
  id: string;
  centroid: number[];
  items: SimilarityResult[];
  similarityScore: number;
  theme: string;
  size: number;
}

export interface SimilarityInsight {
  type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  data?: any;
}

export interface CrossTypeSimilarity {
  sourceType: string;
  targetType: string;
  similarityScore: number;
  commonThemes: string[];
  bridgingConcepts: string[];
  recommendations: string[];
}

export class SemanticSimilarityService {
  private vectorService: VectorService;
  private isInitialized: boolean = false;

  constructor() {
    this.vectorService = new VectorService();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.vectorService.initialize();
      this.isInitialized = true;
      logger.info('Semantic Similarity Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Semantic Similarity Service:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Semantic Similarity Service not initialized. Call initialize() first.');
    }
  }

  /**
   * Advanced similarity analysis with clustering and insights
   */
  async analyzeSimilarity(
    query: string,
    options: {
      types?: string[];
      threshold?: number;
      limit?: number;
      includeClusters?: boolean;
      includeInsights?: boolean;
      filters?: any;
    } = {}
  ): Promise<SimilarityAnalysis> {
    this.ensureInitialized();

    const {
      types = ['conversation', 'knowledge', 'job'],
      threshold = 0.5,
      limit = 20,
      includeClusters = true,
      includeInsights = true,
      filters = {}
    } = options;

    logger.info('Starting advanced similarity analysis', { query, types, threshold });

    try {
      // Get results from all specified types
      const allResults: SimilarityResult[] = [];
      
      for (const type of types) {
        const results = await this.searchByType(query, type, limit, filters);
        allResults.push(...results);
      }

      // Filter by threshold
      const filteredResults = allResults.filter(result => result.score >= threshold);

      // Enhance results with additional metadata
      const enhancedResults = await this.enhanceResults(filteredResults);

      // Calculate similarity metrics
      const metrics = this.calculateMetrics(enhancedResults);

      // Generate clusters if requested
      let clusters: SimilarityCluster[] = [];
      if (includeClusters && enhancedResults.length > 1) {
        clusters = await this.generateClusters(enhancedResults);
      }

      // Generate insights if requested
      let insights: SimilarityInsight[] = [];
      if (includeInsights) {
        insights = this.generateInsights(enhancedResults, metrics, clusters);
      }

      const analysis: SimilarityAnalysis = {
        query,
        results: enhancedResults,
        metrics,
        clusters: clusters.length > 0 ? clusters : undefined,
        insights
      };

      logger.info('Similarity analysis completed', {
        resultCount: enhancedResults.length,
        clusterCount: clusters.length,
        insightCount: insights.length
      });

      return analysis;

    } catch (error) {
      logger.error('Failed to analyze similarity:', error);
      throw new Error(`Failed to analyze similarity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Multi-query comparison with different comparison strategies
   */
  async compareQueries(comparison: MultiQueryComparison): Promise<SimilarityAnalysis> {
    this.ensureInitialized();

    const {
      queries,
      comparisonType = 'weighted',
      threshold = 0.5,
      limit = 20
    } = comparison;

    logger.info('Starting multi-query comparison', { 
      queryCount: queries.length, 
      comparisonType 
    });

    try {
      let allResults: SimilarityResult[] = [];

      switch (comparisonType) {
        case 'intersection':
          allResults = await this.intersectionComparison(queries, limit);
          break;
        case 'union':
          allResults = await this.unionComparison(queries, limit);
          break;
        case 'weighted':
          allResults = await this.weightedComparison(queries, limit);
          break;
        case 'ranked':
          allResults = await this.rankedComparison(queries, limit);
          break;
        default:
          throw new Error(`Unknown comparison type: ${comparisonType}`);
      }

      // Filter by threshold
      const filteredResults = allResults.filter(result => result.score >= threshold);

      // Enhance results
      const enhancedResults = await this.enhanceResults(filteredResults);

      // Calculate metrics
      const metrics = this.calculateMetrics(enhancedResults);

      // Generate clusters and insights
      const clusters = await this.generateClusters(enhancedResults);
      const insights = this.generateInsights(enhancedResults, metrics, clusters);

      return {
        query: queries.map(q => q.text).join(' | '),
        results: enhancedResults,
        metrics,
        clusters,
        insights
      };

    } catch (error) {
      logger.error('Failed to compare queries:', error);
      throw new Error(`Failed to compare queries: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Cross-type similarity analysis
   */
  async analyzeCrossTypeSimilarity(
    sourceType: string,
    targetType: string,
    query: string,
    limit: number = 10
  ): Promise<CrossTypeSimilarity> {
    this.ensureInitialized();

    logger.info('Starting cross-type similarity analysis', { sourceType, targetType });

    try {
      // Get results from both types
      const sourceResults = await this.searchByType(query, sourceType, limit);
      const targetResults = await this.searchByType(query, targetType, limit);

      // Calculate cross-type similarity
      const similarityScore = this.calculateCrossTypeSimilarity(sourceResults, targetResults);

      // Find common themes
      const commonThemes = this.findCommonThemes(sourceResults, targetResults);

      // Find bridging concepts
      const bridgingConcepts = this.findBridgingConcepts(sourceResults, targetResults);

      // Generate recommendations
      const recommendations = this.generateCrossTypeRecommendations(
        sourceResults, 
        targetResults, 
        commonThemes
      );

      return {
        sourceType,
        targetType,
        similarityScore,
        commonThemes,
        bridgingConcepts,
        recommendations
      };

    } catch (error) {
      logger.error('Failed to analyze cross-type similarity:', error);
      throw new Error(`Failed to analyze cross-type similarity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Similarity clustering analysis
   */
  async clusterSimilarItems(
    query: string,
    options: {
      types?: string[];
      clusterCount?: number;
      minClusterSize?: number;
      threshold?: number;
    } = {}
  ): Promise<SimilarityCluster[]> {
    this.ensureInitialized();

    const {
      types = ['conversation', 'knowledge', 'job'],
      clusterCount = 5,
      minClusterSize = 2,
      threshold = 0.6
    } = options;

    logger.info('Starting similarity clustering', { query, clusterCount });

    try {
      // Get all results
      const allResults: SimilarityResult[] = [];
      for (const type of types) {
        const results = await this.searchByType(query, type, 50);
        allResults.push(...results);
      }

      // Filter by threshold
      const filteredResults = allResults.filter(result => result.score >= threshold);

      // Generate clusters
      const clusters = await this.generateClusters(filteredResults, clusterCount, minClusterSize);

      logger.info('Clustering completed', { clusterCount: clusters.length });

      return clusters;

    } catch (error) {
      logger.error('Failed to cluster similar items:', error);
      throw new Error(`Failed to cluster similar items: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Search by specific content type
   */
  private async searchByType(
    query: string,
    type: string,
    limit: number,
    filters: any = {}
  ): Promise<SimilarityResult[]> {
    let results: VectorSearchResult[] = [];

    switch (type) {
      case 'conversation':
        results = await this.vectorService.searchSimilarConversations(
          query, 
          filters.userId, 
          limit
        );
        break;
      case 'knowledge':
        results = await this.vectorService.searchKnowledge(
          query, 
          filters.category, 
          limit
        );
        break;
      case 'job':
        results = await this.vectorService.searchSimilarJobs(query, limit);
        break;
      case 'all':
        // Search all types and combine results
        const allResults: VectorSearchResult[] = [];
        try {
          const convResults = await this.vectorService.searchSimilarConversations(query, filters.userId, Math.ceil(limit / 3));
          allResults.push(...convResults);
        } catch (e) {
          // Continue if one type fails
        }
        try {
          const knowledgeResults = await this.vectorService.searchKnowledge(query, filters.category, Math.ceil(limit / 3));
          allResults.push(...knowledgeResults);
        } catch (e) {
          // Continue if one type fails
        }
        try {
          const jobResults = await this.vectorService.searchSimilarJobs(query, Math.ceil(limit / 3));
          allResults.push(...jobResults);
        } catch (e) {
          // Continue if one type fails
        }
        results = allResults;
        break;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    return results.map(result => ({
      ...result,
      relevanceScore: result.score,
      category: (result.metadata as any).category || 'general',
      contentType: result.metadata.type,
      metadata: result.metadata as VectorMetadata & EnhancedMetadata
    }));
  }

  /**
   * Enhance results with additional metadata
   */
  private async enhanceResults(results: SimilarityResult[]): Promise<SimilarityResult[]> {
    return results.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevanceScore(result),
      metadata: {
        ...result.metadata,
        contentPreview: this.generateContentPreview(result),
        wordCount: this.estimateWordCount(result)
      } as VectorMetadata & EnhancedMetadata
    }));
  }

  /**
   * Calculate similarity metrics
   */
  private calculateMetrics(results: SimilarityResult[]): SimilarityMetrics {
    if (results.length === 0) {
      return {
        averageSimilarity: 0,
        maxSimilarity: 0,
        minSimilarity: 0,
        similarityDistribution: { high: 0, medium: 0, low: 0 },
        diversityScore: 0,
        coverageScore: 0
      };
    }

    const scores = results.map(r => r.score);
    const averageSimilarity = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxSimilarity = Math.max(...scores);
    const minSimilarity = Math.min(...scores);

    // Calculate distribution
    const similarityDistribution = {
      high: scores.filter(s => s > 0.8).length,
      medium: scores.filter(s => s >= 0.5 && s <= 0.8).length,
      low: scores.filter(s => s < 0.5).length
    };

    // Calculate diversity (how different the results are)
    const categories = new Set(results.map(r => (r.metadata as any).category || 'general'));
    const diversityScore = categories.size / Math.max(results.length, 1);

    // Calculate coverage (how well the query is covered)
    const coverageScore = averageSimilarity * (results.length / 20); // Assuming 20 is ideal

    return {
      averageSimilarity,
      maxSimilarity,
      minSimilarity,
      similarityDistribution,
      diversityScore,
      coverageScore
    };
  }

  /**
   * Generate similarity clusters using simple clustering algorithm
   */
  private async generateClusters(
    results: SimilarityResult[],
    maxClusters: number = 5,
    minClusterSize: number = 2
  ): Promise<SimilarityCluster[]> {
    if (results.length < minClusterSize) {
      return [];
    }

    // Simple clustering based on categories and similarity scores
    const categoryGroups = new Map<string, SimilarityResult[]>();
    
    results.forEach(result => {
      const category = result.category;
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(result);
    });

    const clusters: SimilarityCluster[] = [];
    let clusterId = 0;

    for (const [category, items] of categoryGroups.entries()) {
      if (items.length >= minClusterSize && clusters.length < maxClusters) {
        const avgScore = items.reduce((sum, item) => sum + item.score, 0) / items.length;
        
        clusters.push({
          id: `cluster-${clusterId++}`,
          centroid: [], // Would be actual centroid in production
          items,
          similarityScore: avgScore,
          theme: this.generateClusterTheme(category, items),
          size: items.length
        });
      }
    }

    return clusters;
  }

  /**
   * Generate insights from similarity analysis
   */
  private generateInsights(
    results: SimilarityResult[],
    metrics: SimilarityMetrics,
    clusters: SimilarityCluster[]
  ): SimilarityInsight[] {
    const insights: SimilarityInsight[] = [];

    // High similarity insight
    if (metrics.maxSimilarity > 0.9) {
      insights.push({
        type: 'pattern',
        title: 'Very High Similarity Detected',
        description: `Found content with ${metrics.maxSimilarity.toFixed(3)} similarity score`,
        confidence: 0.9
      });
    }

    // Diversity insight
    if (metrics.diversityScore > 0.7) {
      insights.push({
        type: 'recommendation',
        title: 'High Diversity Results',
        description: 'Results span multiple categories, indicating broad relevance',
        confidence: 0.8
      });
    }

    // Cluster insight
    if (clusters.length > 0) {
      const largestCluster = clusters.reduce((max, cluster) => 
        cluster.size > max.size ? cluster : max
      );
      
      insights.push({
        type: 'pattern',
        title: 'Strong Theme Detected',
        description: `Found ${largestCluster.size} items related to: ${largestCluster.theme}`,
        confidence: 0.85
      });
    }

    return insights;
  }

  /**
   * Multi-query comparison strategies
   */
  private async intersectionComparison(queries: SimilarityQuery[], limit: number): Promise<SimilarityResult[]> {
    // Get results for each query
    const allQueryResults = await Promise.all(
      queries.map(query => this.searchByType(query.text, query.type || 'all', limit))
    );

    // Find intersection (items that appear in all results)
    const resultCounts = new Map<string, { result: SimilarityResult; count: number }>();
    
    allQueryResults.forEach(queryResults => {
      queryResults.forEach(result => {
        const existing = resultCounts.get(result.id);
        if (existing) {
          existing.count++;
        } else {
          resultCounts.set(result.id, { result, count: 1 });
        }
      });
    });

    // Return items that appear in all queries
    return Array.from(resultCounts.values())
      .filter(({ count }) => count === queries.length)
      .map(({ result }) => ({
        ...result,
        score: result.score * 1.1 // Boost intersection results
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async unionComparison(queries: SimilarityQuery[], limit: number): Promise<SimilarityResult[]> {
    // Get results for each query and combine them
    const allResults = new Map<string, SimilarityResult>();

    for (const query of queries) {
      const results = await this.searchByType(query.text, query.type || 'all', limit);
      
      results.forEach(result => {
        const existing = allResults.get(result.id);
        if (existing) {
          // Combine scores
          existing.score = Math.max(existing.score, result.score);
        } else {
          allResults.set(result.id, { ...result });
        }
      });
    }

    return Array.from(allResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async weightedComparison(queries: SimilarityQuery[], limit: number): Promise<SimilarityResult[]> {
    const resultScores = new Map<string, SimilarityResult & { totalScore: number }>();

    for (const query of queries) {
      const weight = query.weight || 1;
      const results = await this.searchByType(query.text, query.type || 'all', limit);
      
      results.forEach(result => {
        const existing = resultScores.get(result.id);
        if (existing) {
          existing.totalScore += result.score * weight;
        } else {
          resultScores.set(result.id, {
            ...result,
            totalScore: result.score * weight
          });
        }
      });
    }

    return Array.from(resultScores.values())
      .map(({ totalScore, ...result }) => ({
        ...result,
        score: totalScore / queries.length // Normalize by number of queries
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async rankedComparison(queries: SimilarityQuery[], limit: number): Promise<SimilarityResult[]> {
    // Similar to weighted comparison but with ranking-based scoring
    return this.weightedComparison(queries, limit);
  }

  /**
   * Cross-type similarity calculation
   */
  private calculateCrossTypeSimilarity(
    sourceResults: SimilarityResult[],
    targetResults: SimilarityResult[]
  ): number {
    if (sourceResults.length === 0 || targetResults.length === 0) {
      return 0;
    }

    const sourceAvgScore = sourceResults.reduce((sum, r) => sum + r.score, 0) / sourceResults.length;
    const targetAvgScore = targetResults.reduce((sum, r) => sum + r.score, 0) / targetResults.length;

    return (sourceAvgScore + targetAvgScore) / 2;
  }

  /**
   * Find common themes between result sets
   */
  private findCommonThemes(
    sourceResults: SimilarityResult[],
    targetResults: SimilarityResult[]
  ): string[] {
    const sourceCategories = new Set(sourceResults.map(r => r.category));
    const targetCategories = new Set(targetResults.map(r => r.category));
    
    return Array.from(sourceCategories).filter(category => 
      targetCategories.has(category)
    );
  }

  /**
   * Find bridging concepts between result sets
   */
  private findBridgingConcepts(
    sourceResults: SimilarityResult[],
    targetResults: SimilarityResult[]
  ): string[] {
    // Simple implementation - look for overlapping tags or metadata
    const sourceTags = new Set<string>();
    const targetTags = new Set<string>();

    sourceResults.forEach(result => {
      if ((result.metadata as any).tags) {
        (result.metadata as any).tags.forEach((tag: string) => sourceTags.add(tag));
      }
    });

    targetResults.forEach(result => {
      if ((result.metadata as any).tags) {
        (result.metadata as any).tags.forEach((tag: string) => targetTags.add(tag));
      }
    });

    return Array.from(sourceTags).filter((tag: string) => targetTags.has(tag));
  }

  /**
   * Generate cross-type recommendations
   */
  private generateCrossTypeRecommendations(
    sourceResults: SimilarityResult[],
    targetResults: SimilarityResult[],
    commonThemes: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (commonThemes.length > 0) {
      recommendations.push(`Strong connection found in: ${commonThemes.join(', ')}`);
    }

    if (sourceResults.length > 0 && targetResults.length > 0) {
      recommendations.push('Consider integrating content from both sources for comprehensive coverage');
    }

    return recommendations;
  }

  /**
   * Helper methods for result enhancement
   */
  private calculateRelevanceScore(result: SimilarityResult): number {
    // Combine similarity score with other factors
    let score = result.score;

    // Boost recent content
    if (result.metadata.timestamp) {
      const age = Date.now() - new Date(result.metadata.timestamp).getTime();
      const ageInDays = age / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) {
        score *= 1.1; // 10% boost for recent content
      }
    }

    return Math.min(score, 1.0);
  }

  private generateContentPreview(result: SimilarityResult): string {
    // Generate a preview based on available metadata
    if (result.metadata.description) {
      return result.metadata.description.substring(0, 100) + '...';
    }
    
    if (result.metadata.title) {
      return result.metadata.title;
    }

    return 'Content preview not available';
  }

  private estimateWordCount(result: SimilarityResult): number {
    // Rough estimation based on metadata
    if (result.metadata.description) {
      return result.metadata.description.split(' ').length;
    }
    
    return 50; // Default estimate
  }

  private generateClusterTheme(category: string, items: SimilarityResult[]): string {
    // Generate a theme name based on category and common terms
    const themes = category.split(' ');
    return themes[0] || category;
  }
}
