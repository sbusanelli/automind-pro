/**
 * Knowledge Synchronization Service
 * Handles change detection and offline batch processing for knowledge documents
 */

import { DocumentProcessor, DocumentMetadata } from './documentProcessor';
import { VectorService } from './vectorService';
import { logger } from '../utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

interface DocumentInfo {
  path: string;
  metadata: DocumentMetadata;
  lastModified: Date;
  size: number;
  hash: string;
  processedAt?: Date;
  version: number;
}

interface SyncConfig {
  knowledgeDir: string;
  watchInterval: number;
  batchSize: number;
  enableChangeDetection: boolean;
  enableAutoSync: boolean;
  excludedPatterns: string[];
}

interface ChangeDetectionResult {
  added: DocumentInfo[];
  modified: DocumentInfo[];
  deleted: DocumentInfo[];
  unchanged: DocumentInfo[];
}

export class KnowledgeSyncService {
  private documentProcessor: DocumentProcessor;
  private vectorService: VectorService;
  private config: SyncConfig;
  private documentRegistry: Map<string, DocumentInfo> = new Map();
  private isWatching = false;
  private watchTimer?: NodeJS.Timeout;

  constructor(config: Partial<SyncConfig> = {}) {
    this.documentProcessor = new DocumentProcessor();
    this.vectorService = new VectorService();
    
    this.config = {
      knowledgeDir: path.join(process.cwd(), 'knowledge-docs'),
      watchInterval: 60000, // 1 minute
      batchSize: 50,
      enableChangeDetection: true,
      enableAutoSync: true,
      excludedPatterns: ['*.tmp', '*.bak', '.DS_Store', 'node_modules'],
      ...config
    };
  }

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Knowledge Sync Service', this.config);
    
    await this.documentProcessor.initialize();
    await this.vectorService.initialize();
    
    // Load existing document registry
    await this.loadDocumentRegistry();
    
    // Initial scan
    await this.scanKnowledgeDirectory();
    
    // Start watching if enabled
    if (this.config.enableAutoSync) {
      this.startWatching();
    }
    
    logger.info('Knowledge Sync Service initialized successfully');
  }

  /**
   * Start watching for changes
   */
  startWatching(): void {
    if (this.isWatching) {
      logger.warn('Knowledge sync service is already watching');
      return;
    }
    
    this.isWatching = true;
    this.watchTimer = setInterval(async () => {
      try {
        await this.syncChanges();
      } catch (error) {
        logger.error('Error during sync cycle', error);
      }
    }, this.config.watchInterval);
    
    logger.info('Started watching knowledge directory', {
      interval: this.config.watchInterval
    });
  }

  /**
   * Stop watching for changes
   */
  stopWatching(): void {
    if (!this.isWatching) {
      return;
    }
    
    this.isWatching = false;
    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = undefined;
    }
    
    logger.info('Stopped watching knowledge directory');
  }

  /**
   * Force sync all changes
   */
  async syncChanges(): Promise<ChangeDetectionResult> {
    logger.info('Starting sync cycle');
    
    const changes = await this.detectChanges();
    
    if (changes.added.length === 0 && changes.modified.length === 0 && changes.deleted.length === 0) {
      logger.info('No changes detected');
      return changes;
    }
    
    // Process deletions
    if (changes.deleted.length > 0) {
      await this.processDeletions(changes.deleted);
    }
    
    // Process additions and modifications
    const toProcess = [...changes.added, ...changes.modified];
    if (toProcess.length > 0) {
      await this.processDocuments(toProcess);
    }
    
    // Save updated registry
    await this.saveDocumentRegistry();
    
    logger.info('Sync cycle completed', {
      added: changes.added.length,
      modified: changes.modified.length,
      deleted: changes.deleted.length
    });
    
    return changes;
  }

  /**
   * Detect changes in knowledge directory
   */
  private async detectChanges(): Promise<ChangeDetectionResult> {
    const currentFiles = await this.scanFiles();
    const currentRegistry = new Map(
      Array.from(this.documentRegistry.entries()).map(([path, info]) => [
        path, info
      ])
    );
    
    const result: ChangeDetectionResult = {
      added: [],
      modified: [],
      deleted: [],
      unchanged: []
    };
    
    // Check for new and modified files
    for (const fileInfo of currentFiles) {
      const existing = currentRegistry.get(fileInfo.path);
      
      if (!existing) {
        result.added.push(fileInfo);
      } else if (this.hasFileChanged(existing, fileInfo)) {
        result.modified.push(fileInfo);
      } else if (!existing.processedAt) {
        // File exists in registry but hasn't been processed yet
        result.added.push(fileInfo);
      } else {
        result.unchanged.push(fileInfo);
      }
      
      currentRegistry.delete(fileInfo.path);
    }
    
    // Remaining files in registry are deleted
    result.deleted = Array.from(currentRegistry.values());
    
    return result;
  }

  /**
   * Process document deletions
   */
  private async processDeletions(deleted: DocumentInfo[]): Promise<void> {
    logger.info('Processing document deletions', { count: deleted.length });
    
    for (const doc of deleted) {
      try {
        // Delete all chunks associated with this document
        const chunkIds = await this.getDocumentChunkIds(doc.metadata.title);
        
        if (chunkIds.length > 0) {
          // Delete vectors one by one since batch delete isn't available
          for (const chunkId of chunkIds) {
            await this.vectorService.deleteJobEmbedding(chunkId);
          }
          logger.info('Deleted document chunks', { 
            documentTitle: doc.metadata.title,
            chunkCount: chunkIds.length
          });
        }
        
        // Remove from registry
        this.documentRegistry.delete(doc.path);
        
      } catch (error) {
        logger.error('Failed to delete document', {
          documentPath: doc.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Process documents (additions and modifications)
   */
  private async processDocuments(documents: DocumentInfo[]): Promise<void> {
    logger.info('Processing documents', { count: documents.length });
    
    // Process in batches
    for (let i = 0; i < documents.length; i += this.config.batchSize) {
      const batch = documents.slice(i, i + this.config.batchSize);
      
      await this.processBatch(batch);
      
      logger.info(`Processed batch ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(documents.length / this.config.batchSize)}`);
    }
  }

  /**
   * Process a batch of documents
   */
  private async processBatch(documents: DocumentInfo[]): Promise<void> {
    const processedDocuments = [];
    
    for (const doc of documents) {
      try {
        // Read document content
        const content = await fs.readFile(doc.path, 'utf8');
        
        // Update document info
        doc.processedAt = new Date();
        doc.version += 1;
        
        // Update registry
        this.documentRegistry.set(doc.path, doc);
        
        processedDocuments.push({
          content,
          metadata: doc.metadata
        });
        
      } catch (error) {
        logger.error('Failed to process document', {
          documentPath: doc.path,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Process documents with document processor
    if (processedDocuments.length > 0) {
      await this.documentProcessor.processDocumentsBatch(processedDocuments);
    }
  }

  /**
   * Scan knowledge directory for files recursively
   */
  private async scanFiles(): Promise<DocumentInfo[]> {
    const files: DocumentInfo[] = [];
    
    try {
      await this.scanDirectoryRecursive(this.config.knowledgeDir, files);
    } catch (error) {
      logger.error('Failed to scan knowledge directory', error);
    }
    
    return files;
  }

  /**
   * Recursively scan directory for files
   */
  private async scanDirectoryRecursive(dirPath: string, files: DocumentInfo[]): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectory
          await this.scanDirectoryRecursive(fullPath, files);
        } else if (entry.isFile()) {
          // Skip excluded patterns
          if (this.isExcluded(fullPath)) {
            continue;
          }
          
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, 'utf8');
          const hash = this.calculateHash(content);
          const metadata = this.extractMetadata(fullPath, content);
          
          files.push({
            path: fullPath,
            metadata,
            lastModified: stats.mtime,
            size: stats.size,
            hash,
            version: 1
          });
        }
      }
    } catch (error) {
      logger.error(`Failed to scan directory: ${dirPath}`, error);
    }
  }

  /**
   * Extract metadata from file path and content
   */
  private extractMetadata(filePath: string, content: string): DocumentMetadata {
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath).toLowerCase().slice(1);
    const relativePath = path.relative(this.config.knowledgeDir, filePath);
    const category = this.getCategoryFromPath(relativePath);
    
    // Try to extract title from content
    let title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // Extract tags from content
    const tags: string[] = [category, fileExt];
    const tagMatch = content.match(/tags?:\s*(.+)/i);
    if (tagMatch) {
      tags.push(...tagMatch[1].split(/[,;]/).map(tag => tag.trim()));
    }
    
    return {
      title,
      source: relativePath,
      documentType: fileExt as any,
      category,
      tags: tags.filter(tag => tag.length > 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Get category from file path
   */
  private getCategoryFromPath(relativePath: string): string {
    const parts = relativePath.split(path.sep);
    return parts.length > 1 ? parts[0] : 'general';
  }

  /**
   * Check if file should be excluded
   */
  private isExcluded(filePath: string): boolean {
    return this.config.excludedPatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path.basename(filePath));
    });
  }

  /**
   * Calculate file hash
   */
  private calculateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Check if file has changed
   */
  private hasFileChanged(existing: DocumentInfo, current: DocumentInfo): boolean {
    return existing.hash !== current.hash ||
           existing.lastModified.getTime() !== current.lastModified.getTime() ||
           existing.size !== current.size;
  }

  /**
   * Get chunk IDs for a document
   */
  private async getDocumentChunkIds(documentTitle: string): Promise<string[]> {
    try {
      // Search for all chunks of this document
      const results = await this.vectorService.searchKnowledge(
        documentTitle,
        undefined,
        100 // Get up to 100 results
      );
      
      return results
        .filter(result => (result.metadata as any).title?.includes(documentTitle))
        .map(result => result.id);
        
    } catch (error) {
      logger.error('Failed to get document chunk IDs', error);
      return [];
    }
  }

  /**
   * Scan knowledge directory and initialize registry
   */
  private async scanKnowledgeDirectory(): Promise<void> {
    logger.info('Scanning knowledge directory');
    
    const files = await this.scanFiles();
    
    // Initialize registry with all files
    for (const file of files) {
      this.documentRegistry.set(file.path, file);
    }
    
    logger.info('Knowledge directory scanned', {
      totalFiles: files.length,
      categories: [...new Set(files.map(f => f.metadata.category))]
    });
  }

  /**
   * Load document registry from disk
   */
  private async loadDocumentRegistry(): Promise<void> {
    const registryPath = path.join(this.config.knowledgeDir, '.registry.json');
    
    try {
      const data = await fs.readFile(registryPath, 'utf8');
      const registry = JSON.parse(data);
      
      this.documentRegistry = new Map(
        Object.entries(registry).map(([path, info]: [string, any]) => [
          path,
          {
            ...info,
            lastModified: new Date(info.lastModified),
            processedAt: info.processedAt ? new Date(info.processedAt) : undefined
          }
        ])
      );
      
      logger.info('Document registry loaded', { entries: this.documentRegistry.size });
      
    } catch (error) {
      logger.info('No existing document registry found, starting fresh');
    }
  }

  /**
   * Save document registry to disk
   */
  private async saveDocumentRegistry(): Promise<void> {
    const registryPath = path.join(this.config.knowledgeDir, '.registry.json');
    
    try {
      const registry = Object.fromEntries(
        Array.from(this.documentRegistry.entries()).map(([path, info]) => [
          path,
          info
        ])
      );
      
      await fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      
      logger.debug('Document registry saved');
      
    } catch (error) {
      logger.error('Failed to save document registry', error);
    }
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<{
    totalDocuments: number;
    processedDocuments: number;
    categories: Record<string, number>;
    lastSyncTime?: Date;
  }> {
    const categories: Record<string, number> = {};
    
    for (const doc of this.documentRegistry.values()) {
      categories[doc.metadata.category] = (categories[doc.metadata.category] || 0) + 1;
    }
    
    const processedCount = Array.from(this.documentRegistry.values())
      .filter(doc => doc.processedAt).length;
    
    return {
      totalDocuments: this.documentRegistry.size,
      processedDocuments: processedCount,
      categories,
      lastSyncTime: this.getLastSyncTime()
    };
  }

  /**
   * Get last sync time
   */
  private getLastSyncTime(): Date | undefined {
    const times = Array.from(this.documentRegistry.values())
      .filter(doc => doc.processedAt)
      .map(doc => doc.processedAt!);
    
    return times.length > 0 ? new Date(Math.max(...times.map(t => t.getTime()))) : undefined;
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    this.stopWatching();
    await this.saveDocumentRegistry();
    logger.info('Knowledge Sync Service shut down');
  }
}
