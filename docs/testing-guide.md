# FlowOps Testing Guide

## 🧪 Overview

This guide covers the comprehensive testing strategy for FlowOps, including unit tests, integration tests, and end-to-end (E2E) tests using modern testing frameworks and best practices.

## 🎯 Testing Strategy

### **Testing Pyramid**
```
    E2E Tests (10%)
       ↓
  Integration Tests (20%)
       ↓
     Unit Tests (70%)
```

- **Unit Tests**: Fast, isolated tests for individual functions and methods
- **Integration Tests**: Test interactions between components and services
- **E2E Tests**: Complete user workflows through the UI

### **Test Coverage Goals**
- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: 80%+ line coverage
- **E2E Tests**: Critical user paths covered
- **Overall**: 85%+ coverage threshold

## 🛠️ Testing Stack

### **Core Testing Frameworks**
- **Jest**: Primary testing framework for unit and integration tests
- **Supertest**: HTTP assertion library for API testing
- **Selenium WebDriver**: E2E testing with real browsers
- **TypeScript**: Full type safety in tests

### **Testing Dependencies**
```json
{
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/jest": "^29.5.5",
    "@types/supertest": "^2.0.12",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "selenium-webdriver": "^4.16.0",
    "selenium-webdriver/chrome": "^4.16.0"
  }
}
```

## 📁 Test Structure

```
src/tests/
├── unit/                    # Unit tests
│   ├── vaultService.test.ts
│   ├── aiService.test.ts
│   ├── credentialService.test.ts
│   └── jobService.test.ts
├── integration/             # Integration tests
│   ├── api.test.ts
│   ├── database.test.ts
│   └── ai-integration.test.ts
├── e2e/                    # End-to-end tests
│   ├── workflow.test.ts
│   ├── auth-flow.test.ts
│   └── ai-chat.test.ts
├── fixtures/                # Test data and mocks
│   ├── mock-data.json
│   ├── test-jobs.json
│   └── api-responses.json
├── helpers/                 # Test utilities
│   ├── test-utils.ts
│   ├── mock-factory.ts
│   └── test-setup.ts
└── setup.ts               # Global test configuration
```

## 🔬 Unit Testing

### **Vault Service Tests**
```typescript
describe('VaultService', () => {
  it('should read secret from vault', async () => {
    const vaultService = new VaultService(mockConfig);
    const result = await vaultService.readSecret('test/path');
    expect(result).toBe('mock-secret-value');
  });

  it('should handle missing secret gracefully', async () => {
    await expect(vaultService.readSecret('nonexistent/path'))
      .rejects.toThrow('Secret not found');
  });
});
```

### **AI Service Tests**
```typescript
describe('AIService', () => {
  it('should analyze job for optimization', async () => {
    const mockJobData = createMockJob();
    const result = await aiService.analyzeJobForOptimization(mockJobData);
    
    expect(result).toHaveProperty('jobOptimization');
    expect(result.jobOptimization).toHaveProperty('suggestedPriority');
    expect(result.jobOptimization).toHaveProperty('estimatedDuration');
  });
});
```

### **Credential Service Tests**
```typescript
describe('CredentialService', () => {
  it('should rotate AWS credentials successfully', async () => {
    const result = await credentialService.rotateCredentials('aws');
    
    expect(result.success).toBe(true);
    expect(result.newCredentials).toHaveProperty('AWS_ACCESS_KEY_ID');
    expect(result.newCredentials).toHaveProperty('AWS_SECRET_ACCESS_KEY');
  });
});
```

## 🔗 Integration Testing

### **API Integration Tests**
```typescript
describe('API Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    await server.close();
  });

  it('should handle complete job lifecycle', async () => {
    // Test job creation, execution, and completion
    const response = await request(app)
      .post('/api/jobs')
      .send(mockJobData)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

### **Database Integration Tests**
```typescript
describe('Database Integration', () => {
  let db: any;

  beforeAll(async () => {
    db = await createTestDatabase();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should persist job data correctly', async () => {
    const job = await Job.create(mockJobData);
    const retrievedJob = await Job.findById(job.id);
    
    expect(retrievedJob.name).toBe(mockJobData.name);
  });
});
```

### **AI Integration Tests**
```typescript
describe('AI Integration', () => {
  it('should integrate with OpenAI API', async () => {
    const mockOpenAI = createMockOpenAI();
    const aiService = new AIService(mockOpenAI);
    
    const result = await aiService.analyzeJobForOptimization(mockJobData);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
  });
});
```

## 🌐 End-to-End Testing

### **Workflow E2E Tests**
```typescript
describe('Complete Workflow Flow', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  it('should handle complete job lifecycle', async () => {
    // Navigate to application
    await driver.get(baseUrl);
    
    // Login
    await driver.findElement(By.id('username')).sendKeys('testuser');
    await driver.findElement(By.id('password')).sendKeys('testpassword');
    await driver.findElement(By.id('login-btn')).click();
    
    // Create job
    await driver.findElement(By.id('create-job-btn')).click();
    await driver.findElement(By.id('job-name')).sendKeys('E2E Test Job');
    await driver.findElement(By.id('create-job-submit')).click();
    
    // Verify job creation
    await driver.wait(until.elementLocated(By.className('job-item')), 10000);
    const jobItems = await driver.findElements(By.className('job-item'));
    expect(jobItems.length).toBeGreaterThan(0);
  });
});
```

### **AI Chat E2E Tests**
```typescript
describe('AI Chat E2E Tests', () => {
  it('should handle AI chat functionality', async () => {
    await driver.get(baseUrl);
    
    // Login and navigate to AI chat
    await login(driver);
    await driver.findElement(By.id('ai-chat-btn')).click();
    
    // Send message and wait for response
    await driver.findElement(By.id('chat-input')).sendKeys('How can I optimize my job?');
    await driver.findElement(By.id('send-message-btn')).click();
    
    // Verify AI response
    await driver.wait(until.elementLocated(By.className('ai-response')), 15000);
    const aiResponse = await driver.findElement(By.className('ai-response'));
    expect(await aiResponse.getText()).toContain('optimize');
  });
});
```

## 🎭 Mocking Strategy

### **Service Mocking**
```typescript
// Mock external dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock AI response' } }]
        })
      }
    }
  }))
}));
```

### **Data Mocking**
```typescript
// Create mock data factories
export const createMockJob = () => ({
  id: 'test-job-123',
  name: 'Test Job',
  type: 'batch',
  priority: 'medium',
  schedule: '0 2 * * *',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
});

export const createMockAIResponse = () => ({
  jobOptimization: {
    suggestedPriority: 'high',
    estimatedDuration: 300,
    resourceRequirements: {
      cpu: 8,
      memory: 16,
      io: 5
    },
    confidence: 85
  }
});
```

## 📊 Test Configuration

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 10000
};
```

### **Test Scripts**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=src/tests/unit",
    "test:integration": "jest --testPathPattern=src/tests/integration",
    "test:e2e": "jest --testPathPattern=src/tests/e2e",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

## 🚀 Running Tests

### **Local Development**
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci
```

### **Docker Testing**
```dockerfile
# Dockerfile.test
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "test:ci"]
```

### **CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
```

## 📈 Test Coverage

### **Coverage Reports**
- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Report**: Console output
- **JSON Report**: `coverage/coverage-final.json`

### **Coverage Thresholds**
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### **Coverage Best Practices**
```typescript
// Test error handling
it('should handle API errors gracefully', async () => {
  jest.spyOn(api, 'call').mockRejectedValue(new Error('API Error'));
  
  await expect(service.call()).rejects.toThrow('API Error');
  expect(logger.error).toHaveBeenCalledWith('API call failed:', expect.any(Error));
});

// Test edge cases
it('should handle empty input', async () => {
  const result = await service.processData([]);
  expect(result).toEqual([]);
});

// Test success and failure paths
it('should handle both success and failure scenarios', async () => {
  // Success case
  jest.spyOn(service, 'validate').mockResolvedValue(true);
  await expect(service.execute()).resolves.toBe(true);
  
  // Failure case
  jest.spyOn(service, 'validate').mockRejectedValue(new Error('Validation failed'));
  await expect(service.execute()).rejects.toThrow('Validation failed');
});
```

## 🔧 Test Utilities

### **Test Helpers**
```typescript
// src/tests/helpers/test-utils.ts
export const createMockRequest = (overrides = {}) => ({
  headers: { 'Content-Type': 'application/json' },
  ...overrides
});

export const createMockResponse = (data: any, status = 200) => ({
  status,
  data,
  headers: { 'content-type': 'application/json' }
});

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000
): Promise<void> => {
  const startTime = Date.now();
  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};
```

### **Mock Factories**
```typescript
// src/tests/helpers/mock-factory.ts
export class MockFactory {
  static createJob(overrides = {}) {
    return {
      id: 'test-job-123',
      name: 'Test Job',
      type: 'batch',
      priority: 'medium',
      status: 'pending',
      ...overrides
    };
  }

  static createAIResponse(overrides = {}) {
    return {
      jobOptimization: {
        suggestedPriority: 'high',
        estimatedDuration: 300,
        resourceRequirements: { cpu: 8, memory: 16, io: 5 },
        confidence: 85
      },
      ...overrides
    };
  }
}
```

## 🎯 Testing Best Practices

### **Test Organization**
1. **Arrange, Act, Assert** pattern
2. **Descriptive test names**
3. **One assertion per test**
4. **Test both success and failure paths**
5. **Use meaningful test data**

### **Mock Management**
1. **Mock external dependencies**
2. **Use factories for test data**
3. **Clean up mocks after each test**
4. **Test with real data when possible**

### **Error Testing**
1. **Test error conditions**
2. **Verify error messages**
3. **Test edge cases**
4. **Test timeout scenarios**

### **Performance Testing**
1. **Set reasonable timeouts**
2. **Test with large datasets**
3. **Monitor memory usage**
4. **Test concurrent operations**

## 📋 Test Checklist

### **Before Writing Tests**
- [ ] Understand the feature requirements
- [ ] Identify test scenarios
- [ ] Plan test structure
- [ ] Prepare test data
- [ ] Set up mocking strategy

### **During Test Development**
- [ ] Follow AAA pattern
- [ ] Use descriptive test names
- [ ] Test both positive and negative cases
- [ ] Verify assertions are meaningful
- [ ] Keep tests focused and isolated

### **After Test Completion**
- [ ] Run tests locally
- [ ] Check coverage reports
- [ ] Verify test reliability
- [ ] Update documentation
- [ ] Review test performance

## 🚨 Common Pitfalls

### **Test Smells**
1. **Testing implementation details**
2. **Over-mocking**
3. **Brittle tests**
4. **Test dependencies**
5. **Slow tests**

### **How to Avoid**
1. **Focus on behavior, not implementation**
2. **Mock only external dependencies**
3. **Use stable test data**
4. **Keep tests independent**
5. **Optimize test performance**

## 📚 Additional Resources

### **Testing Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Selenium WebDriver](https://www.selenium.dev/documentation/)
- [Testing Best Practices](https://github.com/goldbergyoni/node-testing-best-practices)

### **Testing Tools**
- [Jest Matchers](https://jestjs.io/docs/using-matchers)
- [Test Utilities](https://github.com/testing-library/jest-dom)
- [Mock Libraries](https://github.com/kulshekhar/ts-mockito)
- [Coverage Tools](https://github.com/istanbuljs/nyc)

---

**This comprehensive testing strategy ensures FlowOps maintains high code quality and reliability!** 🧪
