# 2026 Capstone: HelpFlow — Multi-tenant Customer Support SaaS API

## Product brief

Build the API layer for a customer-support SaaS used by multiple independent organisations. Each organisation (workspace) manages its own members, customers, support tickets, comments and knowledge-base articles. The central engineering challenge is **tenant isolation**: a user in Workspace A must never read or change Workspace B's records, even if they guess an ID.

This is an independent portfolio project. It is not client work for Automivex. Students retain ownership of their original code. Do not use real customer information, production secrets or private company data.

## Who uses it

- **Workspace owner:** creates a workspace, manages members and workspace settings.
- **Admin:** manages agents, membership and ticket configuration within one workspace.
- **Agent:** works on assigned tickets and responds to customers.
- **Requester:** creates tickets and can view their own requests and public replies.

A person may belong to more than one workspace. Their role is assigned per workspace membership, not globally.

## Required MVP features

### 1. Identity and workspace membership
- Register and authenticate users using a well-supported password-hashing implementation (never store plain-text passwords).
- Create a workspace and make the creator its owner.
- Invite or add a member by email (a development-only seeded flow is acceptable if email delivery is not implemented).
- Apply role checks on every workspace-scoped endpoint.
- A request must be scoped using the authenticated membership, never a client-supplied `workspace_id` alone.

### 2. Ticket lifecycle
- Create, list, retrieve, update and close tickets.
- Fields: subject, description, status, priority, requester, assignee, created time and updated time.
- Filter by status, priority and assignee; paginate list endpoints.
- Support comments/replies. Internal notes must be hidden from requesters.
- Validate allowed status transitions and return consistent error responses.

### 3. Knowledge base
- Admins and agents can draft and publish articles.
- Requesters can search and read published articles only.
- Use PostgreSQL text search or a documented, safe `ILIKE` search for the MVP.

### 4. Audit trail
- Record important events: ticket created, status changed, assigned, comment added, article published and member role changed.
- Include actor, workspace, event type, target type/id and timestamp.
- Do not put secrets or sensitive ticket body content in audit metadata.

### 5. Quality and operations
- FastAPI routes with typed request/response schemas and OpenAPI docs.
- PostgreSQL, SQLAlchemy 2.x and Alembic migrations.
- Automated tests using pytest and FastAPI's test client.
- Tests must cover authentication, roles, ticket CRUD, internal note visibility and cross-workspace isolation.
- Environment-based configuration; a committed `.env.example` with placeholders only.
- Docker Compose for local API + database development.
- GitHub Actions workflow to install dependencies and run tests on pull requests and pushes.
- Useful README: product overview, architecture, setup, migrations, test commands, API examples, limitations and screenshots/diagram.

## Suggested API map

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Authenticate |
| GET | `/api/v1/me` | Current user and memberships |
| POST | `/api/v1/workspaces` | Create workspace |
| GET | `/api/v1/workspaces` | List memberships |
| POST | `/api/v1/workspaces/{workspace_id}/members` | Add/invite member |
| GET/POST | `/api/v1/workspaces/{workspace_id}/tickets` | List/create tickets |
| GET/PATCH | `/api/v1/workspaces/{workspace_id}/tickets/{ticket_id}` | Read/update ticket |
| POST | `/api/v1/workspaces/{workspace_id}/tickets/{ticket_id}/comments` | Add reply or internal note |
| GET/POST | `/api/v1/workspaces/{workspace_id}/articles` | List/create articles |
| GET | `/api/v1/workspaces/{workspace_id}/articles/search?q=...` | Search published articles |
| GET | `/api/v1/workspaces/{workspace_id}/audit-events` | View audit trail (admin/owner) |

You may adjust route names, but document the final API and preserve the same permissions.

## Suggested data model

- `users`
- `workspaces`
- `memberships` (`user_id`, `workspace_id`, `role`)
- `tickets` (`workspace_id`, `requester_id`, `assignee_id`, `status`, `priority`)
- `ticket_comments` (`ticket_id`, `author_id`, `is_internal`)
- `knowledge_articles` (`workspace_id`, `author_id`, `status`, `title`, `body`)
- `audit_events` (`workspace_id`, `actor_id`, `event_type`, `target_type`, `target_id`)

Use foreign keys, indexes on common filters and unique constraints where appropriate. Explain how you prevent cross-tenant access in your service/query layer.

## Security acceptance tests

At minimum demonstrate these scenarios in automated tests:

1. A user with no membership cannot access a workspace's tickets.
2. A member of Workspace A cannot retrieve a ticket in Workspace B by guessing its ID.
3. A requester cannot see an internal note.
4. A requester cannot assign tickets or change another requester's ticket.
5. An agent cannot change owner/admin membership permissions.
6. Unauthenticated requests cannot access protected endpoints.
7. Passwords are never returned from API responses or written to logs.

## Optional 2026-ready extensions

Do these only after the secure MVP works:

- **AI-assisted triage adapter:** a provider-agnostic interface that can suggest category/priority from a ticket description. Include a deterministic local/rule-based fallback. No paid AI API key should be required to run the core project.
- SLA target and overdue queue.
- CSV export with permission checks.
- Webhook notifications with signed payloads and retry strategy.
- Structured JSON logs and request IDs.
- Redis-backed rate limiting (optional; do not make Redis a hard requirement).

## Suggested delivery phases

1. Domain model and migrations.
2. Registration/login and workspaces/memberships.
3. Tenant-safe ticket CRUD.
4. Comments and role/visibility rules.
5. Knowledge base and audit events.
6. Tests, Docker, CI and documentation.
7. Optional enhancements only after all security tests pass.

## Automivex submission checklist

The learning platform only inspects public GitHub repository metadata and expected file presence. A passing automated check is not a source-code review, security audit or proof the application runs. The learner must not submit secrets or personal data. A live demo URL is optional; local reproducible instructions are accepted.
