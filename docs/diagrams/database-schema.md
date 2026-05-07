# Database Schema

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────────┐       ┌────────────────────┐
│       Jobs           │◄──────│  JobExecutions     │
├──────────────────────┤ N  1  ├────────────────────┤
│ id (PK)              │       │ id (PK)            │
│ user_id (FK)         │       │ job_id (FK)        │
│ name                 │       │ status             │
│ status               │       │ started_at         │
│ created_at           │       │ completed_at       │
│ updated_at           │       │ result             │
└──────────────────────┘       └────────────────────┘

┌────────────────────┐
│   Credentials      │
├────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ type               │
│ encrypted_value    │
│ created_at         │
└────────────────────┘

┌────────────────────┐
│  AuditLogs         │
├────────────────────┤
│ id (PK)            │
│ user_id (FK)       │
│ action             │
│ resource_type      │
│ resource_id        │
│ timestamp          │
│ details            │
└────────────────────┘

┌────────────────────┐
│   AIModels         │
├────────────────────┤
│ id (PK)            │
│ name               │
│ version            │
│ model_type         │
│ deployed           │
│ created_at         │
└────────────────────┘
```

## Table Relationships

- **Users** → **Jobs**: One user has many jobs
- **Jobs** → **JobExecutions**: One job has many executions
- **Users** → **Credentials**: One user has many credentials
- **Users** → **AuditLogs**: One user has many audit logs

---

Generated using GitDiagram database visualization.
