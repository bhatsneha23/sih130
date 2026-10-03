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
