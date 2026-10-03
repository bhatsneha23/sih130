# Next.js Project Source

This document contains source files from selected Next.js project directories and configuration files.

**Project root:** `C:\Users\parth\Desktop\Projects\sih130\backend`

**Files included:** 22

---

## `app\__init__.py`

**File:** `app\__init__.py`

```text
```

---

## `app\__pycache__\__init__.cpython-312.pyc`

**File:** `app\__pycache__\__init__.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\__pycache__\main.cpython-312.pyc`

**File:** `app\__pycache__\main.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\api\__init__.py`

**File:** `app\api\__init__.py`

```text
```

---

## `app\api\__pycache__\__init__.cpython-312.pyc`

**File:** `app\api\__pycache__\__init__.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\api\v1\__init__.py`

**File:** `app\api\v1\__init__.py`

```text
```

---

## `app\api\v1\__pycache__\__init__.cpython-312.pyc`

**File:** `app\api\v1\__pycache__\__init__.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\api\v1\__pycache__\health.cpython-312.pyc`

**File:** `app\api\v1\__pycache__\health.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\api\v1\__pycache__\router.cpython-312.pyc`

**File:** `app\api\v1\__pycache__\router.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\api\v1\health.py`

**File:** `app\api\v1\health.py`

```text
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Check API process liveness")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "indusai-api"}
```

---

## `app\api\v1\router.py`

**File:** `app\api\v1\router.py`

```text
from fastapi import APIRouter

from app.api.v1.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
```

---

## `app\core\__init__.py`

**File:** `app\core\__init__.py`

```text
```

---

## `app\core\__pycache__\__init__.cpython-312.pyc`

**File:** `app\core\__pycache__\__init__.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\core\__pycache__\config.cpython-312.pyc`

**File:** `app\core\__pycache__\config.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\core\config.py`

**File:** `app\core\config.py`

```text
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://localhost/indusai"
    qdrant_url: str = "http://localhost:6333"
    qdrant_collection: str = "regulatory_documents"
    llm_provider: str = "disabled"
    llm_api_key: str | None = None
    digilocker_mode: str = "simulated"
    gov_portal_mode: str = "handoff_only"

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

---

## `app\main.py`

**File:** `app\main.py`

```text
from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings

settings = get_settings()
app = FastAPI(
    title="IndusAI API",
    description="Backend foundation for industrial approval workflows.",
    version="0.1.0",
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url=None,
)
app.include_router(api_router)
```

---

## `app\schemas\__init__.py`

**File:** `app\schemas\__init__.py`

```text
```

---

## `app\schemas\__pycache__\__init__.cpython-312.pyc`

**File:** `app\schemas\__pycache__\__init__.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\schemas\__pycache__\project.cpython-312.pyc`

**File:** `app\schemas\__pycache__\project.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\schemas\__pycache__\roadmap.cpython-312.pyc`

**File:** `app\schemas\__pycache__\roadmap.cpython-312.pyc`

> ⚠️ Could not read this file as UTF-8. Skipped.

---

## `app\schemas\project.py`

**File:** `app\schemas\project.py`

```text
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, Field


class SiteStatus(StrEnum):
    IDENTIFIED = "identified"
    LEASED = "leased"
    OWNED = "owned"
    UNDER_DEVELOPMENT = "under_development"


class ProjectStage(StrEnum):
    PLANNING = "planning"
    LAND_ACQUISITION = "land_acquisition"
    CONSTRUCTION = "construction"
    PRE_OPERATIONAL = "pre_operational"
    OPERATIONAL = "operational"


class ProjectProfile(BaseModel):
    sector: str | None = None
    products: list[str] = Field(default_factory=list)
    location: str | None = None
    investment_amount: Decimal | None = Field(default=None, ge=0)
    investment_currency: str = "INR"
    site_status: SiteStatus | None = None
    project_stage: ProjectStage | None = None
```

---

## `app\schemas\roadmap.py`

**File:** `app\schemas\roadmap.py`

```text
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class RoadmapNodeType(StrEnum):
    APPROVAL = "approval"
    DOCUMENT = "document"
    INSPECTION = "inspection"
    APPLICANT_ACTION = "applicant_action"


class ApprovalTaskStatus(StrEnum):
    NOT_STARTED = "not_started"
    BLOCKED = "blocked"
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    CHANGES_REQUESTED = "changes_requested"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class RoadmapEdgeType(StrEnum):
    DEPENDS_ON = "depends_on"


class SourceVerificationStatus(StrEnum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    ILLUSTRATIVE = "illustrative"
    NEEDS_REVIEW = "needs_review"


class SourceReference(BaseModel):
    source_id: str
    version_id: str | None = None
    label: str
    url: str | None = None
    verification_status: SourceVerificationStatus = SourceVerificationStatus.UNVERIFIED


class RoadmapNode(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    node_type: RoadmapNodeType
    title: str
    status: ApprovalTaskStatus
    authority: str | None = None
    applicability_rationale: str | None = None
    source_refs: list[SourceReference] = Field(default_factory=list)
    document_requirement_ids: list[str] = Field(default_factory=list)
    estimated_sla_days: int | None = Field(default=None, ge=0)
    due_at: datetime | None = None

    @field_validator("due_at")
    @classmethod
    def due_date_must_be_timezone_aware(
        cls, value: datetime | None
    ) -> datetime | None:
        if value is not None and value.utcoffset() is None:
            raise ValueError("due_at must include a timezone")
        return value


class RoadmapEdge(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    source: str
    target: str
    edge_type: RoadmapEdgeType = RoadmapEdgeType.DEPENDS_ON


class RoadmapGraph(BaseModel):
    project_id: UUID
    version: int = Field(ge=1)
    generated_at: datetime
    nodes: list[RoadmapNode]
    edges: list[RoadmapEdge]

    @field_validator("generated_at")
    @classmethod
    def generated_at_must_be_timezone_aware(cls, value: datetime) -> datetime:
        if value.utcoffset() is None:
            raise ValueError("generated_at must include a timezone")
        return value

    @model_validator(mode="after")
    def validate_graph_references_and_acyclicity(self) -> "RoadmapGraph":
        node_ids = [node.id for node in self.nodes]
        edge_ids = [edge.id for edge in self.edges]
        if len(node_ids) != len(set(node_ids)):
            raise ValueError("roadmap node IDs must be unique")
        if len(edge_ids) != len(set(edge_ids)):
            raise ValueError("roadmap edge IDs must be unique")

        known_nodes = set(node_ids)
        adjacency: dict[str, list[str]] = {node_id: [] for node_id in node_ids}
        seen_edges: set[tuple[str, str]] = set()
        for edge in self.edges:
            if edge.source not in known_nodes or edge.target not in known_nodes:
                raise ValueError("roadmap edges must reference existing nodes")
            if edge.source == edge.target:
                raise ValueError("roadmap tasks cannot depend on themselves")
            pair = (edge.source, edge.target)
            if pair in seen_edges:
                raise ValueError("roadmap dependency edges must be unique")
            seen_edges.add(pair)
            adjacency[edge.source].append(edge.target)

        visiting: set[str] = set()
        visited: set[str] = set()

        def visit(node_id: str) -> bool:
            if node_id in visiting:
                return False
            if node_id in visited:
                return True
            visiting.add(node_id)
            if not all(visit(target) for target in adjacency[node_id]):
                return False
            visiting.remove(node_id)
            visited.add(node_id)
            return True

        if not all(visit(node_id) for node_id in node_ids):
            raise ValueError("roadmap dependencies must not contain cycles")
        return self
```

---

