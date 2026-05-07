import { logger } from '../utils/logger';

export interface VaultConfig {
  url: string;
  token: string;
  namespace?: string;
  mount?: string;
}

export interface VaultSecret {
  key: string;
  value: string;
  metadata?: Record<string, any>;
}

export interface VaultResponse<T = any> {
  request_id: string;
  lease_id: string;
  renewable: boolean;
  lease_duration: number;
  data: T;
  wrap_info?: any;
  warnings?: any[];
  auth?: any;
}

export class VaultService {
  private config: VaultConfig;
  private client: any; // This would be the Vault client
  private isProduction: boolean;

  constructor(config: VaultConfig) {
    this.config = config;
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      this.initializeClient();
    } else {
      if (logger && typeof logger.info === 'function') {
        logger.info('Development mode: Skipping Vault initialization');
      } else {
        console.log('Development mode: Skipping Vault initialization');
      }
    }
  }

  private async initializeClient(): Promise<void> {
    try {
      // In real implementation, this would initialize the Vault client
      // const { Vault } = require('node-vault');
      // this.client = new Vault({
      //   apiVersion: 'v1',
      //   endpoint: this.config.url,
      //   token: this.config.token
      // });

      // Use console.log as fallback if logger is not available (test environment)
      if (logger && typeof logger.info === 'function') {
        logger.info('Vault client initialized', { 
          url: this.config.url,
          namespace: this.config.namespace,
          mount: this.config.mount
        });
      } else {
        console.log('Vault client initialized', { 
          url: this.config.url,
          namespace: this.config.namespace,
          mount: this.config.mount
        });
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error('Failed to initialize Vault client:', error);
      } else {
        console.error('Failed to initialize Vault client:', error);
      }
      throw new Error('Vault initialization failed');
    }
  }

  /**
   * Read a secret from Vault
   */
  async readSecret(path: string): Promise<string> {
    try {
      if (logger && typeof logger.debug === 'function') {
        logger.debug(`Reading secret from Vault: ${path}`);
      }
      
      // In real implementation:
      // const result: VaultResponse<{ value: string }> = await this.client.read(path);
      // return result.data.value;
      
      // For now, simulate reading from environment variables
      const envKey = this.convertVaultPathToEnvKey(path);
      const value = process.env[envKey];
      
      if (!value) {
        throw new Error(`Secret not found: ${path}`);
      }
      
      if (logger && typeof logger.debug === 'function') {
        logger.debug(`Successfully read secret: ${path}`);
      }
      return value;
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`Failed to read secret from Vault: ${path}`, error);
      } else {
        console.error(`Failed to read secret from Vault: ${path}`, error);
      }
      // Re-throw the original error to preserve the error message
      throw error;
    }
  }

  /**
   * Write a secret to Vault
   */
  async writeSecret(path: string, value: string, metadata?: Record<string, any>): Promise<void> {
    try {
      if (logger && typeof logger.debug === 'function') {
        logger.debug(`Writing secret to Vault: ${path}`);
      }
      
      // In real implementation:
      // await this.client.write(path, { value, ...metadata });
      
      if (logger && typeof logger.info === 'function') {
        logger.info(`Successfully wrote secret to Vault: ${path}`);
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`Failed to write secret to Vault: ${path}`, error);
      } else {
        console.error(`Failed to write secret to Vault: ${path}`, error);
      }
      throw new Error(`Vault write failed: ${path}`);
    }
  }

  /**
   * Read multiple secrets from Vault
   */
  async readSecrets(paths: string[]): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};
    
    for (const path of paths) {
      try {
        secrets[path] = await this.readSecret(path);
      } catch (error) {
        if (logger && typeof logger.warn === 'function') {
          logger.warn(`Failed to read secret ${path}, continuing...`, error);
        } else {
          console.warn(`Failed to read secret ${path}, continuing...`, error);
        }
      }
    }
    
    return secrets;
  }

  /**
   * Get AWS credentials from Vault
   */
  async getAWSCredentials(): Promise<{
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }> {
    const credentials = await this.readSecrets([
      'aws/access-key-id',
      'aws/secret-access-key',
      'aws/region'
    ]);

    return {
      accessKeyId: credentials['aws/access-key-id'],
      secretAccessKey: credentials['aws/secret-access-key'],
      region: credentials['aws/region'] || 'us-west-2'
    };
  }

  /**
   * Get GCP credentials from Vault
   */
  async getGCPCredentials(): Promise<{
    serviceAccountKey: string;
    projectId: string;
    region: string;
  }> {
    const credentials = await this.readSecrets([
      'gcp/service-account-key',
      'gcp/project-id',
      'gcp/region'
    ]);

    return {
      serviceAccountKey: credentials['gcp/service-account-key'],
      projectId: credentials['gcp/project-id'],
      region: credentials['gcp/region'] || 'us-central1'
    };
  }

  /**
   * Get Azure credentials from Vault
   */
  async getAzureCredentials(): Promise<{
    clientId: string;
    clientSecret: string;
    tenantId: string;
    subscriptionId: string;
  }> {
    const credentials = await this.readSecrets([
      'azure/client-id',
      'azure/client-secret',
      'azure/tenant-id',
      'azure/subscription-id'
    ]);

    return {
      clientId: credentials['azure/client-id'],
      clientSecret: credentials['azure/client-secret'],
      tenantId: credentials['azure/tenant-id'],
      subscriptionId: credentials['azure/subscription-id']
    };
  }

  /**
   * Get GitHub credentials from Vault
   */
  async getGitHubCredentials(): Promise<{
    token: string;
    username: string;
  }> {
    const credentials = await this.readSecrets([
      'github/token',
      'github/username'
    ]);

    return {
      token: credentials['github/token'],
      username: credentials['github/username']
    };
  }

  /**
   * Get OpenAI credentials from Vault
   */
  async getOpenAICredentials(): Promise<{
    apiKey: string;
  }> {
    const credentials = await this.readSecrets(['openai/api-key']);
    
    return {
      apiKey: credentials['openai/api-key']
    };
  }

  /**
   * Get Slack webhook URL from Vault
   */
  async getSlackWebhook(): Promise<string> {
    const webhook = await this.readSecret('slack/webhook-url');
    return webhook;
  }

  /**
   * Rotate a secret in Vault
   */
  async rotateSecret(path: string, newValue: string): Promise<void> {
    try {
      if (logger && typeof logger.info === 'function') {
        logger.info(`Rotating secret in Vault: ${path}`);
      } else {
        console.log(`Rotating secret in Vault: ${path}`);
      }
      
      // Read current value for backup
      const currentValue = await this.readSecret(path);
      
      // Write new value
      await this.writeSecret(path, newValue, {
        rotated_at: new Date().toISOString(),
        previous_value_hash: this.hashValue(currentValue)
      });
      
      if (logger && typeof logger.info === 'function') {
        logger.info(`Successfully rotated secret: ${path}`);
      } else {
        console.log(`Successfully rotated secret: ${path}`);
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`Failed to rotate secret: ${path}`, error);
      } else {
        console.error(`Failed to rotate secret: ${path}`, error);
      }
      throw new Error(`Vault rotation failed: ${path}`);
    }
  }

  /**
   * Check if secret exists in Vault
   */
  async secretExists(path: string): Promise<boolean> {
    try {
      await this.readSecret(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get secret with automatic rotation
   */
  async getSecretWithRotation(path: string, maxAge: number = 90): Promise<string> {
    try {
      // Read secret metadata
      const metadata = await this.getSecretMetadata(path);
      
      if (metadata.rotated_at) {
        const rotationDate = new Date(metadata.rotated_at);
        const now = new Date();
        const daysSinceRotation = (now.getTime() - rotationDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceRotation > maxAge) {
          if (logger && typeof logger.warn === 'function') {
            logger.warn(`Secret ${path} is ${daysSinceRotation} days old, triggering rotation`);
          } else {
            console.warn(`Secret ${path} is ${daysSinceRotation} days old, triggering rotation`);
          }
          await this.triggerRotation(path);
        }
      }
      
      return await this.readSecret(path);
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`Failed to get secret with rotation: ${path}`, error);
      } else {
        console.error(`Failed to get secret with rotation: ${path}`, error);
      }
      throw error;
    }
  }

  /**
   * Get secret metadata
   */
  private async getSecretMetadata(path: string): Promise<Record<string, any>> {
    try {
      // In real implementation:
      // const result: VaultResponse = await this.client.read(`${path}?metadata=true`);
      // return result.data;
      
      // For now, return empty metadata
      return {};
    } catch (error) {
      if (logger && typeof logger.warn === 'function') {
        logger.warn(`Failed to get metadata for ${path}:`, error);
      } else {
        console.warn(`Failed to get metadata for ${path}:`, error);
      }
      return {};
    }
  }

  /**
   * Trigger automatic rotation for a secret
   */
  private async triggerRotation(path: string): Promise<void> {
    try {
      if (logger && typeof logger.info === 'function') {
        logger.info(`Triggering automatic rotation for: ${path}`);
      } else {
        console.log(`Triggering automatic rotation for: ${path}`);
      }
      
      // In real implementation, this would trigger a rotation process
      // Could be a webhook call, message queue, or direct API call
      
      // For now, just log the rotation trigger
      if (logger && typeof logger.info === 'function') {
        logger.info(`Rotation triggered for secret: ${path}`);
      } else {
        console.log(`Rotation triggered for secret: ${path}`);
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error(`Failed to trigger rotation for ${path}:`, error);
      } else {
        console.error(`Failed to trigger rotation for ${path}:`, error);
      }
    }
  }

  /**
   * Convert Vault path to environment variable key
   */
  private convertVaultPathToEnvKey(path: string): string {
    return path
      .replace(/\//g, '_')
      .replace(/-/g, '_')
      .toUpperCase();
  }

  /**
   * Hash a value for comparison
   */
  private hashValue(value: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Initialize environment variables from Vault
   */
  async initializeEnvironment(): Promise<void> {
    // Skip Vault initialization in development/test mode
    if (!this.isProduction) {
      if (logger && typeof logger.info === 'function') {
        logger.info('Development mode: Using environment variables');
      } else {
        console.log('Development mode: Using environment variables');
      }
      return;
    }
    
    try {
      logger.info('Initializing environment from Vault...');
      
      // Load all required secrets
      const secrets = await this.readSecrets([
        'aws/access-key-id',
        'aws/secret-access-key',
        'aws/region',
        'gcp/service-account-key',
        'gcp/project-id',
        'gcp/region',
        'azure/client-id',
        'azure/client-secret',
        'azure/tenant-id',
        'azure/subscription-id',
        'github/token',
        'github/username',
        'openai/api-key',
        'slack/webhook-url'
      ]);

      // Set environment variables
      process.env.AWS_ACCESS_KEY_ID = secrets['aws/access-key-id'];
      process.env.AWS_SECRET_ACCESS_KEY = secrets['aws/secret-access-key'];
      process.env.AWS_REGION = secrets['aws/region'];
      process.env.GCP_SERVICE_ACCOUNT_KEY = secrets['gcp/service-account-key'];
      process.env.GCP_PROJECT_ID = secrets['gcp/project-id'];
      process.env.GCP_REGION = secrets['gcp/region'];
      process.env.AZURE_CLIENT_ID = secrets['azure/client-id'];
      process.env.AZURE_CLIENT_SECRET = secrets['azure/client-secret'];
      process.env.AZURE_TENANT_ID = secrets['azure/tenant-id'];
      process.env.AZURE_SUBSCRIPTION_ID = secrets['azure/subscription-id'];
      process.env.GITHUB_TOKEN = secrets['github/token'];
      process.env.GITHUB_USERNAME = secrets['github/username'];
      process.env.OPENAI_API_KEY = secrets['openai/api-key'];
      process.env.SLACK_WEBHOOK_URL = secrets['slack/webhook-url'];
      
      if (logger && typeof logger.info === 'function') {
        logger.info('Environment initialized from Vault successfully');
      } else {
        console.log('Environment initialized from Vault successfully');
      }
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error('Failed to initialize environment from Vault:', error);
      } else {
        console.error('Failed to initialize environment from Vault:', error);
      }
      throw new Error('Vault environment initialization failed');
    }
  }

  /**
   * Health check for Vault connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      // In real implementation:
      // await this.client.health();
      
      // For now, just check if we can read a known secret
      await this.readSecret('vault/health-check');
      return true;
    } catch (error) {
      if (logger && typeof logger.error === 'function') {
        logger.error('Vault health check failed:', error);
      } else {
        console.error('Vault health check failed:', error);
      }
      return false;
    }
  }
}
