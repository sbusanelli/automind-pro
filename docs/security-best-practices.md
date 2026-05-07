# FlowOps Security Best Practices

## 🔐 Overview

This document outlines the security best practices for FlowOps development, focusing on proper credential management, vault integration, and secure coding practices.

## 🚨 Critical Security Rules

### **NEVER Commit These to Code**
- ❌ **API Keys**: Any form of API keys (AWS, GCP, Azure, OpenAI, GitHub)
- ❌ **Passwords**: Any password or secret values
- ❌ **Private Keys**: SSL certificates, SSH keys, encryption keys
- ❌ **Tokens**: JWT tokens, OAuth tokens, access tokens
- ❌ **Database Credentials**: Connection strings with passwords
- ❌ **Environment Files**: `.env` files with secrets
- ❌ **Configuration Files**: Config files containing secrets

## ✅ Proper Credential Management

### **1. Use HashiCorp Vault**
```typescript
// ✅ CORRECT: Use Vault service
import { VaultService } from '../services/vaultService';

const vault = new VaultService({
  url: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

// Load credentials from Vault
const awsCreds = await vault.getAWSCredentials();
const gcpCreds = await vault.getGCPCredentials();
const openaiKey = await vault.getOpenAICredentials();
```

### **2. Environment Variables Only for Vault Access**
```typescript
// ✅ CORRECT: Only vault connection details
const vaultConfig = {
  url: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
  namespace: process.env.VAULT_NAMESPACE
};

// ❌ WRONG: Direct credential access
const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,  // Never do this!
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY  // Never do this!
};
```

### **3. Secure Credential Loading**
```typescript
// ✅ CORRECT: Secure credential service
export class CredentialService {
  private vault: VaultService;
  
  constructor() {
    this.vault = new VaultService({
      url: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN
    });
  }
  
  async getAWSCredentials() {
    return await this.vault.getAWSCredentials();
  }
}
```

## 🔍 Pre-commit Security Hooks

### **Automatic Security Scanning**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    hooks:
      - id: detect-secrets
        name: 🔍 Detect Hardcoded Secrets
        
  - repo: https://github.com/zricethezav/gitleaks
    hooks:
      - id: gitleaks
        name: 🔍 Gitleaks Secret Detection
        
  - repo: local
    hooks:
      - id: check-vault-compliance
        name: 🔐 Check Vault Compliance
        entry: scripts/check-vault-compliance.sh
```

### **Security Check Scripts**
```bash
# ✅ Scripts included:
- scripts/check-hardcoded-env.sh      # Environment variable checks
- scripts/check-vault-compliance.sh   # Vault integration compliance
- scripts/check-api-key-patterns.sh  # API key pattern detection
```

## 🏗️ Secure Architecture Patterns

### **1. Credential Service Layer**
```typescript
// ✅ CORRECT: Centralized credential management
export class CredentialService {
  private vault: VaultService;
  
  async getCredentials(provider: string): Promise<any> {
    switch (provider) {
      case 'aws':
        return await this.vault.getAWSCredentials();
      case 'gcp':
        return await this.vault.getGCPCredentials();
      case 'azure':
        return await this.vault.getAzureCredentials();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
```

### **2. Configuration Without Secrets**
```typescript
// ✅ CORRECT: Configuration without secrets
export const config = {
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME,
    // ❌ WRONG: Never include password here
    // password: process.env.DB_PASSWORD  // Don't do this!
  },
  vault: {
    url: process.env.VAULT_ADDR,
    namespace: process.env.VAULT_NAMESPACE,
    mount: process.env.VAULT_MOUNT
  }
};
```

### **3. Secure API Integration**
```typescript
// ✅ CORRECT: Secure API client initialization
export class APIClient {
  private credentials: any;
  
  constructor(private vault: VaultService) {
    this.initializeCredentials();
  }
  
  private async initializeCredentials() {
    this.credentials = await this.vault.getOpenAICredentials();
  }
  
  async makeRequest(endpoint: string, data: any) {
    // Use credentials from vault, not environment
    return fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.credentials.apiKey}`
      },
      body: JSON.stringify(data)
    });
  }
}
```

## 🔧 Development Environment Setup

### **1. Local Development**
```bash
# ✅ CORRECT: Use local vault or environment
export VAULT_ADDR="http://localhost:8200"
export VAULT_TOKEN="your-local-vault-token"

# Start application
npm run dev
```

### **2. Production Deployment**
```bash
# ✅ CORRECT: Use production vault
export VAULT_ADDR="https://vault.company.com"
export VAULT_TOKEN="${VAULT_TOKEN_FROM_SECRET_MANAGER}"

# Deploy with vault integration
docker run -e VAULT_ADDR -e VAULT_TOKEN flowops:latest
```

### **3. CI/CD Integration**
```yaml
# ✅ CORRECT: GitHub Actions with vault
- name: Load credentials from Vault
  run: |
    export VAULT_ADDR="${{ secrets.VAULT_ADDR }}"
    export VAULT_TOKEN="${{ secrets.VAULT_TOKEN }}"
    npm run deploy
```

## 🚨 Incident Response

### **If Secrets Are Committed**
1. **Immediate Action**:
   ```bash
   # Remove from git history
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch filename_with_secrets'
   
   # Rotate all exposed secrets
   ./scripts/credential-manager.sh rotate all
   
   # Notify security team
   curl -X POST "${SECURITY_WEBHOOK}" -d '{"alert": "secret_exposed"}'
   ```

2. **Investigation**:
   - Identify all exposed secrets
   - Check git history for other exposures
   - Review access logs
   - Assess potential impact

3. **Remediation**:
   - Rotate all exposed credentials
   - Update vault with new credentials
   - Review and update security practices
   - Add additional pre-commit hooks

## 📋 Security Checklist

### **Development Checklist**
- [ ] No hardcoded secrets in code
- [ ] Using vault for credential management
- [ ] Pre-commit hooks installed and working
- [ ] Environment variables only for vault access
- [ ] No secrets in configuration files
- [ ] API keys loaded from vault at runtime
- [ ] Regular credential rotation implemented
- [ ] Security scanning in CI/CD pipeline

### **Deployment Checklist**
- [ ] Vault integration tested
- [ ] No secrets in Docker images
- [ ] Environment variables properly configured
- [ ] Security scanning passed
- [ ] Access logs enabled
- [ ] Monitoring for unauthorized access
- [ ] Backup and recovery procedures

### **Code Review Checklist**
- [ ] No secrets in code changes
- [ ] Proper vault usage verified
- [ ] Security best practices followed
- [ ] No hardcoded environment variables
- [ ] API key patterns checked
- [ ] Database connection strings secure
- [ ] Third-party integrations secure

## 🔒 Vault Integration Examples

### **AWS Integration**
```typescript
// ✅ CORRECT: AWS with vault
const awsCreds = await vault.getAWSCredentials();
const s3Client = new S3Client({
  region: awsCreds.region,
  credentials: {
    accessKeyId: awsCreds.accessKeyId,
    secretAccessKey: awsCreds.secretAccessKey
  }
});
```

### **GCP Integration**
```typescript
// ✅ CORRECT: GCP with vault
const gcpCreds = await vault.getGCPCredentials();
const auth = new GoogleAuth({
  credentials: gcpCreds.serviceAccountKey,
  projectId: gcpCreds.projectId
});
```

### **Azure Integration**
```typescript
// ✅ CORRECT: Azure with vault
const azureCreds = await vault.getAzureCredentials();
const client = new ClientSecretCredential(
  azureCreds.tenantId,
  azureCreds.clientId,
  azureCreds.clientSecret
);
```

### **OpenAI Integration**
```typescript
// ✅ CORRECT: OpenAI with vault
const openaiCreds = await vault.getOpenAICredentials();
const openai = new OpenAI({
  apiKey: openaiCreds.apiKey
});
```

## 📚 Additional Resources

### **Security Documentation**
- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [OWASP Secret Management](https://owasp.org/www-project-secret-management/)
- [Git Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

### **Security Tools**
- [Gitleaks](https://github.com/zricethezav/gitleaks)
- [Detect Secrets](https://github.com/Yelp/detect-secrets)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)

### **Training Resources**
- [Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices/)
- [Credential Management Best Practices](https://csrc.nist.gov/publications/detail/sp/800-63/rev-1)
- [DevSecOps Guidelines](https://owasp.org/www-project-devsecops-guideline/)

---

**Remember: Security is everyone's responsibility!** 🛡️

If you suspect a security issue:
1. **DO NOT** commit the fix
2. **IMMEDIATELY** notify the security team
3. **FOLLOW** the incident response procedure
4. **DOCUMENT** the issue and resolution
