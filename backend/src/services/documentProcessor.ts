/**
 * Document Processor for converting documents to knowledge embeddings
 * Supports various document formats and chunking strategies
 */

import { VectorService, KnowledgeVectorData } from './vectorService';
import { logger } from '../utils/logger';

export interface DocumentMetadata {
  title: string;
  author?: string;
  source: string;
  documentType: 'pdf' | 'txt' | 'md' | 'html' | 'docx' | 'json';
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
  metadata: DocumentMetadata;
}

export interface ProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  minChunkLength?: number;
  maxChunkLength?: number;
  category?: string;
  tags?: string[];
}

export class DocumentProcessor {
  private vectorService: VectorService;

  constructor() {
    this.vectorService = new VectorService();
  }

  /**
   * Initialize the document processor
   */
  async initialize(): Promise<void> {
    await this.vectorService.initialize();
    logger.info('DocumentProcessor initialized successfully');
  }

  /**
   * Process a document and convert to knowledge embeddings
   */
  async processDocument(
    documentContent: string,
    metadata: DocumentMetadata,
    options: ProcessingOptions = {}
  ): Promise<void> {
    const {
      chunkSize = 1000,
      chunkOverlap = 200,
      minChunkLength = 100,
      maxChunkLength = 8000,
      category = metadata.category,
      tags = metadata.tags
    } = options;

    logger.info('Processing document', {
      title: metadata.title,
      documentType: metadata.documentType,
      contentLength: documentContent.length
    });

    // Clean and preprocess the document
    const cleanedContent = this.cleanDocument(documentContent);
    
    // Split document into chunks
    const chunks = this.chunkDocument(cleanedContent, chunkSize, chunkOverlap, minChunkLength, maxChunkLength);
    
    logger.info('Document chunked', {
      totalChunks: chunks.length,
      chunkSize,
      chunkOverlap
    });

    // Convert chunks to knowledge data
    const knowledgeData = chunks.map((chunk, index) => ({
      id: `${this.generateDocumentId(metadata.title)}-chunk-${index + 1}`,
      title: `${metadata.title} - Part ${index + 1}/${chunks.length}`,
      content: chunk.content,
      category,
      tags: [...tags, `chunk-${index + 1}`, metadata.documentType],
      created_at: metadata.created_at,
      updated_at: new Date().toISOString()
    }));

    // Store in batch
    await this.vectorService.upsertKnowledgeEmbeddingsBatch(knowledgeData);
    
    logger.info('Document processed successfully', {
      title: metadata.title,
      chunksStored: chunks.length,
      knowledgeItems: knowledgeData.length
    });
  }

  /**
   * Process multiple documents in batch
   */
  async processDocumentsBatch(
    documents: Array<{ content: string; metadata: DocumentMetadata }>,
    options: ProcessingOptions = {}
  ): Promise<void> {
    logger.info(`Processing ${documents.length} documents in batch`);

    const allKnowledgeData: KnowledgeVectorData[] = [];

    for (const doc of documents) {
      const chunks = this.chunkDocument(
        this.cleanDocument(doc.content),
        options.chunkSize || 1000,
        options.chunkOverlap || 200,
        options.minChunkLength || 100,
        options.maxChunkLength || 8000
      );

      const knowledgeData = chunks.map((chunk, index) => ({
        id: `${this.generateDocumentId(doc.metadata.title)}-chunk-${index + 1}`,
        title: `${doc.metadata.title} - Part ${index + 1}/${chunks.length}`,
        content: chunk.content,
        category: options.category || doc.metadata.category,
        tags: [...(options.tags || doc.metadata.tags), `chunk-${index + 1}`, doc.metadata.documentType],
        created_at: doc.metadata.created_at,
        updated_at: new Date().toISOString()
      }));

      allKnowledgeData.push(...knowledgeData);
    }

    await this.vectorService.upsertKnowledgeEmbeddingsBatch(allKnowledgeData);
    
    logger.info('Batch document processing completed', {
      documentsProcessed: documents.length,
      totalChunks: allKnowledgeData.length
    });
  }

  /**
   * Search for relevant document chunks
   */
  async searchDocuments(query: string, category?: string, limit: number = 10): Promise<any[]> {
    return await this.vectorService.searchKnowledge(query, category, limit);
  }

  /**
   * Clean and preprocess document content
   */
  private cleanDocument(content: string): string {
    return content
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters but keep basic punctuation
      .replace(/[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/\\]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Split document into chunks using semantic chunking
   */
  private chunkDocument(
    content: string,
    chunkSize: number,
    overlap: number,
    minLength: number,
    maxLength: number
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    
    // If content is short enough, return as single chunk
    if (content.length <= maxLength) {
      return [{
        id: 'chunk-1',
        content,
        chunkIndex: 0,
        totalChunks: 1,
        metadata: {} as DocumentMetadata
      }];
    }

    // Split by paragraphs first
    const paragraphs = content.split(/\n\n+/);
    let currentChunk = '';
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      
      if (!trimmedParagraph) continue;

      // If adding this paragraph would exceed max length, start new chunk
      if (currentChunk && (currentChunk.length + trimmedParagraph.length + 2) > maxLength) {
        if (currentChunk.length >= minLength) {
          chunks.push({
            id: `chunk-${chunkIndex + 1}`,
            content: currentChunk.trim(),
            chunkIndex,
            totalChunks: 0, // Will be updated later
            metadata: {} as DocumentMetadata
          });
          chunkIndex++;
        }
        currentChunk = trimmedParagraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedParagraph;
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.length >= minLength) {
      chunks.push({
        id: `chunk-${chunkIndex + 1}`,
        content: currentChunk.trim(),
        chunkIndex,
        totalChunks: 0, // Will be updated later
        metadata: {} as DocumentMetadata
      });
    }

    // Update total chunks count
    chunks.forEach(chunk => {
      chunk.totalChunks = chunks.length;
    });

    // Apply overlapping if needed
    if (overlap > 0 && chunks.length > 1) {
      return this.applyOverlap(chunks, overlap);
    }

    return chunks;
  }

  /**
   * Apply overlapping between chunks
   */
  private applyOverlap(chunks: DocumentChunk[], overlap: number): DocumentChunk[] {
    const overlappedChunks: DocumentChunk[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let content = chunk.content;

      // Add overlap from previous chunk
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const prevContent = prevChunk.content;
        const overlapText = prevContent.slice(-overlap);
        content = overlapText + '\n\n' + content;
      }

      overlappedChunks.push({
        ...chunk,
        content
      });
    }

    return overlappedChunks;
  }

  /**
   * Generate document ID from title
   */
  private generateDocumentId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

  /**
   * Extract text from different document formats (placeholder implementations)
   */
  async extractTextFromFile(filePath: string): Promise<string> {
    const fs = require('fs').promises;
    const path = require('path');
    const ext = path.extname(filePath).toLowerCase();

    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      switch (ext) {
        case '.txt':
          return content;
        case '.md':
          return this.extractMarkdown(content);
        case '.html':
          return this.extractHTML(content);
        case '.json':
          return this.extractJSON(content);
        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      logger.error('Failed to extract text from file', { filePath, error });
      throw error;
    }
  }

  /**
   * Extract text from markdown
   */
  private extractMarkdown(content: string): string {
    // Remove markdown syntax
    return content
      .replace(/^#{1,6}\s/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Remove images
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s/gm, '') // Remove numbered list markers
      .trim();
  }

  /**
   * Extract text from HTML
   */
  private extractHTML(content: string): string {
    // Simple HTML tag removal (for production, use a proper HTML parser)
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract text from JSON
   */
  private extractJSON(content: string): string {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch (error) {
      return content; // Return as-is if not valid JSON
    }
  }
}
