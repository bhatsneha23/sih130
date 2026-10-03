from datetime import UTC, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.roadmap import RoadmapGraph


def test_roadmap_graph_serializes_dependency_direction() -> None:
    prerequisite_id = "prerequisite"
    dependent_id = "dependent"
    graph = RoadmapGraph.model_validate(
        {
            "project_id": str(uuid4()),
            "version": 1,
            "generated_at": datetime.now(UTC),
            "nodes": [
                {
                    "id": prerequisite_id,
                    "node_type": "approval",
                    "title": "First task",
                    "status": "completed",
                },
                {
                    "id": dependent_id,
                    "node_type": "approval",
                    "title": "Next task",
                    "status": "pending",
                },
            ],
            "edges": [
                {
                    "id": "edge-1",
                    "source": prerequisite_id,
                    "target": dependent_id,
                    "edge_type": "depends_on",
                }
            ],
        }
    )

    assert graph.edges[0].source == prerequisite_id
    assert graph.edges[0].target == dependent_id
    assert graph.model_dump(mode="json")["edges"][0]["edge_type"] == "depends_on"


def test_roadmap_graph_rejects_cycles() -> None:
    node = {
        "node_type": "approval",
        "title": "Task",
        "status": "pending",
    }
    first_id = "first"
    second_id = "second"

    with pytest.raises(ValidationError, match="must not contain cycles"):
        RoadmapGraph.model_validate(
            {
                "project_id": str(uuid4()),
                "version": 1,
                "generated_at": datetime.now(UTC),
                "nodes": [
                    {**node, "id": first_id},
                    {**node, "id": second_id},
                ],
                "edges": [
                    {
                        "id": "edge-1",
                        "source": first_id,
                        "target": second_id,
                    },
                    {
                        "id": "edge-2",
                        "source": second_id,
                        "target": first_id,
                    },
                ],
            }
        )
