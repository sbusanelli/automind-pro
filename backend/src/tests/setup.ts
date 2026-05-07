import { config } from 'dotenv';

// Load environment variables for tests
config({ path: '.env.test' });

// Global test setup
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock process.env for tests
const originalEnv = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset process.env
  process.env = { ...originalEnv };
});

afterEach(() => {
  // Restore original environment
  process.env = originalEnv;
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Export test utilities
export const mockProcessEnv = (overrides: Record<string, string>) => {
  process.env = { ...process.env, ...overrides };
};

export const restoreProcessEnv = () => {
  process.env = originalEnv;
};

export const createMockVaultService = () => {
  return {
    readSecret: jest.fn(),
    writeSecret: jest.fn(),
    getAWSCredentials: jest.fn(),
    getGCPCredentials: jest.fn(),
    getAzureCredentials: jest.fn(),
    getGitHubCredentials: jest.fn(),
    getOpenAICredentials: jest.fn(),
    getSlackWebhook: jest.fn(),
    rotateSecret: jest.fn(),
    secretExists: jest.fn(),
    getSecrets: jest.fn(),
    getSecretWithRotation: jest.fn(),
    initializeEnvironment: jest.fn(),
    healthCheck: jest.fn()
  };
};
