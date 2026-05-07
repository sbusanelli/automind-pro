# FlowOps Credential Management Guide

## 🔐 Overview

FlowOps provides comprehensive credential management to ensure secure, automated rotation of all cloud provider and service credentials. This guide helps end-user teams easily manage and rotate credentials.

## 🎯 Supported Credentials

### **Cloud Providers**
- **AWS**: Access Key ID, Secret Access Key, Region
- **GCP**: Service Account Key, Project ID, Region
- **Azure**: Client ID, Client Secret, Tenant ID, Subscription ID

### **Services**
- **GitHub**: Personal Access Token, Username
- **OpenAI**: API Key for AI capabilities
- **Slack**: Webhook URL for notifications

## 🔄 Automated Rotation

### **GitHub Actions Automation**
```yaml
# Weekly automatic rotation (Sundays at 2 AM UTC)
schedule:
  - cron: '0 2 * * 0'

# Manual rotation trigger
workflow_dispatch:
  inputs:
    cloud_provider:
      description: 'Cloud provider to rotate'
      type: choice
      options: [all, aws, gcp, azure, github, openai]
```

### **Rotation Features**
- ✅ **Automated Detection**: Checks credential expiry/validity
- ✅ **Parallel Rotation**: Rotate multiple providers simultaneously
- ✅ **Validation**: Tests new credentials before deployment
- ✅ **Backup**: Creates secure backups before rotation
- ✅ **Notifications**: Sends alerts to Slack/email
- ✅ **Rollback**: Automatic rollback on validation failure

## 🛠️ Easy Credential Management

### **1. Quick Setup Script**
```bash
# Make the script executable
chmod +x scripts/credential-manager.sh

# Setup local environment
./scripts/credential-manager.sh setup

# This creates a .env.credentials file with template
```

### **2. Validate Credentials**
```bash
# Validate all credentials
./scripts/credential-manager.sh validate

# Validate specific provider
./scripts/credential-manager.sh validate aws
./scripts/credential-manager.sh validate gcp
./scripts/credential-manager.sh validate azure
```

### **3. Rotate Credentials**
```bash
# Rotate all credentials
./scripts/credential-manager.sh rotate

# Rotate specific provider
./scripts/credential-manager.sh rotate aws
./scripts/credential-manager.sh rotate gcp
./scripts/credential-manager.sh rotate azure
```

### **4. List Credential Status**
```bash
# Check status of all credentials
./scripts/credential-manager.sh list
```

## 📁 Credential Configuration

### **Environment Variables File**
Sensitive credential templates are now stored in encrypted form in `secrets/credentials.enc`.

To decrypt locally, use a secure key file that is kept out of source control:

```bash
openssl enc -aes-256-cbc -d -pbkdf2 -in secrets/credentials.enc -out .env.credentials -pass file=.credential-key
```

> Do not store plaintext secrets in documentation or repository history.

### **Encrypted Credentials Store**nThe repository includes an encrypted credentials artifact:
- `secrets/credentials.enc`: encrypted credentials template
- `.credential-key`: local decryption key (ignored by git)

Create `.env.credentials` from the decrypted file for local development.

## 🔧 GitHub Secrets Setup

### **Required GitHub Secrets**
```bash
# AWS Secrets
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGISTRY=123456789.dkr.ecr.us-west-2.amazonaws.com

# GCP Secrets
GCP_SERVICE_ACCOUNT_KEY=your_gcp_service_account_key
GCP_REGISTRY=us-central1-docker.pkg.dev/your-project/flowops

# Azure Secrets
AZURE_CREDENTIALS=your_azure_credentials
AZURE_REGISTRY_NAME=your_acr_name

# Service Secrets
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_api_key

# Notification Secrets
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### **Setting GitHub Secrets**
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each required secret from the list above
4. Ensure "Allow selected actions" is checked for CI/CD workflows

## 🚨 Security Best Practices

### **1. Principle of Least Privilege**
```json
{
  "iam_policies": {
    "aws": "PowerUserAccess with resource restrictions",
    "gcp": "Editor role with project restrictions", 
    "azure": "Contributor role with resource group restrictions"
  }
}
```

### **2. Credential Rotation Schedule**
- **Automatic**: Every 90 days
- **Warning**: 7 days before expiry
- **Emergency**: Manual rotation available anytime
- **Audit**: Complete rotation history maintained

### **3. Secure Storage**
```bash
# Credentials are never stored in code
# Always use environment variables or secret managers
# Backup credentials are encrypted
# Access logs are maintained
```

## 📊 Monitoring & Alerting

### **Credential Health Dashboard**
```yaml
# Grafana Dashboard Metrics
- Credential Age (days)
- Rotation Status
- Validation Results
- Failed Rotation Attempts
- Last Rotation Timestamp
```

### **Alert Configuration**
```json
{
  "alerts": {
    "credential_expiry": {
      "threshold": "7 days before expiry",
      "severity": "warning",
      "channels": ["slack", "email"]
    },
    "rotation_failure": {
      "threshold": "immediate",
      "severity": "critical", 
      "channels": ["slack", "email", "pagerduty"]
    },
    "validation_failure": {
      "threshold": "immediate",
      "severity": "error",
      "channels": ["slack", "email"]
    }
  }
}
```

## 🔄 Rotation Process

### **Automated Rotation Workflow**
1. **Check**: Validate current credentials
2. **Backup**: Create secure backup
3. **Generate**: Create new credentials
4. **Test**: Validate new credentials
5. **Deploy**: Update services with new credentials
6. **Verify**: Confirm services work with new credentials
7. **Cleanup**: Remove old credentials
8. **Notify**: Send success/failure notifications

### **Manual Rotation Process**
```bash
# Step 1: Backup current credentials
./scripts/credential-manager.sh backup

# Step 2: Rotate specific provider
./scripts/credential-manager.sh rotate aws

# Step 3: Validate new credentials
./scripts/credential-manager.sh validate aws

# Step 4: Update local environment
source .env.credentials
```

## 🚨 Emergency Procedures

### **Credential Compromise**
```bash
# Immediate rotation (force)
gh workflow run credential-rotation.yml \
  --field cloud_provider=all \
  --field force_rotation=true

# Or use local script
./scripts/credential-manager.sh rotate aws
./scripts/credential-manager.sh rotate gcp
./scripts/credential-manager.sh rotate azure
```

### **Service Outage**
```bash
# Check credential status
./scripts/credential-manager.sh list

# Validate all credentials
./scripts/credential-manager.sh validate

# Rotate if needed
./scripts/credential-manager.sh rotate
```

## 📚 Integration Examples

### **CI/CD Pipeline Integration**
```yaml
# .github/workflows/deploy.yml
- name: Validate Credentials
  run: |
    ./scripts/credential-manager.sh validate
    
- name: Deploy Application
  if: success()
  run: |
    # Deployment logic here
    
- name: Rotate Credentials on Failure
  if: failure()
  run: |
    ./scripts/credential-manager.sh rotate
```

### **Docker Integration**
```dockerfile
# Dockerfile
COPY scripts/credential-manager.sh /usr/local/bin/
COPY .env.credentials /app/.env.credentials

# Validate credentials at startup
RUN /usr/local/bin/credential-manager.sh validate
```

### **Kubernetes Integration**
```yaml
# kubernetes/secret-management.yaml
apiVersion: v1
kind: Secret
metadata:
  name: flowops-credentials
type: Opaque
data:
  # Base64 encoded credentials
  aws-access-key: QUtJQUlPU0lEX0FOTk5FWVhBTVBS...
  gcp-service-account: eyJ0eXBlIjoic2VydmljZV9hY2NvdW50I...
```

## 🔍 Troubleshooting

### **Common Issues**

#### **AWS Credentials Not Working**
```bash
# Check AWS CLI configuration
aws configure list

# Validate credentials
aws sts get-caller-identity

# Common fixes:
# 1. Check region setting
# 2. Verify IAM permissions
# 3. Ensure credentials are not expired
```

#### **GCP Service Account Issues**
```bash
# Check service account
gcloud auth activate-service-account --key-file=key.json

# Validate permissions
gcloud projects get-iam-policy PROJECT_ID

# Common fixes:
# 1. Check service account permissions
# 2. Verify project ID
# 3. Ensure key is not expired
```

#### **Azure Authentication Problems**
```bash
# Check Azure CLI login
az account show

# Validate service principal
az ad sp show --id <app-id>

# Common fixes:
# 1. Check tenant ID
# 2. Verify subscription access
# 3. Ensure service principal exists
```

### **Debug Mode**
```bash
# Enable debug logging
export DEBUG=true
./scripts/credential-manager.sh validate aws

# Check logs
tail -f ~/.flowops/logs/credential-manager.log
```

## 📞 Support

### **Getting Help**
```bash
# Show help
./scripts/credential-manager.sh help

# Check version
./scripts/credential-manager.sh --version

# Report issues
# Create GitHub issue with:
# - Provider name
# - Error message
# - Debug logs
# - Steps to reproduce
```

### **Contact Information**
- **Documentation**: https://docs.flowops.com/credentials
- **Issues**: https://github.com/sbusanelli/AutoMind/issues
- **Security**: security@flowops.com
- **Support**: support@flowops.com

---

**Easy credential management ensures secure, automated rotation for all FlowOps services!** 🔐
