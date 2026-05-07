# PMD Code Quality Analysis Guide

## 🔍 Overview

PMD (Project Management for Development) is a static code analysis tool used to identify potential problems in Java code. FlowOps uses PMD to ensure code quality, security compliance, and best practices.

## 🎯 PMD Configuration

### **Custom Ruleset**
FlowOps uses a custom PMD ruleset (`pmd-ruleset.xml`) that includes:

#### **Security Rules**
- **Hardcoded Credentials**: Detects hardcoded passwords, tokens, API keys
- **Vault Compliance**: Ensures proper vault integration for credential management
- **Logging Security**: Prevents logging of sensitive information
- **Resource Management**: Ensures proper resource cleanup

#### **Code Quality Rules**
- **Cyclomatic Complexity**: Identifies overly complex methods
- **Method Length**: Detects methods that are too long
- **Class Length**: Identifies classes that are too large
- **Unused Code**: Detects unused variables and methods

#### **Performance Rules**
- **String Concatenation**: Identifies inefficient string operations
- **Loop Performance**: Detects object instantiation in loops
- **Resource Management**: Ensures proper resource handling

#### **Error Prone Rules**
- **Empty Catch Blocks**: Detects empty exception handling
- **Missing Breaks**: Identifies missing break statements in switches
- **Resource Leaks**: Detects unclosed resources

## 🚀 Running PMD Analysis

### **1. Quick Analysis**
```bash
# Run basic PMD analysis
./scripts/run-pmd.sh analyze

# This will:
# - Run PMD with custom ruleset
# - Generate XML report
# - Show violation summary
# - Check quality gate
```

### **2. Detailed Analysis**
```bash
# Show detailed violations by priority
./scripts/run-pmd.sh detailed 1    # High priority only
./scripts/run-pmd.sh detailed 2    # High and medium
./scripts/run-pmd.sh detailed 3    # All priorities
```

### **3. Report Generation**
```bash
# Generate HTML report
./scripts/run-pmd.sh html

# Generate CSV report
./scripts/run-pmd.sh csv

# Run complete analysis
./scripts/run-pmd.sh all
```

## 📊 PMD Reports

### **XML Report** (`pmd-report.xml`)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<pmd version="6.55.0" timestamp="2024-01-17T10:30:00.000Z">
  <file name="src/main/java/FlowOpsApplication.java">
    <violation beginline="45" endline="45" begincolumn="20" endcolumn="50"
               rule="FlowOpsHardcodedCredentials" 
               ruleset="FlowOps_Custom_Rules" 
               priority="1" 
               externalInfoUrl="https://docs.flowops.com/security/credentials">
      <message><![CDATA[Avoid hardcoded credentials in FlowOps code]]></message>
    </violation>
  </file>
</pmd>
```

### **HTML Report** (`pmd-report.html`)
- Interactive web-based report
- Color-coded by priority
- Expandable violation details
- File navigation
- Rule descriptions

### **CSV Report** (`pmd-report.csv`)
```csv
file,line,rule,priority,message,externalInfoUrl
src/main/java/FlowOpsApplication.java,45,FlowOpsHardcodedCredentials,1,Avoid hardcoded credentials,https://docs.flowops.com/security/credentials
```

## 🎯 Quality Metrics

### **Violation Priorities**
- **Priority 1 (🔴 High)**: Security vulnerabilities, critical bugs
- **Priority 2 (🟡 Medium)**: Code quality issues, performance problems
- **Priority 3 (🟢 Low)**: Style issues, minor improvements

### **Quality Score Calculation**
```
Score = max(25, 100 - (violations * 5))

Quality Levels:
- 90-100: Excellent (0-2 violations)
- 75-89:  Good (3-5 violations)
- 50-74:  Fair (6-10 violations)
- 25-49:  Poor (11-20 violations)
- 0-24:  Very Poor (20+ violations)
```

### **Quality Gate**
```bash
# PMD will fail if:
- High priority violations > 0
- Total violations > 20

# Pass criteria:
- No high priority violations
- Total violations ≤ 20
```

## 🔧 PMD Integration

### **GitHub Actions Integration**
```yaml
# .github/workflows/pmd-analysis.yml
name: PMD Code Quality Analysis

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  pmd-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run PMD Analysis
        run: |
          ./scripts/run-pmd.sh analyze
      
      - name: Upload PMD Report
        uses: actions/upload-artifact@v3
        with:
          name: pmd-report
          path: pmd-report.xml
```

### **Pre-commit Integration**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: pmd
        name: 🔍 PMD Code Quality Check
        entry: ./scripts/run-pmd.sh analyze
        language: system
        files: \.java$
        pass_filenames:
          - \.java$
```

### **IDE Integration**
```bash
# VS Code
# Install PMD extension
ext install pmd.pmd

# IntelliJ IDEA
# Install PMD plugin
# File → Settings → Plugins → PMD Plugin
```

## 📋 PMD Rules for FlowOps

### **Custom FlowOps Rules**

#### **FlowOpsHardcodedCredentials**
```java
// ❌ Violation
String apiKey = "sk-1234567890abcdef";

// ✅ Correct
String apiKey = vaultService.getOpenAICredentials().apiKey;
```

#### **FlowOpsVaultCompliance**
```java
// ❌ Violation
String token = System.getenv("GITHUB_TOKEN");

// ✅ Correct
String token = vaultService.getGitHubCredentials().token;
```

#### **FlowOpsErrorHandling**
```java
// ❌ Violation
String secret = vault.readSecret("path/to/secret");

// ✅ Correct
try {
    String secret = vault.readSecret("path/to/secret");
} catch (VaultException e) {
    logger.error("Failed to read secret", e);
    throw new CredentialException("Vault access failed", e);
}
```

#### **FlowOpsLoggingSecurity**
```java
// ❌ Violation
logger.info("Using token: " + token);

// ✅ Correct
logger.info("Using token: " + maskCredential(token));
```

#### **FlowOpsResourceManagement**
```java
// ❌ Violation
VaultService vault = new VaultService(config);
String secret = vault.readSecret("path");

// ✅ Correct
try (VaultService vault = new VaultService(config)) {
    String secret = vault.readSecret("path");
}
```

## 🚨 Common PMD Violations

### **Security Violations**
1. **Hardcoded Credentials**
   - API keys, passwords, tokens
   - Database connection strings
   - Encryption keys

2. **Improper Error Handling**
   - Empty catch blocks
   - Unhandled exceptions
   - Missing resource cleanup

3. **Logging Issues**
   - Sensitive data in logs
   - Insufficient logging
   - Debug information in production

### **Code Quality Violations**
1. **Complexity Issues**
   - High cyclomatic complexity
   - Long methods and classes
   - Deep nesting

2. **Unused Code**
   - Unused variables, methods, imports
   - Dead code

3. **Performance Issues**
   - Inefficient string operations
   - Object creation in loops
   - Resource leaks

## 📚 PMD Best Practices

### **1. Rule Configuration**
```xml
<!-- pmd-ruleset.xml -->
<ruleset name="FlowOps_Custom_Rules">
    <!-- Include standard PMD rules -->
    <rule ref="category/java/security.xml/HardCodedPassword"/>
    <rule ref="category/java/design.xml/CyclomaticComplexity"/>
    
    <!-- Add custom rules -->
    <rule name="FlowOpsHardcodedCredentials"
          language="java"
          message="Avoid hardcoded credentials in FlowOps code"
          priority="1">
        <!-- Rule implementation -->
    </rule>
</ruleset>
```

### **2. Exclusion Patterns**
```bash
# Exclude test files, generated code, dependencies
--exclude-patterns="**/test/**,**/spec/**,**/target/**,**/node_modules/**"
```

### **3. Continuous Integration**
```yaml
# Quality gate in CI/CD
- name: PMD Quality Gate
  run: |
    ./scripts/run-pmd.sh analyze
    if [ $? -ne 0 ]; then
      echo "❌ Quality gate failed"
      exit 1
    fi
```

### **4. Local Development**
```bash
# Pre-commit hook
./scripts/run-pmd.sh analyze

# IDE integration
# PMD plugin will show violations in real-time
```

## 🔍 Troubleshooting

### **Common PMD Issues**

#### **PMD Not Running**
```bash
# Check PMD installation
pmd --version

# Install PMD if missing
wget https://github.com/pmd/pmd/releases/download/pmd/6.55.0/pmd-bin-6.55.0.zip
unzip pmd-bin-6.55.0.zip
```

#### **False Positives**
```xml
<!-- Suppress false positives -->
<suppress checks="FlowOpsHardcodedCredentials" 
           files="**/test/**"
           annotation="False positive - test data"/>
```

#### **Performance Issues**
```bash
# Use PMD cache
--no-cache

# Limit analysis scope
-d src/main/java

# Exclude large directories
--exclude-patterns="**/generated/**"
```

### **Debug Mode**
```bash
# Enable verbose output
--verbose

# Show rule execution
--debug

# Generate detailed report
--report-file pmd-detailed.xml
```

## 📈 PMD Metrics Dashboard

### **Key Metrics**
- **Violations by Priority**: High/Medium/Low distribution
- **Violations by Rule**: Most frequently violated rules
- **Violations by File**: Files with most violations
- **Quality Score**: Overall code quality score
- **Trend Analysis**: Quality improvement over time

### **Quality Targets**
- **Zero High Priority Violations**: Security and critical issues
- **< 10 Total Violations**: Maintain code quality
- **> 85 Quality Score**: High code quality standard
- **100% Test Coverage**: Comprehensive testing

---

**PMD analysis ensures FlowOps maintains high code quality and security standards!** 🔍
