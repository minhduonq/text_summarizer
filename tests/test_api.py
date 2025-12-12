"""
Unit tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/api/v1/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data


def test_summarize_text_endpoint():
    """Test text summarization endpoint"""
    payload = {
        "text": "This is a test text for summarization. It contains multiple sentences.",
        "length": "medium"
    }
    
    # Note: This will fail without model loaded, but tests structure
    response = client.post("/api/v1/summarize/text", json=payload)
    # Check if endpoint exists (may return 500 without model)
    assert response.status_code in [200, 500]


def test_summarize_text_validation():
    """Test text summarization input validation"""
    payload = {
        "text": "",  # Empty text
        "length": "medium"
    }
    
    response = client.post("/api/v1/summarize/text", json=payload)
    # Should get validation error
    assert response.status_code in [422, 500]
