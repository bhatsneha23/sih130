# Local development

## Prerequisites

- Node.js 20+ and npm for the frontend.
- Python 3.11+ for the backend.
- Docker Compose for local PostgreSQL and Qdrant.

## Start infrastructure

From the repository root in PowerShell:

```powershell
Copy-Item .env.example .env
# Edit .env and replace POSTGRES_PASSWORD and the password in DATABASE_URL
docker compose --env-file .env -f infra/compose.yaml up -d
```

Compose runs only local PostgreSQL and Qdrant; no external data or credentials are required. The backend scaffold does not yet connect to either service. Stop the services with:

```powershell
docker compose --env-file .env -f infra/compose.yaml down
```

The named volumes persist local database/index data. `down -v` deletes those local volumes; use it only when you intentionally want to erase local data.

## Run the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

`GET http://127.0.0.1:8000/health` is a liveness check for the FastAPI process only; it does not claim database, Qdrant, or external-provider readiness. Interactive OpenAPI docs are available at `/docs` in development.

## Run the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. `NEXT_PUBLIC_API_BASE_URL` can point the typed API client at the backend; it defaults to `http://127.0.0.1:8000`. Do not place credentials or private provider keys in `NEXT_PUBLIC_*` variables.

To override the API URL, copy `frontend/.env.example` to `frontend/.env.local` and edit the value.

## Checks

```powershell
# From backend/
python -m pytest

# From frontend/
npm run typecheck
npm run lint
npm run build
```

The backend test suite currently covers the health endpoint and roadmap contract shape. The frontend is a small app/contract scaffold; broader product tests are added with their workflows.

## Data and secrets

`.env.example` contains placeholders only. Keep `.env`, local uploaded files, and database volumes out of version control. Seed data, when introduced, must be separate from migrations and marked illustrative unless regulatory sources have been verified and reviewed.
