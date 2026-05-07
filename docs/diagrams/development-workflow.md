# Development Workflow

## Local Development Setup

```
┌──────────────────────────────────────────┐
│  Developer Machine                       │
├──────────────────────────────────────────┤
│                                          │
│  Clone Repository                        │
│  git clone [repo-url]                    │
│          │                               │
│          ▼                               │
│  Install Pre-commit Hooks                │
│  ./scripts/setup-pre-commit.sh           │
│          │                               │
│          ▼                               │
│  Install Dependencies                    │
│  cd backend && npm install               │
│  cd frontend && npm install              │
│          │                               │
│          ▼                               │
│  Start Development Servers               │
│  Backend: npm run dev                    │
│  Frontend: npm run dev                   │
│          │                               │
│          ▼                               │
│  Or Use Docker Compose                   │
│  docker-compose -f docker-compose.dev   │
│          │                               │
│          ▼                               │
│  Access Application                      │
│  Frontend: http://localhost:3000         │
│  Backend: http://localhost:3001/api      │
│                                          │
└──────────────────────────────────────────┘
```

## Feature Development Flow

```
1. Create Feature Branch
   git checkout -b feature/my-feature

2. Make Changes
   ├──► Modify code
   ├──► Write tests
   ├──► Update docs

3. Pre-commit Hook Runs (Automated)
   ├──► Lint check
   ├──► Format check
   ├──► Security scan
   ├──► Type check

4. Run Tests Locally
   ├──► npm run test:unit
   ├──► npm run test:integration
   └──► npm run type-check

5. Commit Changes
   git commit -m "feat: description"

6. Push to Remote
   git push origin feature/my-feature

7. Create Pull Request
   └──► GitHub PR

8. CI/CD Runs (Automated)
   ├──► Lint
   ├──► Tests
   ├──► Security
   ├──► Build Docker Images

9. Code Review
   └──► Approved

10. Merge to Main
    ├──► Automated tests run
    └──► Deploy to staging

11. Deployment to Production
    └──► Manual approval (if needed)
```

## Testing Strategy

```
Test Pyramid
          ▲
         /|\
        / | \
       /  E  \  E2E Tests (10%)
      /   2   \  ├─ Full workflow
     /    E    \ └─ User scenarios
    /__________\
       /    \
      /  I   \  Integration Tests (30%)
     / Test  \ ├─ Service interactions
    /__I_____\ └─ API endpoints
      /      \
     / Unit  \ Unit Tests (60%)
    / Tests  / ├─ Functions
   /________/ ├─ Classes
             └─ Components
```

## Release Process

```
┌──────────────────────────────────────────┐
│      Release Preparation                 │
├──────────────────────────────────────────┤
│                                          │
│ 1. Create Release Branch                 │
│    git checkout -b release/v1.x.x        │
│                                          │
│ 2. Update Version Numbers                │
│    ├──► package.json                    │
│    ├──► CHANGELOG.md                    │
│    └──► docs                            │
│                                          │
│ 3. Run Full Test Suite                   │
│    npm run test:ci                      │
│                                          │
│ 4. Security Audit                        │
│    npm audit                            │
│                                          │
│ 5. Build Release Artifacts               │
│    npm run build                        │
│    docker build -t app:v1.x.x .         │
│                                          │
│ 6. Tag Release                           │
│    git tag -a v1.x.x                    │
│                                          │
│ 7. Create GitHub Release                 │
│    └──► Add release notes                │
│                                          │
│ 8. Deploy to Production                  │
│    ├──► Update infrastructure           │
│    ├──► Run smoke tests                 │
│    └──► Monitor metrics                 │
│                                          │
└──────────────────────────────────────────┘
```

---

Generated using GitDiagram workflow visualization.
