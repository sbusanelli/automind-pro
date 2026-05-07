# AutoMind Architecture Overview

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[AutoMind Frontend<br/>React 18 + TypeScript]
        C[Mobile App<br/>React Native]
    end
    
    subgraph "API Gateway"
        D[Load Balancer]
        E[API Gateway<br/>Express.js]
        F[Rate Limiting<br/>Bull Queue]
    end
    
    subgraph "Service Layer"
        G[AI Service<br/>OpenAI Integration]
        H[Metrics Service<br/>System Monitoring]
        I[Auth Service<br/>JWT + OAuth]
        J[Chat Service<br/>WebSocket Support]
    end
    
    subgraph "Data Layer"
        K[PostgreSQL<br/>Primary Database]
        L[Redis<br/>Cache + Queue]
        M[In-Memory Cache<br/>Session Storage]
    end
    
    subgraph "Infrastructure"
        N[Docker Containers]
        O[Kubernetes Cluster]
        P[GitHub Actions<br/>CI/CD Pipeline]
        Q[Prometheus + Grafana<br/>Monitoring Stack]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    G --> K
    H --> L
    I --> M
    J --> M
    K --> N
    L --> N
    M --> N
    N --> O
    O --> P
    P --> Q
```

## 🎯 Core Components

### Frontend Architecture
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for state management
- **Socket.io Client** for real-time updates
- **Lucide React** for icons

### Backend Architecture
- **Express.js** REST API
- **TypeScript** for type safety
- **JWT Authentication** with role-based access
- **Redis** for caching and job queues
- **PostgreSQL** for persistent data
- **Socket.io** for WebSocket connections

### Data Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant AI as AI Service
    participant DB as Database
    participant Cache as Redis
    
    U->>F: Sends message
    F->>A: POST /api/ai/chat
    A->>AI: Forwards request
    AI->>OpenAI: API Call
    OpenAI-->>AI: AI Response
    AI->>Cache: Store conversation
    AI->>A: Return response
    A->>F: WebSocket update
    F->>U: Display response
```

## 🔧 Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|-------------|---------|---------|
| React | 18.2.0 | UI Framework |
| TypeScript | 5.2.2 | Type Safety |
| Tailwind CSS | 3.3.0 | Styling |
| React Query | 5.56.0 | State Management |
| Axios | 1.15.0 | HTTP Client |
| Socket.io Client | 4.7.0 | Real-time |
| Lucide React | 1.14.0 | Icons |

### Backend Technologies
| Technology | Version | Purpose |
|-------------|---------|---------|
| Node.js | 20.12.2 | Runtime |
| Express.js | 4.21.0 | Web Framework |
| TypeScript | 5.2.2 | Type Safety |
| PostgreSQL | 8.11.0 | Database |
| Redis | 4.6.0 | Cache/Queue |
| Socket.io | 4.7.0 | WebSocket |
| JWT | 9.0.3 | Authentication |
| Bull Queue | 4.11.0 | Job Queue |
| Winston | 3.11.0 | Logging |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-------------|---------|
| Containerization | Docker | Application Packaging |
| Orchestration | Kubernetes | Container Management |
| CI/CD | GitHub Actions | Automated Deployment |
| Monitoring | Prometheus + Grafana | Metrics & Alerting |
| Logging | Winston + ELK Stack | Log Aggregation |

## 🔄 Data Flow Architecture

### Request Flow
1. **User Request** → Frontend (React)
2. **API Call** → API Gateway (Express)
3. **Authentication** → JWT Validation
4. **Rate Limiting** → Redis Queue Check
5. **AI Processing** → AI Service (OpenAI Integration)
6. **Response Caching** → Redis Storage
7. **Real-time Updates** → WebSocket Broadcast
8. **Data Persistence** → PostgreSQL Storage

### Caching Strategy
- **L1 Cache**: In-memory (sessions, temporary data)
- **L2 Cache**: Redis (API responses, user preferences)
- **Cache Invalidation**: TTL-based (5 minutes for API, 1 hour for user data)

### Database Schema
```mermaid
erDiagram
    USERS ||--o{ CONVERSATIONS }
    USERS ||--o{ USER_SESSIONS }
    CONVERSATIONS ||--o{ MESSAGES }
    CONVERSATIONS ||--o{ AI_INSIGHTS }
    MESSAGES ||--o{ MESSAGE_ATTACHMENTS }
    
    USERS {
        uuid PK
        email UK
        password_hash
        role
        created_at
        updated_at
    }
    
    CONVERSATIONS {
        uuid PK
        user_id FK
        title
        created_at
        updated_at
    }
    
    MESSAGES {
        uuid PK
        conversation_id FK
        type
        content
        timestamp
        ai_metadata
    }
```

## 🚀 Deployment Architecture

### Development Environment
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/automind
      - REDIS_URL=redis://redis:6379
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=automind
      - POSTGRES_USER=automind
      - POSTGRES_PASSWORD=password
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Production Environment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: automind-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: automind-frontend
  template:
    metadata:
      labels:
        app: automind-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/sbusanelli/automind-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: API_URL
          value: "https://api.automind.ai"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: automind-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: automind-backend
  template:
    metadata:
      labels:
        app: automind-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/sbusanelli/automind-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: redis-url
```

## 🔒 Security Architecture

### Authentication Flow
```mermaid
graph LR
    A[User Login] --> B[JWT Token Request]
    B --> C[Credentials Validation]
    C --> D[Token Generation]
    D --> E[Token Response]
    E --> F[Token Storage]
    F --> G[Authenticated Requests]
    G --> H[Role-based Access Control]
```

### Security Layers
1. **Network Security**: HTTPS, CORS, Rate Limiting
2. **Application Security**: JWT Authentication, Input Validation, SQL Injection Prevention
3. **Data Security**: Encrypted passwords, Secure headers, Environment variables
4. **Infrastructure Security**: Docker security scanning, Kubernetes RBAC

## 📊 Monitoring & Observability

### Metrics Collection
- **Application Metrics**: Response times, error rates, user activity
- **Infrastructure Metrics**: CPU, Memory, Disk, Network
- **Business Metrics**: AI usage, conversation length, user engagement

### Alerting Strategy
- **Critical**: System downtime, authentication failures
- **Warning**: High response times, error rate spikes
- **Info**: Deployments, feature usage

### Logging Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend    │    │    Backend     │    │   Database      │
│   (Winston)   │───►│   (Winston)   │───►│   (PostgreSQL)  │
│               │    │               │    │               │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                              │
                    ┌─────────────────┐
                    │  ELK Stack     │
                    │ (Logstash +     │
                    │  Elasticsearch)│
                    └─────────────────┘
```

## 🚀 Scalability Considerations

### Horizontal Scaling
- **Frontend**: Load balancer with multiple instances
- **Backend**: Node.js clustering + container orchestration
- **Database**: Read replicas + connection pooling
- **Cache**: Redis clustering for high availability

### Performance Optimizations
- **Frontend**: Code splitting, lazy loading, memoization
- **Backend**: Response caching, query optimization, connection pooling
- **Database**: Indexing strategy, query optimization, connection limits

## 🔄 Development Workflow

### Git Workflow
```mermaid
gitGraph
    commit id: "feat"
    branch main
    checkout develop
    commit id: "feat"
    checkout feature/new-feature
    commit id: "feat"
    checkout main
    merge feature/new-feature
    commit id: "chore"
    checkout main
    merge develop
    commit id: "release"
    tag v1.0.0
```

### CI/CD Pipeline
1. **Code Quality**: ESLint, Prettier, TypeScript checks
2. **Testing**: Unit, Integration, E2E tests
3. **Security**: npm audit, SAST scanning
4. **Build**: Docker image creation, optimization
5. **Deploy**: Kubernetes deployment, health checks
6. **Monitor**: Rollback monitoring, performance tracking

## 📁 Project Structure

```
automind/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript definitions
│   ├── public/              # Static assets
│   └── tests/              # Test files
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/          # Data models
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration files
│   │   └── utils/          # Utility functions
│   ├── tests/              # Test files
│   └── dist/               # Compiled JavaScript
├── docs/                     # Documentation
│   ├── diagrams/           # Architecture diagrams
│   ├── api/               # API documentation
│   └── deployment/         # Deployment guides
├── infrastructure/            # Infrastructure as code
│   ├── docker/            # Docker configurations
│   ├── kubernetes/        # K8s manifests
│   └── terraform/         # Infrastructure provisioning
├── scripts/                  # Automation scripts
└── .github/                  # GitHub workflows
```

This architecture provides a solid foundation for the AutoMind AI Assistant with clear separation of concerns, scalability considerations, and comprehensive monitoring capabilities.
