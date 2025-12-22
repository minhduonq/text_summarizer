"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Text Summarizer API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # AI Model - Google Gemini
    GEMINI_API_KEY: str = "GEMINI-KEY (get from ai studio)"
    GEMINI_MODEL: str = "models/gemini-2.5-flash"
    MAX_INPUT_LENGTH: int = 30000  # Gemini has higher token limit
    MAX_SUMMARY_LENGTH: int = 2000
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/summarizer.db"
    
    # Authentication
    SECRET_KEY: str = "SECRET"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
