"""
Central configuration. All secrets/paths come from environment variables
so the same code runs unchanged across dev / staging / production.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # --- LLM ---
    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-4-6"

    # --- Firebase ---
    firebase_service_account_path: str = "./firebase-service-account.json"
    firebase_project_id: str = ""

    # --- Hadith API (sunnah.com requires a free API key) ---
    sunnah_api_key: str = ""
    sunnah_api_base: str = "https://api.sunnah.com/v1"

    # --- Quran API (no key required) ---
    quran_api_base: str = "https://api.alquran.cloud/v1"

    # --- Prayer Times API (no key required) ---
    aladhan_api_base: str = "https://api.aladhan.com/v1"
    default_calculation_method: int = 2  # ISNA; see Aladhan docs for full list

    # --- Mosque Finder (Google Places, requires a billed API key) ---
    google_places_api_key: str = ""
    google_places_api_base: str = "https://maps.googleapis.com/maps/api/place"
    mosque_search_radius_meters: int = 5000

    # --- Embeddings / Vector store ---
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    vector_index_dir: str = "./data"
    top_k_retrieval: int = 5

    # --- App ---
    environment: str = "development"
    cors_origins: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
