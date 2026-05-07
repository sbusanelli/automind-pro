# AutoMind Project Structure

## 📁 Directory Overview

This document provides a visual guide to the AutoMind repository structure, helping new developers quickly understand the codebase organization.

### Root Level Organization

```
automind/
├── backend/               # Node.js/Express backend services
├── frontend/              # React web application
├── infrastructure/        # Deployment and infrastructure configs
├── scripts/               # Utility and automation scripts
├── docs/                  # Project documentation
├── security/              # Security scanning configs
└── wiki/                  # Additional project wiki pages
```

---

## 🏗️ Backend Structure (`backend/`)

The backend implements a zero-trust security architecture with autonomous AI operations.

```
backend/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── simple-index.ts       # Simplified entry point
│   ├── config/
│   │   └── zeroTrustConfig.ts    # Zero-trust security configuration
│   ├── controllers/
│   │   ├── aiController.ts       # AI operations endpoints
│   │   └── zeroTrustController.ts # Security policy controllers
│   ├── middleware/
│   │   └── zeroTrustMiddleware.ts # Security validation middleware
│   ├── models/
│   │   └── Job.ts                # Job data model
│   ├── routes/
│   │   └── zeroTrustRoutes.ts    # API routes
│   ├── services/
│   │   ├── aiService.ts          # AI/ML service layer
│   │   ├── credentialService.ts  # Credential management
│   │   ├── vaultService.ts       # Vault integration (Secrets)
│   │   └── zeroTrustService.ts   # Zero-trust policy service
│   ├── utils/                    # Helper utilities
│   └── tests/
│       ├── setup.ts              # Test configuration
│       ├── unit/                 # Unit tests
│       ├── integration/          # Integration tests
│       └── e2e/                  # End-to-end tests
├── dist/                    # Compiled JavaScript (generated)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── jest.config.js           # Jest test configuration
```

### Key Backend Technologies
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Queue**: Bull (job queue)
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS, Rate limiting

---

## 🎨 Frontend Structure (`frontend/`)

Modern React application with TypeScript for AI operations dashboard.

```
frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Layout/
│   │   ├── Dashboard/
│   │   ├── Forms/
│   │   └── Common/
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global styles
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── dist/                   # Built output (generated)
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite build configuration
```

### Key Frontend Technologies
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Real-time**: Socket.IO client

---

## 🐳 Infrastructure (`infrastructure/`)

### Docker Configuration
```
infrastructure/docker/
├── Dockerfile.backend      # Backend container image
├── Dockerfile.frontend     # Frontend container image
├── Dockerfile.dev.backend  # Development backend image
├── Dockerfile.dev.frontend # Development frontend image
├── Dockerfile.multi        # Multi-stage build example
├── docker-compose.yml      # Production composition
├── docker-compose.dev.yml  # Development composition
├── nginx.conf              # Nginx reverse proxy config
├── health-check.sh         # Container health checks
├── entrypoint.sh           # Container startup script
└── init.sql/               # Database initialization
```

### Kubernetes Configuration
```
infrastructure/kubernetes/
├── namespace.yaml          # Kubernetes namespace
├── service-account.yaml    # Service accounts
├── configmap.yaml          # Configuration maps
├── secret.yaml             # Secrets management
├── backend.yaml            # Backend deployment
├── frontend.yaml           # Frontend deployment
├── postgres.yaml           # PostgreSQL statefulset
├── redis.yaml              # Redis deployment
├── ingress.yaml            # Ingress routing
├── network-policy.yaml     # Network policies
├── hpa.yaml                # Horizontal pod autoscaling
├── monitoring.yaml         # Prometheus/Grafana
├── kustomization.yaml      # Kustomize configuration
├── overlays/               # Environment-specific overlays
└── patches/                # Kustomize patches
```

### AWS CloudFormation
```
infrastructure/aws/
├── cloudformation.yml      # Core infrastructure
├── eks-cloudformation.yml  # EKS cluster setup
└── iam-roles.yaml          # IAM roles and policies
```

---

## 📚 Documentation (`docs/`)

```
docs/
├── project-structure.md              # This file
├── zero-trust-architecture.md        # Security design
├── credential-management.md          # Secret management
├── security-best-practices.md        # Security guidelines
├── security-vulnerability-management.md # CVE handling
├── multi-cloud-deployment.md         # Deployment guides
├── testing-guide.md                  # Test strategies
├── pre-commit-hooks.md               # Git hooks setup
└── pmd-analysis-guide.md             # Code quality analysis
```

---

## 🔐 Security (`security/`)

```
security/
├── sast-config.yml        # Static analysis security testing
└── dast-config.yml        # Dynamic analysis security testing
```

---

## 🛠️ Scripts (`scripts/`)

Automated scripts for development, deployment, and security:

```
scripts/
├── setup-pre-commit.sh           # Initialize git hooks
├── check-vault-compliance.sh     # Verify secret management
├── check-sensitive-files.sh      # Scan for exposed secrets
├── check-hardcoded-env.sh        # Find hardcoded env vars
├── check-api-key-patterns.sh     # Detect exposed API keys
├── check-file-permissions.sh     # Verify file permissions
├── check-commit-message.sh       # Validate commit messages
├── credential-manager.sh         # Manage credentials
├── security-fix.sh               # Apply security patches
├── run-pmd.sh                    # Run code quality checks
└── build-and-push.sh             # Build and push Docker images
```

---

## 📦 Data Flow

### Request Flow
```
User (Browser)
    ↓
Nginx (Reverse Proxy)
    ↓
Frontend (React + Vite)
    ↓ HTTP/WebSocket
Backend API (Express + Node.js)
    ↓
Services Layer (AI, Auth, Credentials, Vault)
    ↓
Database (PostgreSQL) + Cache (Redis)
    ↓
Message Queue (Bull Queue)
    ↓
Background Jobs & Notifications
```

---

## 🔄 Development Workflow

### Environment Setup
1. **Backend**: Node.js + npm + TypeScript
2. **Frontend**: Node.js + npm + React
3. **Database**: PostgreSQL
4. **Cache**: Redis
5. **Containers**: Docker + Docker Compose

### Local Development
```bash
# Backend development
cd backend
npm install
npm run dev          # Runs with nodemon

# Frontend development
cd frontend
npm install
npm run dev          # Runs with Vite

# Full stack with Docker
docker-compose -f infrastructure/docker/docker-compose.dev.yml up
```

### Testing
```bash
# Backend tests
npm run test          # Run all tests
npm run test:unit     # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e      # End-to-end tests

# Frontend tests
npm run test          # Jest tests
npm run test:watch    # Watch mode
```

---

## 🚀 Deployment Paths

### Docker Compose
- **Development**: `docker-compose.dev.yml`
- **Production**: `docker-compose.yml`

### Kubernetes
- Multi-environment support via Kustomize
- Monitoring with Prometheus/Grafana
- Auto-scaling via HPA

### Cloud Platforms
- **AWS**: CloudFormation + EKS
- **Multi-cloud**: Portable across clouds

---

## 📊 Database Schema

### Key Tables
- **users**: User accounts and authentication
- **jobs**: Job execution records
- **credentials**: Encrypted credential storage
- **ai_models**: ML model metadata
- **audit_logs**: Compliance audit trail
- **configurations**: System settings

### Caching Layer
- Redis for session data
- Cache for frequently accessed data
- Bull Queue for async jobs

---

## 🔗 Key Integration Points

### External Services
- **OpenAI API**: AI model inference
- **Cloud Providers**: AWS, Azure, GCP (via infrastructure)
- **Vault Integration**: Secret management
- **Monitoring Stack**: Prometheus + Grafana

---

## 📖 For New Developers

### Getting Started
1. Read [README.md](../README.md) - Project overview
2. Read this file - Understand structure
3. Check [testing-guide.md](./testing-guide.md) - Test patterns
4. Review [security-best-practices.md](./security-best-practices.md) - Security guidelines
5. Set up pre-commit hooks: `./scripts/setup-pre-commit.sh`

### Common Tasks
- **Add new API endpoint**: Modify `backend/src/routes/` and `backend/src/controllers/`
- **Add new UI component**: Create in `frontend/src/components/`
- **Add database table**: Update schema and add migrations
- **Update dependencies**: Use `npm audit fix` and test
- **Run security checks**: Use scripts in `scripts/` directory

### Key Commands
```bash
# Backend
npm run build          # Compile TypeScript
npm run lint           # Run ESLint
npm run type-check     # TypeScript validation

# Frontend
npm run build          # Build for production
npm run lint           # ESLint checks

# Docker
docker-compose build   # Build images
docker-compose up      # Start services
```

---

## 🎯 Architecture Highlights

### Zero-Trust Security
- JWT token-based authentication
- Request validation at every layer
- Credential encryption
- Vault integration for secrets
- Security headers via Helmet
- CORS configuration
- Rate limiting

### AI/ML Integration
- OpenAI API integration
- ML model management
- Predictive analytics pipeline
- Automated remediation

### Scalability
- Horizontal scaling via containers
- Redis caching layer
- Database connection pooling
- Message queue for async processing
- Load balancing via Nginx

### Monitoring & Logging
- Winston logging
- Prometheus metrics
- Grafana dashboards
- ELK stack for centralized logging
- Audit trail for compliance

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on submitting changes.

---

## 📞 Questions?

Refer to the [wiki](../wiki/) for additional documentation or check specific doc files for detailed information.
