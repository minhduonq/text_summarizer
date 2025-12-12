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
    
    # Model
    MODEL_NAME: str = "facebook/bart-large-cnn"
    MODEL_CACHE_DIR: str = "./models"
    MAX_INPUT_LENGTH: int = 1024
    MAX_SUMMARY_LENGTH: int = 150
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/summarizer.db"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
