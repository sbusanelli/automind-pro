# Node.js Patterns for AutoMind

## Overview
This guide covers Node.js patterns and best practices for building scalable AutoMind components.

## Async Patterns

### Promise-based Architecture
Use Promise-based patterns for AutoMind's asynchronous operations:

```typescript
interface AsyncOperation<T> {
  execute(): Promise<T>;
  cancel(): void;
}

class JobExecution implements AsyncOperation<JobResult> {
  private cancelled = false;
  
  constructor(private job: AutoMindJob) {}
  
  async execute(): Promise<JobResult> {
    if (this.cancelled) {
      throw new Error('Operation cancelled');
    }
    
    try {
      return await this.processJob();
    } catch (error) {
      logger.error('Job execution failed', { jobId: this.job.id, error });
      throw error;
    }
  }
  
  cancel(): void {
    this.cancelled = true;
  }
}
```

### Stream Processing
Implement stream processing for large datasets in AutoMind:

```typescript
import { Readable, Transform, Writable } from 'stream';

class VectorEmbeddingStream extends Transform {
  constructor(private vectorService: VectorService) {
    super({ objectMode: true });
  }
  
  async _transform(
    chunk: { text: string; metadata: any },
    encoding: string,
    callback: Function
  ): Promise<void> {
    try {
      const embedding = await this.vectorService.generateEmbedding(chunk.text);
      this.push({ ...chunk, embedding });
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

// Usage
const documentStream = Readable.from(documents);
const embeddingStream = new VectorEmbeddingStream(vectorService);

documentStream
  .pipe(embeddingStream)
  .pipe(process.stdout);
```

## Error Handling

### Centralized Error Handling
Implement centralized error handling for AutoMind:

```typescript
class ErrorHandler {
  static handle(error: Error, context: any): void {
    logger.error('AutoMind error occurred', {
      message: error.message,
      stack: error.stack,
      context
    });
    
    // Send to monitoring system
    this.reportToMonitoring(error, context);
    
    // Attempt recovery if possible
    this.attemptRecovery(error, context);
  }
  
  private static reportToMonitoring(error: Error, context: any): void {
    // Integration with monitoring service
  }
  
  private static attemptRecovery(error: Error, context: any): void {
    // Recovery logic based on error type
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  ErrorHandler.handle(error, { type: 'uncaughtException' });
});

process.on('unhandledRejection', (reason, promise) => {
  ErrorHandler.handle(reason as Error, { type: 'unhandledRejection', promise });
});
```

### Graceful Shutdown
Implement graceful shutdown for AutoMind services:

```typescript
class GracefulShutdown {
  private shutdownSignals = ['SIGTERM', 'SIGINT'];
  private isShuttingDown = false;
  
  constructor(private services: AutoMindService[]) {
    this.setupSignalHandlers();
  }
  
  private setupSignalHandlers(): void {
    this.shutdownSignals.forEach(signal => {
      process.on(signal, () => this.shutdown(signal));
    });
  }
  
  async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress');
      return;
    }
    
    this.isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown`);
    
    try {
      // Shutdown services in reverse order
      for (const service of this.services.reverse()) {
        await service.shutdown();
      }
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  }
}
```

## Performance Patterns

### Connection Pooling
Implement connection pooling for database and external services:

```typescript
import { Pool } from 'pg';

class DatabasePool {
  private pool: Pool;
  
  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      ...config,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
  
  async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Caching Strategies
Implement multi-level caching for AutoMind:

```typescript
interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

class MultiLevelCache implements CacheProvider {
  constructor(
    private l1Cache: CacheProvider,  // Memory cache
    private l2Cache: CacheProvider   // Redis cache
  ) {}
  
  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    let value = await this.l1Cache.get<T>(key);
    if (value) return value;
    
    // Try L2 cache
    value = await this.l2Cache.get<T>(key);
    if (value) {
      // Populate L1 cache
      await this.l1Cache.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await Promise.all([
      this.l1Cache.set(key, value, ttl),
      this.l2Cache.set(key, value, ttl)
    ]);
  }
}
```

### Rate Limiting
Implement rate limiting for API endpoints:

```typescript
import { RateLimiterMemory } from 'rate-limiter-flexible';

class RateLimitService {
  private limiters = new Map<string, RateLimiterMemory>();
  
  getLimiter(key: string, points: number, duration: number): RateLimiterMemory {
    if (!this.limiters.has(key)) {
      this.limiters.set(key, new RateLimiterMemory({
        points,
        duration,
      }));
    }
    return this.limiters.get(key)!;
  }
  
  async checkLimit(
    identifier: string,
    points: number = 10,
    duration: number = 60
  ): Promise<boolean> {
    const limiter = this.getLimiter(identifier, points, duration);
    
    try {
      await limiter.consume(identifier);
      return true;
    } catch (rejRes) {
      logger.warn('Rate limit exceeded', { identifier, rejRes });
      return false;
    }
  }
}
```

## Service Patterns

### Service Registry
Implement service registry for AutoMind components:

```typescript
interface ServiceDefinition {
  name: string;
  version: string;
  health: () => Promise<boolean>;
  dependencies?: string[];
}

class ServiceRegistry {
  private services = new Map<string, ServiceDefinition>();
  
  register(service: ServiceDefinition): void {
    this.services.set(service.name, service);
  }
  
  async getHealthStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};
    
    for (const [name, service] of this.services) {
      try {
        status[name] = await service.health();
      } catch (error) {
        status[name] = false;
        logger.error(`Health check failed for ${name}`, error);
      }
    }
    
    return status;
  }
  
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.services.values())
      .map(service => service.health().catch(() => false));
    
    await Promise.allSettled(shutdownPromises);
  }
}
```

### Event-Driven Architecture
Implement event-driven patterns for AutoMind:

```typescript
interface AutoMindEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

interface EventHandler {
  handle(event: AutoMindEvent): Promise<void>;
}

class EventBus {
  private handlers = new Map<string, EventHandler[]>();
  
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  async publish(event: AutoMindEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    await Promise.all(
      handlers.map(handler => 
        handler.handle(event).catch(error => 
          logger.error(`Event handler failed for ${event.type}`, error)
        )
      )
    );
  }
}

// Example usage
class JobEventHandler implements EventHandler {
  async handle(event: AutoMindEvent): Promise<void> {
    switch (event.type) {
      case 'job.created':
        await this.handleJobCreated(event.data);
        break;
      case 'job.completed':
        await this.handleJobCompleted(event.data);
        break;
    }
  }
}
```

## Testing Patterns

### Test Utilities
Create test utilities for AutoMind components:

```typescript
import { createMock } from 'ts-auto-mock';

class TestUtils {
  static createMockVectorService(): jest.Mocked<VectorService> {
    const mock = createMock<VectorService>();
    mock.upsertVector.mockResolvedValue();
    mock.searchVectors.mockResolvedValue([]);
    return mock as jest.Mocked<VectorService>;
  }
  
  static createTestJob(overrides?: Partial<AutoMindJob>): AutoMindJob {
    return {
      id: 'test-job-1',
      name: 'Test Job',
      description: 'Test Description',
      requirements: ['TypeScript'],
      schedule: '0 9 * * 1',
      status: 'active',
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }
  
  static async withTestDatabase<T>(
    callback: (db: Database) => Promise<T>
  ): Promise<T> {
    const db = await createTestDatabase();
    try {
      return await callback(db);
    } finally {
      await db.cleanup();
    }
  }
}
```

### Integration Testing
Set up integration testing environment:

```typescript
class TestEnvironment {
  private services: AutoMindService[] = [];
  
  async setup(): Promise<void> {
    // Setup test database
    this.services.push(await this.createTestDatabase());
    
    // Setup test Redis
    this.services.push(await this.createTestRedis());
    
    // Setup test Pinecone
    this.services.push(await this.createTestPinecone());
    
    // Initialize all services
    for (const service of this.services) {
      await service.initialize();
    }
  }
  
  async cleanup(): Promise<void> {
    for (const service of this.services.reverse()) {
      await service.shutdown();
    }
  }
}

// Usage in tests
describe('AutoMind Integration', () => {
  let env: TestEnvironment;
  
  beforeAll(async () => {
    env = new TestEnvironment();
    await env.setup();
  });
  
  afterAll(async () => {
    await env.cleanup();
  });
  
  it('should process job end-to-end', async () => {
    const jobProcessor = new JobProcessor();
    const result = await jobProcessor.processJob(TestUtils.createTestJob());
    expect(result.status).toBe('completed');
  });
});
```

## Monitoring Patterns

### Metrics Collection
Implement metrics collection for AutoMind:

```typescript
interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  
  record(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: new Date()
    });
  }
  
  recordDuration<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const start = Date.now();
    return fn().finally(() => {
      const duration = Date.now() - start;
      this.record(name, duration, labels);
    });
  }
  
  getMetrics(): Metric[] {
    return [...this.metrics];
  }
  
  clear(): void {
    this.metrics = [];
  }
}

// Usage
const metrics = new MetricsCollector();

await metrics.recordDuration('job_processing', async () => {
  await processJob(job);
}, { job_type: 'scheduled' });
```

### Health Monitoring
Implement comprehensive health monitoring:

```typescript
interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  details?: any;
}

class HealthMonitor {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map();
  
  register(name: string, check: () => Promise<HealthCheck>): void {
    this.checks.set(name, check);
  }
  
  async getHealthStatus(): Promise<{ overall: string; checks: HealthCheck[] }> {
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        try {
          return await checkFn();
        } catch (error) {
          return {
            name,
            status: 'unhealthy',
            message: error.message
          };
        }
      }
    );
    
    const results = await Promise.all(checkPromises);
    
    const overall = results.every(check => check.status === 'healthy')
      ? 'healthy'
      : results.some(check => check.status === 'unhealthy')
      ? 'unhealthy'
      : 'degraded';
    
    return { overall, checks: results };
  }
}
```

These Node.js patterns provide a solid foundation for building scalable, maintainable AutoMind components with proper error handling, performance optimization, and monitoring capabilities.
