# API and event contracts

This document defines the target contract; only `GET /health` is implemented in the initial backend scaffold.

## REST conventions

- Prefix business endpoints with `/api/v1`; use plural resource paths and stable resource IDs.
- Use JSON with `snake_case` field names in HTTP requests and responses. Frontend TypeScript mirrors the backend's typed schemas; add contract tests or generated schema checks before expanding either side.
- Return `201` for created resources, `200` for reads/updates, `202` for accepted background work, and standard `4xx`/`5xx` status codes. A `202` response identifies the operation/resource to poll or subscribe to.
- List endpoints use `limit` (default 20, maximum 100), opaque `cursor`, and resource-specific filters. Return `{ "items": [], "next_cursor": null }`.
- The backend validates all inputs and owns applicability, dependency, and status transition logic. Clients may submit edits or commands, not authoritative status or eligibility conclusions.

### Error body

Errors use one stable shape:

```json
{
  "error": {
    "code": "validation_error",
    "message": "The request could not be validated.",
    "fields": [{ "path": "profile.investment_amount", "message": "Must be non-negative." }],
    "request_id": "server-generated-id"
  }
}
```

`fields` may be empty or omitted when the error is not field-specific. Do not return stack traces, provider credentials, hidden reasoning, or internal service details. Unexpected failures are logged with the request ID and return a generic message. Authentication/authorization errors use `unauthenticated`/`forbidden`; missing resources use `not_found`; stale graph versions use `conflict`.

### Authentication and authorization

Authentication is not implemented yet. The chosen identity provider and session/token mechanism remain open. When added, the server must authenticate every protected request and enforce organization, project, assignment, and role scope. UI navigation and role labels are not security controls. Public health checks expose no sensitive configuration.

## Initial route boundaries

These are planned routes, not claims of implemented functionality.

| Area | Initial route shape | Execution |
|---|---|---|
| Health | `GET /health` | Synchronous; implemented liveness check only |
| Authentication | `/api/v1/auth/*` | Synchronous identity/session boundary; provider deferred |
| Projects/profile | `GET/POST /api/v1/projects`, `GET/PATCH /api/v1/projects/{project_id}`, `GET/PATCH /api/v1/projects/{project_id}/profile` | Synchronous |
| Intake | `POST /api/v1/projects/{project_id}/intake/conversations`, `POST .../messages`, `GET .../{conversation_id}` | Message may stream; persistence deferred |
| Roadmap | `POST /api/v1/projects/{project_id}/roadmap:generate`, `GET /api/v1/projects/{project_id}/roadmap` | Generation may return `202`; retrieval synchronous |
| Approval task | `GET/PATCH /api/v1/projects/{project_id}/approval-tasks/{task_id}`, `POST .../{task_id}/actions` | Synchronous command; server validates transition |
| Documents | `/api/v1/projects/{project_id}/documents`, `/api/v1/document-requirements/{requirement_id}` | Upload/import may return `202` for processing |
| Applications | `/api/v1/projects/{project_id}/applications`, `/api/v1/applications/{application_id}` | Synchronous; officer actions audited |
| Regulatory knowledge | `/api/v1/regulatory-sources`, `/api/v1/regulatory-updates` | Reads synchronous; publication/impact work may be asynchronous |
| Assistant | `POST /api/v1/projects/{project_id}/assistant/conversations/{conversation_id}/messages` | SSE when streaming is requested |
| Notifications | `GET /api/v1/notifications`, `POST /api/v1/notifications/{notification_id}:read` | Synchronous |
| Officer workflow | `/api/v1/officer/assignments`, `/api/v1/applications/{application_id}/review-actions` | Synchronous command; updates emit activity |
| Administration | `/api/v1/admin/regulatory-updates/{update_id}:review`, `/api/v1/admin/audit-events` | Synchronous command/read; impact work may be asynchronous |

Use request idempotency keys for retriable create/command operations that can cause duplicate work. The exact login, file-upload transport, and long-running operation resource shape are deferred until those workflows are implemented.

## Roadmap graph payload

Both backend and frontend initially model a `RoadmapGraph` as:

```json
{
  "project_id": "2a47f683-fb0c-4f37-9c63-596ed6c0c986",
  "version": 1,
  "generated_at": "2026-10-03T12:00:00Z",
  "nodes": [{
    "id": "74f03c15-3957-4f0b-853a-d790140d2443",
    "node_type": "approval",
    "title": "Illustrative approval task",
    "status": "pending",
    "authority": null,
    "applicability_rationale": "Illustrative; confirm with the relevant authority.",
    "source_refs": [],
    "document_requirement_ids": [],
    "estimated_sla_days": null,
    "due_at": null
  }],
  "edges": [{
    "id": "d0adf36b-6a9b-4c3d-bc9e-00399f860e2d",
    "source": "prerequisite-node-id",
    "target": "dependent-node-id",
    "edge_type": "depends_on"
  }]
}
```

IDs are opaque strings on the shared transport contract (UUIDs for persisted records). An edge points from prerequisite to dependent task. Multiple incoming edges mean all listed prerequisites apply; the server computes blocked/readiness state. The frontend maps this graph to XYFlow nodes/edges and owns only layout/presentation.

`source_refs` identify stored regulatory source/version records. Empty sources or illustrative data must not be presented as verified law. Optional SLA/deadline values are not legal guarantees.

## SSE event contract

Long-running assistant and workflow updates use `text/event-stream`. Each SSE `data` is a JSON object with `event_id`, `stream_id`, `occurred_at` (UTC), and `data`. The SSE `event` name is one of:

| Event | `data` shape | Meaning |
|---|---|---|
| `assistant.started` | `{ "conversation_id": "...", "message_id": "..." }` | Work began |
| `assistant.token` | `{ "message_id": "...", "text": "..." }` | User-visible text chunk only |
| `assistant.message` | `{ "message_id": "...", "text": "...", "source_refs": [] }` | Complete assistant message and citations |
| `assistant.tool_status` | `{ "tool": "regulatory_search", "status": "started|completed|failed" }` | Safe, user-visible tool progress; never arguments, secrets, or hidden reasoning |
| `workflow.progress` | `{ "operation_id": "...", "stage": "...", "percent": 0 }` | Best-effort progress for an accepted operation |
| `approval.required` | `{ "approval_task_id": "...", "action": "applicant_confirmation" }` | User action is required |
| `error` | `{ "code": "...", "message": "...", "retryable": false }` | Safe actionable failure |
| `done` | `{ "message_id": "...", "operation_id": null }` | Stream is complete |

Events are scoped to an authenticated, authorized project and contain no tokens, document contents, private provider payloads, or chain-of-thought. Clients treat SSE as activity delivery, not as the source of truth: re-fetch the relevant resource after completion or reconnect.
