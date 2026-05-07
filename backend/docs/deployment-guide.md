# AutoMind Deployment Guide - Latest Architecture

## Overview
This guide covers the deployment of the enhanced AutoMind system with vector database integration, knowledge synchronization, and autonomous operations capabilities.

## 🏗️ System Architecture

### Component Overview
```
┌─────────────────────────────────────────────────────────────┐
│                    AutoMind System                           │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer                                            │
│  ├─ React Dashboard                                        │
│  ├─ Real-time UI Updates                                   │
│  └─ Mobile Support (Planned)                              │
├─────────────────────────────────────────────────────────────┤
│  API Gateway & Load Balancer                               │
│  ├─ Authentication & Authorization                         │
│  ├─ Rate Limiting & Throttling                             │
│  ├─ Request Routing                                        │
│  └─ Response Caching                                       │
├─────────────────────────────────────────────────────────────┤
│  Core Services                                             │
│  ├─ Job Management Service                                 │
│  ├─ Conversation Service                                   │
│  ├─ Knowledge Service                                      │
│  ├─ Vector Service (NEW)                                  │
│  ├─ Document Processor (NEW)                              │
│  └─ Knowledge Sync Service (NEW)                           │
├─────────────────────────────────────────────────────────────┤
│  Autonomous Layer (NEW)                                    │
│  ├─ Self-Healing Service                                   │
│  ├─ Adaptive Decision Engine                               │
│  ├─ Predictive Maintenance                                │
│  └─ Learning System                                       │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├─ PostgreSQL (Primary DB)                               │
│  ├─ Redis (Cache & Session)                               │
│  ├─ Pinecone (Vector DB)                                  │
│  ├─ File Storage (Documents)                             │
│  └─ Message Queue (Events)                               │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure                                            │
│  ├─ Kubernetes Cluster                                     │
│  ├─ Service Mesh (Istio)                                  │
│  ├─ Monitoring (Prometheus + Grafana)                     │
│  ├─ Logging (ELK Stack)                                  │
│  └─ CI/CD Pipeline                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Prerequisites

### Infrastructure Requirements
```yaml
# Kubernetes Cluster Requirements
cluster:
  version: ">=1.24"
  nodes: 3 minimum (5 recommended)
  cpu: "4 cores per node minimum"
  memory: "16GB per node minimum"
  storage: "100GB SSD per node minimum"

# External Services
externalServices:
  pinecone:
    plan: "Standard or Enterprise"
    indexes: 3 minimum (conversations, knowledge, jobs)
    dimensions: 1024
  postgresql:
    version: ">=13"
    storage: "100GB minimum"
    replication: true
  redis:
    version: ">=6"
    memory: "4GB minimum"
    clustering: true
```

### Software Requirements
```bash
# Required Tools
kubectl >= 1.24
helm >= 3.8
docker >= 20.10
node >= 18.0
npm >= 8.0

# Optional Tools
istioctl >= 1.15
kustomize >= 4.5
skaffold >= 2.0
```

## 📦 Container Images

### Core Services
```dockerfile
# AutoMind Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Vector Service
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "run", "vector-service"]

# Knowledge Sync Service
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "run", "knowledge-sync"]
```

### Build Pipeline
```yaml
# Docker Compose for Development
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - DATABASE_URL=postgresql://user:pass@postgres:5432/automind
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: automind
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## ☸️ Kubernetes Deployment

### Namespace Configuration
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: automind
  labels:
    name: automind
    environment: production
```

### ConfigMaps
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: automind-config
  namespace: automind
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "5000"
  
  # Database Configuration
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "automind"
  
  # Redis Configuration
  REDIS_HOST: "redis-service"
  REDIS_PORT: "6379"
  
  # Vector Service Configuration
  VECTOR_DIMENSION: "1024"
  EMBEDDING_BATCH_SIZE: "100"
  SEARCH_TOP_K: "10"
  
  # Knowledge Sync Configuration
  KNOWLEDGE_DIR: "/app/knowledge-docs"
  SYNC_INTERVAL: "60000"
  BATCH_SIZE: "50"
  ENABLE_AUTO_SYNC: "true"
```

### Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: automind-secrets
  namespace: automind
type: Opaque
data:
  # Base64 encoded values
  DATABASE_PASSWORD: <base64-encoded-password>
  REDIS_PASSWORD: <base64-encoded-password>
  PINECONE_API_KEY: <base64-encoded-api-key>
  JWT_SECRET: <base64-encoded-jwt-secret>
```

### Backend Service Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: automind-backend
  namespace: automind
  labels:
    app: automind-backend
spec:
  replicas: 3
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
        image: automind/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: automind-config
              key: NODE_ENV
        - name: DATABASE_URL
          value: "postgresql://$(DATABASE_USER):$(DATABASE_PASSWORD)@$(DATABASE_HOST):$(DATABASE_PORT)/$(DATABASE_NAME)"
        - name: REDIS_URL
          value: "redis://$(REDIS_USER):$(REDIS_PASSWORD)@$(REDIS_HOST):$(REDIS_PORT)"
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: PINECONE_API_KEY
        envFrom:
        - configMapRef:
            name: automind-config
        - secretRef:
            name: automind-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: automind-backend-service
  namespace: automind
spec:
  selector:
    app: automind-backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

### Vector Service Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vector-service
  namespace: automind
  labels:
    app: vector-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vector-service
  template:
    metadata:
      labels:
        app: vector-service
    spec:
      containers:
      - name: vector-service
        image: automind/vector-service:latest
        ports:
        - containerPort: 5001
        env:
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: PINECONE_API_KEY
        - name: PINECONE_ENV
          value: "us-west1-gcp-free"
        envFrom:
        - configMapRef:
            name: automind-config
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: vector-service
  namespace: automind
spec:
  selector:
    app: vector-service
  ports:
  - protocol: TCP
    port: 5001
    targetPort: 5001
  type: ClusterIP
```

### Knowledge Sync Service Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: knowledge-sync-service
  namespace: automind
  labels:
    app: knowledge-sync-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: knowledge-sync-service
  template:
    metadata:
      labels:
        app: knowledge-sync-service
    spec:
      containers:
      - name: knowledge-sync
        image: automind/knowledge-sync:latest
        env:
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: PINECONE_API_KEY
        envFrom:
        - configMapRef:
            name: automind-config
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: knowledge-storage
          mountPath: /app/knowledge-docs
      volumes:
      - name: knowledge-storage
        persistentVolumeClaim:
          claimName: knowledge-docs-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: knowledge-docs-pvc
  namespace: automind
spec:
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

### Database Deployments
```yaml
# PostgreSQL
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: automind
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: automind
        - name: POSTGRES_USER
          value: automind
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: DATABASE_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "2Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "1000m"
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc

---
# Redis
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: automind
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command:
        - redis-server
        - --appendonly
        - "yes"
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: automind-secrets
              key: REDIS_PASSWORD
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "1Gi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "500m"
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
```

## 🔧 Service Mesh (Istio)

### Gateway Configuration
```yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: automind-gateway
  namespace: automind
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - automind.example.com
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: automind-tls
    hosts:
    - automind.example.com
```

### Virtual Services
```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: automind-vs
  namespace: automind
spec:
  hosts:
  - automind.example.com
  gateways:
  - automind-gateway
  http:
  - match:
    - uri:
        prefix: /api
    route:
    - destination:
        host: automind-backend-service
        port:
          number: 5000
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  - match:
    - uri:
        prefix: /api/vector
    route:
    - destination:
        host: vector-service
        port:
          number: 5001
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
```

### Destination Rules
```yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: automind-dr
  namespace: automind
spec:
  host: automind-backend-service
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
```

## 📊 Monitoring & Observability

### Prometheus Configuration
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'automind-backend'
      static_configs:
      - targets: ['automind-backend-service:5000']
      metrics_path: /metrics
    - job_name: 'vector-service'
      static_configs:
      - targets: ['vector-service:5001']
      metrics_path: /metrics
    - job_name: 'knowledge-sync'
      static_configs:
      - targets: ['knowledge-sync-service:5002']
      metrics_path: /metrics
```

### Grafana Dashboards
```json
{
  "dashboard": {
    "title": "AutoMind System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Vector Operations",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(vector_upsert_total[5m])",
            "legendFormat": "Upserts/sec"
          },
          {
            "expr": "rate(vector_search_total[5m])",
            "legendFormat": "Searches/sec"
          }
        ]
      },
      {
        "title": "Knowledge Sync Status",
        "type": "stat",
        "targets": [
          {
            "expr": "knowledge_sync_documents_total",
            "legendFormat": "Total Documents"
          }
        ]
      }
    ]
  }
}
```

### Alerting Rules
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: automind-alerts
  namespace: monitoring
spec:
  groups:
  - name: automind.rules
    rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is {{ $value | humanizePercentage }}"
  
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile latency is {{ $value }}s"
  
  - alert: VectorDBDown
    expr: up{job="vector-db"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Vector database is down"
      description: "Pinecone vector database is not responding"
  
  - alert: KnowledgeSyncBacklog
    expr: knowledge_sync_queue_size > 1000
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "Knowledge sync backlog detected"
      description: "Queue size is {{ $value }} documents"
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: AutoMind CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run test
    - run: npm run lint
    - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: docker/setup-buildx-action@v2
    - uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - run: |
        docker build -t ghcr.io/${{ github.repository }}/backend:${{ github.sha }} .
        docker push ghcr.io/${{ github.repository }}/backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - uses: azure/k8s-set-context@v3
      with:
        method: kubeconfig
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    - run: |
        kubectl set image deployment/automind-backend backend=ghcr.io/${{ github.repository }}/backend:${{ github.sha }} -n automind
        kubectl rollout status deployment/automind-backend -n automind
```

### Helm Chart
```yaml
# Chart.yaml
apiVersion: v2
name: automind
description: AutoMind autonomous AI operations system
type: application
version: 1.0.0
appVersion: "1.0.0"

# Values.yaml
replicaCount: 3

image:
  repository: automind/backend
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 5000

ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: automind.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

# Dependencies
dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

## 🔧 Configuration Management

### Environment-Specific Configs
```yaml
# values-dev.yaml
replicaCount: 1
resources:
  limits:
    cpu: 250m
    memory: 512Mi
  requests:
    cpu: 100m
    memory: 256Mi

# values-staging.yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 512Mi

# values-prod.yaml
replicaCount: 5
resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
```

### Secret Management
```bash
# Create secrets
kubectl create secret generic automind-secrets \
  --from-literal=database-password=$(openssl rand -base64 32) \
  --from-literal=redis-password=$(openssl rand -base64 32) \
  --from-literal=jwt-secret=$(openssl rand -base64 32) \
  --from-literal=pinecone-api-key=$PINECONE_API_KEY \
  -n automind

# Verify secrets
kubectl get secrets automind-secrets -n automind -o yaml
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Kubernetes cluster ready (v1.24+)
- [ ] External services configured (Pinecone, PostgreSQL, Redis)
- [ ] DNS records configured
- [ ] SSL certificates obtained
- [ ] Monitoring stack deployed (Prometheus, Grafana)
- [ ] Logging stack deployed (ELK)
- [ ] Service mesh installed (Istio)

### Deployment Steps
1. **Create Namespace**
   ```bash
   kubectl create namespace automind
   ```

2. **Apply Secrets**
   ```bash
   kubectl apply -f secrets.yaml -n automind
   ```

3. **Deploy Databases**
   ```bash
   kubectl apply -f database-deployments.yaml -n automind
   ```

4. **Deploy Core Services**
   ```bash
   kubectl apply -f backend-deployment.yaml -n automind
   kubectl apply -f vector-service.yaml -n automind
   kubectl apply -f knowledge-sync.yaml -n automind
   ```

5. **Configure Networking**
   ```bash
   kubectl apply -f istio-config.yaml -n automind
   ```

6. **Deploy Monitoring**
   ```bash
   kubectl apply -f monitoring.yaml -n monitoring
   ```

7. **Verify Deployment**
   ```bash
   kubectl get pods -n automind
   kubectl get services -n automind
   kubectl rollout status deployment/automind-backend -n automind
   ```

### Post-Deployment
- [ ] Health checks passing
- [ ] Metrics collection working
- [ ] Alerting rules configured
- [ ] Load testing completed
- [ ] Security scanning completed
- [ ] Documentation updated
- [ ] Team training completed

## 🔍 Troubleshooting

### Common Issues
```bash
# Check pod status
kubectl get pods -n automind
kubectl describe pod <pod-name> -n automind

# Check logs
kubectl logs <pod-name> -n automind
kubectl logs <pod-name> -n automind --previous

# Check services
kubectl get services -n automind
kubectl describe service <service-name> -n automind

# Check networking
kubectl exec -it <pod-name> -n automind -- nslookup <service-name>

# Check resource usage
kubectl top pods -n automind
kubectl top nodes
```

### Recovery Procedures
```bash
# Restart deployment
kubectl rollout restart deployment/automind-backend -n automind

# Scale up/down
kubectl scale deployment automind-backend --replicas=5 -n automind

# Rollback to previous version
kubectl rollout undo deployment/automind-backend -n automind

# Emergency shutdown
kubectl scale deployment automind-backend --replicas=0 -n automind
```

---

## 🎯 Success Metrics

### Deployment Metrics
- **Deployment Time**: <30 minutes
- **Rollback Time**: <5 minutes
- **Service Availability**: 99.9%
- **Resource Utilization**: 70-80%

### Performance Metrics
- **Response Time**: <200ms (95th percentile)
- **Error Rate**: <1%
- **Throughput**: 1000+ requests/second
- **Uptime**: 99.9%

### Operational Metrics
- **Mean Time to Recovery (MTTR)**: <5 minutes
- **Mean Time Between Failures (MTBF)**: >30 days
- **Deployment Success Rate**: 95%+
- **Alert Accuracy**: 90%+

This deployment guide provides a comprehensive approach to deploying the enhanced AutoMind system with all the latest architectural improvements and operational best practices.
