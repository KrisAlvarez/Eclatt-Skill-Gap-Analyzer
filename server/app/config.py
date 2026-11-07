"""Application Configuration and Paths."""

from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
RULES_FILE = PROCESSED_DIR / "rules.json"
METRICS_FILE = PROCESSED_DIR / "evaluation_metrics.json"
TRANSACTIONS_FILE = PROCESSED_DIR / "clean_transactions.json"

class Settings(BaseModel):
    APP_NAME: str = "SkillGap: ECLAT IT Skill Gap Analyzer"
    VERSION: str = "1.0.0"
    DEFAULT_TOP_K: int = 5
    DEFAULT_MIN_SUPPORT: float = 0.05
    DEFAULT_MIN_CONFIDENCE: float = 0.35
    DEFAULT_MIN_LIFT: float = 1.15
    ENTRY_MIN_SUPPORT: float = 0.05
    ENTRY_MIN_CONFIDENCE: float = 0.35
    ENTRY_MIN_LIFT: float = 1.15
    MIN_SUPPORT_ABSOLUTE_COUNT: int = 3
    MAX_RULES_STORED_PER_MODE: int = 2000

settings = Settings()
