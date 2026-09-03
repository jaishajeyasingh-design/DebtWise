"""
FinShield Application Configuration
Environment settings, API metadata, and system defaults.
"""
import os
from typing import List, Optional
from pydantic import BaseModel


class Settings(BaseModel):
    APP_NAME: str = "FinShield Backend Engine"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    PROJECT_DESCRIPTION: str = (
        "FinShield — AI-Assisted Financial Distress Intervention Engine. "
        "Diagnoses distress causes via XGBoost+SHAP, deterministically calculates sustainable repayment capacity, "
        "and enforces hard safety constraints across a 7-level intervention ladder."
    )
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "*"
    ]
    ENVIRONMENT: str = os.getenv("FINSHIELD_ENV", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # LLM Explanation & Communication Layer Configuration
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    ANTHROPIC_MODEL: str = os.getenv("ANTHROPIC_MODEL", os.getenv("LLM_MODEL", "claude-sonnet-4-20250514"))
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "10.0"))


settings = Settings()
