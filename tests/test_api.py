import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "orchestra": "conducting"}

@pytest.mark.asyncio
async def test_stats_endpoint_error_no_db():
    # This test assumes DB_DSN is not set or invalid in the test environment
    # and verifies the 500 error handling
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/stats")
    assert response.status_code == 500
