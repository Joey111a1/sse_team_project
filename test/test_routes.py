"""
tests/test_routes.py

Demonstrates how to test FastAPI routes using TestClient.
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def test_client():
    """
    Provides a TestClient for route testing.
    """
    client = TestClient(app)
    yield client

def test_root_endpoint(test_client):
    """
    Example test for the root endpoint (e.g., GET /).
    Adjust as needed if you have a different root route.
    """
    response = test_client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_history_get_endpoint(test_client):
    """
    Tests retrieving a history record by ID.
    Replace {id} with an actual ID or
    do a two-step approach: first create, then get the new ID.
    """
    # For demonstration, assume we have a history with ID = 1
    payload = {
        "imageData": [255, 255, 255, 0, 0, 0],
        "user_id": 1
    }
    response = test_client.get("/api/history/1")
    if response.status_code == 404:
        pytest.skip("History record with ID=1 not found. Create one first.")
    else:
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "imageData" in data
