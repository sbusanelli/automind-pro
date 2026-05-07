# OpenCode AI Code Review Setup

This document explains how to set up and use OpenCode AI for automated code reviews in the AutoMind project.

## Overview

OpenCode is an AI-powered code review agent that integrates with GitHub Actions to provide intelligent code analysis, security reviews, and improvement suggestions.

## Installation

### 1. Install OpenCode GitHub App

1. Visit [github.com/apps/opencode-agent](https://github.com/apps/opencode-agent)
2. Click "Install" and select the AutoMind repository
3. Grant necessary permissions for the app to operate

### 2. Configure API Keys

In your GitHub repository settings:

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Add the following secrets:

#### Required Secrets
- **ANTHROPIC_API_KEY**: Your Anthropic API key for Claude models
  - Get from: [console.anthropic.com](https://console.anthropic.com)
  - Required for: Claude Sonnet, Claude Haiku models

#### Optional Secrets
- **OPENAI_API_KEY**: Your OpenAI API key for GPT models
  - Get from: [platform.openai.com](https://platform.openai.com)
  - Required for: GPT-4o, GPT-4o-mini models

### 3. Workflow Configuration

The OpenCode workflow is already configured in `.github/workflows/opencode.yml` with:

- **Triggers**: PR comments, new PRs, manual dispatch
- **Models**: Claude Sonnet 4 (default), Claude Haiku, GPT-4o
- **Permissions**: Proper GitHub token permissions
- **Artifacts**: Log collection for debugging

## Usage

### Triggering OpenCode Reviews

#### 1. Comment Triggers (Recommended)

On any pull request, comment:

```
/opencode        # Full AI review
/oc              # Quick review
/opencode security    # Security-focused review
/opencode performance  # Performance review
/opencode architecture # Architecture review
```

#### 2. Custom Prompts

```
/opencode Review the authentication logic for security issues
/oc Check for TypeScript type safety issues
/opencode performance Analyze database query efficiency
```

#### 3. Automatic Reviews

OpenCode automatically runs on:
- New pull requests (basic review)
- Manual workflow dispatch (customizable)

#### 4. Manual Trigger

1. Go to **Actions** tab
2. Select **OpenCode AI Code Review** workflow
3. Click **Run workflow**
4. Choose model and custom prompt (optional)

## Configuration

### Model Selection

Available models:
- `anthropic/claude-sonnet-4-20250514` (default, best quality)
- `anthropic/claude-3-haiku-20240307` (fast, cost-effective)
- `openai/gpt-4o` (balanced)
- `openai/gpt-4o-mini` (fast, cheap)

### Custom Prompts

The `.opencode.yml` file contains specialized prompts for:

- **General Review**: Code quality, security, performance, architecture
- **Security Review**: Vulnerabilities, authentication, input validation
- **Performance Review**: Optimization, memory usage, efficiency
- **Architecture Review**: Design patterns, scalability, maintainability

### File Filtering

OpenCode reviews:
- **Included**: TypeScript, JavaScript, JSON, YAML, Docker files
- **Excluded**: node_modules, dist, build, coverage, vendor

## Features

### Code Analysis

- **Type Safety**: TypeScript type checking and suggestions
- **Security**: Vulnerability detection and remediation
- **Performance**: Optimization opportunities
- **Best Practices**: Code style and pattern recommendations
- **Documentation**: Missing docs and comment improvements

### Integration Benefits

- **PR Comments**: Detailed feedback directly in pull requests
- **Status Checks**: Automated review status indicators
- **Label Suggestions**: Automatic PR labeling based on issues found
- **Log Collection**: Debugging information in workflow artifacts

### AutoMind Specific

OpenCode is configured for AutoMind's tech stack:
- **Node.js/TypeScript**: Runtime and type safety
- **React**: Frontend component analysis
- **Docker**: Container optimization
- **Kubernetes**: Deployment configuration
- **PostgreSQL**: Database query analysis

## Troubleshooting

### Common Issues

#### 1. "Secret not found" Error
- **Cause**: Missing API key in repository secrets
- **Fix**: Add ANTHROPIC_API_KEY or OPENAI_API_KEY to repository secrets

#### 2. "Permission denied" Error
- **Cause**: Insufficient GitHub app permissions
- **Fix**: Reinstall OpenCode app with proper permissions

#### 3. No Review Generated
- **Cause**: API key issues or rate limits
- **Fix**: Check API key validity and usage limits

#### 4. Workflow Fails
- **Cause**: Invalid configuration or syntax errors
- **Fix**: Check workflow YAML syntax and OpenCode parameters

### Debugging

1. **Check Workflow Logs**: Go to Actions tab > OpenCode workflow
2. **Review Artifacts**: Download `opencode-logs` artifact
3. **Verify Secrets**: Ensure API keys are correctly set
4. **Test Manually**: Use workflow dispatch for testing

## Best Practices

### For Developers

1. **Use Specific Comments**: Be specific in your `/opencode` requests
2. **Review Suggestions**: Carefully review AI recommendations
3. **Test Changes**: Validate suggested code improvements
4. **Provide Context**: Include relevant context in custom prompts

### For Repository Maintainers

1. **Monitor API Usage**: Track API key usage and costs
2. **Review Configuration**: Regularly update prompts and rules
3. **Train Team**: Educate team on effective usage
4. **Feedback Loop**: Use AI insights to improve code quality

### Cost Optimization

1. **Use Haiku for Quick Reviews**: `/oc` uses faster, cheaper models
2. **Target Specific Files**: Focus reviews on changed files only
3. **Custom Prompts**: Use specific prompts to reduce token usage
4. **Scheduled Reviews**: Use cost-effective models for automated reviews

## Security Considerations

- **API Keys**: Never commit API keys to repository
- **Code Privacy**: OpenCode shares sessions for public repos
- **Access Control**: Limit who can trigger reviews
- **Audit Logs**: Monitor OpenCode activity and usage

## Support

- **OpenCode Docs**: [open-code.ai](https://open-code.ai)
- **GitHub Issues**: Report issues in OpenCode repository
- **Community**: Join OpenCode Discord for support
- **AutoMind Project**: Create issues for AutoMind-specific questions

## Examples

### Example 1: Security Review
```
/opencode security
```
Output: Detailed security analysis with vulnerability reports and remediation steps.

### Example 2: Performance Review
```
/oc performance Analyze the database queries in the API routes
```
Output: Query optimization suggestions with performance impact estimates.

### Example 3: Architecture Review
```
/opencode architecture Review the microservice communication patterns
```
Output: Architecture assessment with scalability and maintainability recommendations.

---

*This setup helps maintain code quality, security, and performance standards for the AutoMind project through AI-assisted code reviews.*
