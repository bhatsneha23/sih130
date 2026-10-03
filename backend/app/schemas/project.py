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
