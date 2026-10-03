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
