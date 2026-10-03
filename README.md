# IndusAI foundation

IndusAI is an industrial approvals and compliance workflow platform. Its primary workspace is a project-specific approval roadmap; AI assistance supports that workflow and does not replace official government authorities or portals.

This repository contains the initial full-stack foundation:

- `frontend/`: Next.js App Router app and TypeScript API/roadmap contracts.
- `backend/`: FastAPI service, initial Pydantic contracts, and health endpoint.
- `docs/`: architecture, API/event contracts, and local development guide.
- `infra/compose.yaml`: local PostgreSQL and Qdrant services.

Only the health endpoint and initial data contracts are implemented. Project workflows, persistence, authentication, AI/RAG, document processing, and external integrations remain future implementation work; none are represented as working features.

## Local development

See [local development](docs/LOCAL_DEVELOPMENT.md) for prerequisites and commands. Begin with:

```powershell
Copy-Item .env.example .env
```

Change the local-only database password in `.env`, then start PostgreSQL and Qdrant using the documented Compose command.

## Design references

- [Architecture and domain model](docs/ARCHITECTURE.md)
- [REST and SSE contracts](docs/API_CONTRACTS.md)
- [Local development and checks](docs/LOCAL_DEVELOPMENT.md)
