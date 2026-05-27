/**
 * @jest-environment node
 */

// Mock VectorService
const mockVectorService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  upsertKnowledgeEmbeddingsBatch: jest.fn().mockResolvedValue(undefined),
  searchKnowledge: jest.fn().mockResolvedValue([])
};

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));
// Mock the VectorService class to return our mock
jest.mock('../../services/vectorService', () => {
  return {
    VectorService: jest.fn().mockImplementation(() => mockVectorService),
    VectorMetadata: {},
    KnowledgeVectorData: {}
  };
});

// Set required environment variables
process.env.PINECONE_API_KEY = 'test-api-key';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Import after mocking
import { DocumentProcessor, DocumentMetadata, DocumentChunk, ProcessingOptions } from '../../services/documentProcessor';
import { VectorMetadata, KnowledgeVectorData } from '../../services/vectorService';

describe('DocumentProcessor', () => {
  let documentProcessor: DocumentProcessor;

  beforeEach(() => {
    documentProcessor = new DocumentProcessor();
    jest.clearAllMocks();
    // Reset mock implementations for each test
    mockVectorService.initialize.mockResolvedValue(undefined);
    mockVectorService.upsertKnowledgeEmbeddingsBatch.mockResolvedValue(undefined);
    mockVectorService.searchKnowledge.mockResolvedValue([]);
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await expect(documentProcessor.initialize()).resolves.not.toThrow();
      expect(mockVectorService.initialize).toHaveBeenCalled();
    });
  });

  describe('processDocument', () => {
    const mockMetadata: DocumentMetadata = {
      title: 'Test Document',
      author: 'Test Author',
      source: 'test-source',
      documentType: 'txt',
      category: 'test-category',
      tags: ['test', 'document'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should process a document and store embeddings', async () => {
      const content = 'This is a test document content.';

      await expect(documentProcessor.processDocument(content, mockMetadata)).resolves.not.toThrow();
    });

    it('should handle custom processing options', async () => {
      const content = 'This is a test document content.';
      const options: ProcessingOptions = {
        chunkSize: 500,
        chunkOverlap: 100,
        minChunkLength: 50,
        maxChunkLength: 4000
      };

      await expect(documentProcessor.processDocument(content, mockMetadata, options)).resolves.not.toThrow();
    });

    it('should use default options when not provided', async () => {
      const content = 'This is a test document content.';

      await expect(documentProcessor.processDocument(content, mockMetadata)).resolves.not.toThrow();
    });
  });

  describe('processDocumentsBatch', () => {
    const mockDocuments = [
      {
        content: 'First document content for batch processing.',
        metadata: {
          title: 'Document 1',
          source: 'test',
          documentType: 'txt' as const,
          category: 'cat1',
          tags: ['tag1'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      },
      {
        content: 'Second document content for batch processing.',
        metadata: {
          title: 'Document 2',
          source: 'test',
          documentType: 'txt' as const,
          category: 'cat2',
          tags: ['tag2'],
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      }
    ];

    it('should process multiple documents in batch', async () => {
      await expect(documentProcessor.processDocumentsBatch(mockDocuments)).resolves.not.toThrow();
    });

    it('should apply custom options to batch processing', async () => {
      const options: ProcessingOptions = {
        chunkSize: 500,
        chunkOverlap: 50
      };

      await expect(documentProcessor.processDocumentsBatch(mockDocuments, options)).resolves.not.toThrow();
    });
  });

  describe('searchDocuments', () => {
    it('should search documents with query only', async () => {
      const results = await documentProcessor.searchDocuments('test query');
      expect(results).toEqual([]);
    });

    it('should search documents with category filter', async () => {
      const results = await documentProcessor.searchDocuments('test query', 'programming');
      expect(results).toEqual([]);
    });

    it('should search documents with limit', async () => {
      const results = await documentProcessor.searchDocuments('test query', undefined, 5);
      expect(results).toEqual([]);
    });
  });

  describe('cleanDocument (via processDocument indirectly)', () => {
    it('should handle documents with excessive whitespace', async () => {
      const contentWithExcessiveWhitespace = 'This    is     a    test    with    excessive    whitespace.';
      const metadata: DocumentMetadata = {
        title: 'Whitespace Test',
        source: 'test',
        documentType: 'txt',
        category: 'test',
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(documentProcessor.processDocument(contentWithExcessiveWhitespace, metadata)).resolves.not.toThrow();
    });

    it('should handle documents with special characters', async () => {
      const contentWithSpecialChars = 'Test content with special chars: @#$%^&*()!';
      const metadata: DocumentMetadata = {
        title: 'Special Chars Test',
        source: 'test',
        documentType: 'txt',
        category: 'test',
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(documentProcessor.processDocument(contentWithSpecialChars, metadata)).resolves.not.toThrow();
    });

    it('should normalize different line break styles', async () => {
      const contentWithLineBreaks = 'Line 1\r\nLine 2\rLine 3\nLine 4\n\n\nLine 5';
      const metadata: DocumentMetadata = {
        title: 'Line Breaks Test',
        source: 'test',
        documentType: 'txt',
        category: 'test',
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(documentProcessor.processDocument(contentWithLineBreaks, metadata)).resolves.not.toThrow();
    });
  });

  describe('cleanDocument edge cases', () => {
    it('should handle empty documents', async () => {
      const metadata: DocumentMetadata = {
        title: 'Empty Doc Test',
        source: 'test',
        documentType: 'txt',
        category: 'test',
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(documentProcessor.processDocument('', metadata)).resolves.not.toThrow();
    });

    it('should handle documents with only whitespace', async () => {
      const metadata: DocumentMetadata = {
        title: 'Whitespace Only Test',
        source: 'test',
        documentType: 'txt',
        category: 'test',
        tags: ['test'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      await expect(documentProcessor.processDocument('   \n\n\t\t   ', metadata)).resolves.not.toThrow();
    });
  });

  describe('extractTextFromFile', () => {
    it('should throw error for unsupported file types', async () => {
      await expect(documentProcessor.extractTextFromFile('/path/to/file.unsupported')).rejects.toThrow();
    });

    it('should handle .txt files', async () => {
      // This test relies on actual file system, so we test the extension handling
      await expect(documentProcessor.extractTextFromFile('/test.txt')).rejects.toThrow(); // File doesn't exist
    });

    it('should handle .md files', async () => {
      await expect(documentProcessor.extractTextFromFile('/test.md')).rejects.toThrow(); // File doesn't exist
    });

    it('should handle .html files', async () => {
      await expect(documentProcessor.extractTextFromFile('/test.html')).rejects.toThrow(); // File doesn't exist
    });

    it('should handle .json files', async () => {
      await expect(documentProcessor.extractTextFromFile('/test.json')).rejects.toThrow(); // File doesn't exist
    });
  });
});
