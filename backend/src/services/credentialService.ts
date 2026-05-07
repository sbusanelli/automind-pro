import { logger } from '../utils/logger';

export interface CredentialStatus {
  provider: string;
  status: 'valid' | 'expired' | 'missing' | 'error';
  lastValidated: Date;
  expiresAt?: Date;
  daysUntilExpiry?: number;
  maskedValue?: string;
}

export interface RotationResult {
  provider: string;
  success: boolean;
  newCredentials?: any;
  error?: string;
  rotatedAt: Date;
  nextRotation?: Date;
}

export class CredentialService {
  private readonly providers = ['aws', 'gcp', 'azure', 'github', 'openai'];
  private readonly rotationInterval = 90; // days

  constructor() {
    this.scheduleRotationChecks();
  }

  /**
   * Get status of all credentials
   */
  async getAllCredentialStatus(): Promise<CredentialStatus[]> {
    const statuses: CredentialStatus[] = [];

    for (const provider of this.providers) {
      const status = await this.checkCredentialStatus(provider);
      statuses.push(status);
    }

    return statuses;
  }

  /**
   * Check status of specific provider credentials
   */
  async checkCredentialStatus(provider: string): Promise<CredentialStatus> {
    const now = new Date();
    
    try {
      switch (provider) {
        case 'aws':
          return await this.checkAWSCredentials(now);
        case 'gcp':
          return await this.checkGCPCredentials(now);
        case 'azure':
          return await this.checkAzureCredentials(now);
        case 'github':
          return await this.checkGitHubCredentials(now);
        case 'openai':
          return await this.checkOpenAICredentials(now);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      logger.error(`Error checking ${provider} credentials:`, error);
      return {
        provider,
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Rotate credentials for specific provider
   */
  async rotateCredentials(provider: string): Promise<RotationResult> {
    const now = new Date();
    logger.info(`Starting credential rotation for ${provider}`);

    try {
      let newCredentials: any;

      switch (provider) {
        case 'aws':
          newCredentials = await this.rotateAWSCredentials();
          break;
        case 'gcp':
          newCredentials = await this.rotateGCPCredentials();
          break;
        case 'azure':
          newCredentials = await this.rotateAzureCredentials();
          break;
        case 'github':
          newCredentials = await this.rotateGitHubCredentials();
          break;
        case 'openai':
          newCredentials = await this.rotateOpenAICredentials();
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const nextRotation = new Date(now.getTime() + (this.rotationInterval * 24 * 60 * 60 * 1000));

      const result: RotationResult = {
        provider,
        success: true,
        newCredentials,
        rotatedAt: now,
        nextRotation
      };

      await this.notifyRotation(result);
      logger.info(`Successfully rotated ${provider} credentials`, result);
      
      return result;
    } catch (error) {
      const result: RotationResult = {
        provider,
        success: false,
        error: error.message,
        rotatedAt: now
      };

      await this.notifyRotation(result);
      logger.error(`Failed to rotate ${provider} credentials:`, error);
      
      return result;
    }
  }

  /**
   * Schedule automatic rotation checks
   */
  private scheduleRotationChecks(): void {
    // Check daily at 2 AM
    setInterval(async () => {
      await this.checkAndRotateExpiredCredentials();
    }, 24 * 60 * 60 * 1000);

    // Initial check on startup
    this.checkAndRotateExpiredCredentials();
  }

  /**
   * Check and rotate expired credentials
   */
  private async checkAndRotateExpiredCredentials(): Promise<void> {
    const statuses = await this.getAllCredentialStatus();
    const expiredProviders = statuses.filter(status => 
      status.status === 'expired' || 
      (status.daysUntilExpiry !== undefined && status.daysUntilExpiry <= 7)
    );

    for (const status of expiredProviders) {
      logger.warn(`Rotating expired credentials for ${status.provider}`);
      await this.rotateCredentials(status.provider);
    }
  }

  /**
   * Check AWS credentials
   */
  private async checkAWSCredentials(now: Date): Promise<CredentialStatus> {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      return {
        provider: 'aws',
        status: 'missing',
        lastValidated: now,
        maskedValue: 'NOT_SET'
      };
    }

    try {
      // Simulate AWS credential validation
      // In real implementation, this would use AWS SDK
      const isValid = await this.validateAWSCredentials(accessKeyId, secretAccessKey);
      
      return {
        provider: 'aws',
        status: isValid ? 'valid' : 'expired',
        lastValidated: now,
        maskedValue: this.maskCredential(accessKeyId),
        daysUntilExpiry: isValid ? 90 : 0
      };
    } catch (error) {
      return {
        provider: 'aws',
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Check GCP credentials
   */
  private async checkGCPCredentials(now: Date): Promise<CredentialStatus> {
    const serviceAccountKey = process.env.GCP_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      return {
        provider: 'gcp',
        status: 'missing',
        lastValidated: now,
        maskedValue: 'NOT_SET'
      };
    }

    try {
      const isValid = await this.validateGCPCredentials(serviceAccountKey);
      
      return {
        provider: 'gcp',
        status: isValid ? 'valid' : 'expired',
        lastValidated: now,
        maskedValue: this.maskCredential(serviceAccountKey),
        daysUntilExpiry: isValid ? 90 : 0
      };
    } catch (error) {
      return {
        provider: 'gcp',
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Check Azure credentials
   */
  private async checkAzureCredentials(now: Date): Promise<CredentialStatus> {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      return {
        provider: 'azure',
        status: 'missing',
        lastValidated: now,
        maskedValue: 'NOT_SET'
      };
    }

    try {
      const isValid = await this.validateAzureCredentials(clientId, clientSecret, tenantId);
      
      return {
        provider: 'azure',
        status: isValid ? 'valid' : 'expired',
        lastValidated: now,
        maskedValue: this.maskCredential(clientId),
        daysUntilExpiry: isValid ? 90 : 0
      };
    } catch (error) {
      return {
        provider: 'azure',
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Check GitHub credentials
   */
  private async checkGitHubCredentials(now: Date): Promise<CredentialStatus> {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return {
        provider: 'github',
        status: 'missing',
        lastValidated: now,
        maskedValue: 'NOT_SET'
      };
    }

    try {
      const isValid = await this.validateGitHubToken(token);
      
      return {
        provider: 'github',
        status: isValid ? 'valid' : 'expired',
        lastValidated: now,
        maskedValue: this.maskCredential(token),
        daysUntilExpiry: isValid ? 90 : 0
      };
    } catch (error) {
      return {
        provider: 'github',
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Check OpenAI credentials
   */
  private async checkOpenAICredentials(now: Date): Promise<CredentialStatus> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        provider: 'openai',
        status: 'missing',
        lastValidated: now,
        maskedValue: 'NOT_SET'
      };
    }

    try {
      const isValid = await this.validateOpenAIKey(apiKey);
      
      return {
        provider: 'openai',
        status: isValid ? 'valid' : 'expired',
        lastValidated: now,
        maskedValue: this.maskCredential(apiKey),
        daysUntilExpiry: isValid ? 90 : 0
      };
    } catch (error) {
      return {
        provider: 'openai',
        status: 'error',
        lastValidated: now,
        maskedValue: 'ERROR'
      };
    }
  }

  /**
   * Rotate AWS credentials
   */
  private async rotateAWSCredentials(): Promise<any> {
    // In real implementation, this would use AWS IAM API
    logger.info('Rotating AWS credentials...');
    
    // Simulate credential generation
    const newAccessKeyId = `AKIA${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const newSecretAccessKey = this.generateSecureKey();
    
    return {
      AWS_ACCESS_KEY_ID: newAccessKeyId,
      AWS_SECRET_ACCESS_KEY: newSecretAccessKey
    };
  }

  /**
   * Rotate GCP credentials
   */
  private async rotateGCPCredentials(): Promise<any> {
    logger.info('Rotating GCP credentials...');
    
    // Simulate service account key generation
    const newServiceAccountKey = {
      type: 'service_account',
      project_id: process.env.GCP_PROJECT_ID,
      private_key_id: Math.random().toString(36).substr(2, 16),
      private_key: this.generateSecureKey(),
      client_email: `flowops-deploy@${process.env.GCP_PROJECT_ID}.iam.gserviceaccount.com`
    };
    
    return {
      GCP_SERVICE_ACCOUNT_KEY: JSON.stringify(newServiceAccountKey)
    };
  }

  /**
   * Rotate Azure credentials
   */
  private async rotateAzureCredentials(): Promise<any> {
    logger.info('Rotating Azure credentials...');
    
    const newClientId = Math.random().toString(36).substr(2, 16);
    const newClientSecret = this.generateSecureKey();
    
    return {
      AZURE_CLIENT_ID: newClientId,
      AZURE_CLIENT_SECRET: newClientSecret
    };
  }

  /**
   * Rotate GitHub credentials
   */
  private async rotateGitHubCredentials(): Promise<any> {
    logger.info('Rotating GitHub credentials...');
    
    const newToken = `ghp_${this.generateSecureKey()}`;
    
    return {
      GITHUB_TOKEN: newToken
    };
  }

  /**
   * Rotate OpenAI credentials
   */
  private async rotateOpenAICredentials(): Promise<any> {
    logger.info('Rotating OpenAI credentials...');
    
    const newApiKey = `sk-${this.generateSecureKey()}`;
    
    return {
      OPENAI_API_KEY: newApiKey
    };
  }

  /**
   * Validate AWS credentials
   */
  private async validateAWSCredentials(accessKeyId: string, secretAccessKey: string): Promise<boolean> {
    // Simulate AWS credential validation
    // In real implementation, this would use AWS STS GetCallerIdentity
    return accessKeyId.startsWith('AKIA') && secretAccessKey.length > 20;
  }

  /**
   * Validate GCP credentials
   */
  private async validateGCPCredentials(serviceAccountKey: string): Promise<boolean> {
    // Simulate GCP credential validation
    // In real implementation, this would use Google Auth Library
    try {
      const key = JSON.parse(serviceAccountKey);
      return key.type === 'service_account' && key.private_key;
    } catch {
      return false;
    }
  }

  /**
   * Validate Azure credentials
   */
  private async validateAzureCredentials(clientId: string, clientSecret: string, tenantId: string): Promise<boolean> {
    // Simulate Azure credential validation
    // In real implementation, this would use Azure AD API
    return clientId.length > 10 && clientSecret.length > 10 && tenantId.length > 10;
  }

  /**
   * Validate GitHub token
   */
  private async validateGitHubToken(token: string): Promise<boolean> {
    // Simulate GitHub token validation
    // In real implementation, this would use GitHub API
    return token.startsWith('ghp_') && token.length > 20;
  }

  /**
   * Validate OpenAI API key
   */
  private async validateOpenAIKey(apiKey: string): Promise<boolean> {
    // Simulate OpenAI API key validation
    // In real implementation, this would use OpenAI API
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  }

  /**
   * Mask credential for display
   */
  private maskCredential(credential: string): string {
    if (!credential || credential.length < 8) {
      return 'INVALID';
    }
    return `${credential.substring(0, 8)}****`;
  }

  /**
   * Generate secure random key
   */
  private generateSecureKey(): string {
    return Math.random().toString(36).substr(2, 32) + Math.random().toString(36).substr(2, 32);
  }

  /**
   * Send rotation notification
   */
  private async notifyRotation(result: RotationResult): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      logger.warn('No notification webhook configured');
      return;
    }

    const message = result.success 
      ? `🔄 Successfully rotated ${result.provider} credentials\nRotated at: ${result.rotatedAt.toISOString()}`
      : `❌ Failed to rotate ${result.provider} credentials\nError: ${result.error}\nAttempted at: ${result.rotatedAt.toISOString()}`;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message
        })
      });
      
      logger.info(`Rotation notification sent for ${result.provider}`);
    } catch (error) {
      logger.error('Failed to send rotation notification:', error);
    }
  }
}
