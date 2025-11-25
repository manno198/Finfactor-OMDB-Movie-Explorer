import os
from fastapi.testclient import TestClient
import pytest

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "cineexplorer_test")
os.environ.setdefault("OMDB_API_KEY", "test")

import backend.server as server  # noqa: E402

client = TestClient(server.app)


class MockResponse:
  def __init__(self, payload):
    self._payload = payload

  def raise_for_status(self):
    return None

  def json(self):
    return self._payload


class MockAsyncClient:
  async def __aenter__(self):
    return self

  async def __aexit__(self, exc_type, exc, tb):
    return None

  async def get(self, url, params=None, timeout=None):
    if "i" in (params or {}):
      return MockResponse(
        {
          "Response": "True",
          "Title": "The Matrix",
          "Year": "1999",
          "imdbID": params["i"],
          "Type": "movie",
        }
      )

    return MockResponse(
      {
        "Response": "True",
        "Search": [
          {
            "Title": "The Matrix",
            "Year": "1999",
            "imdbID": params["s"],
            "Type": "movie",
          }
        ],
        "totalResults": "1",
      }
    )


@pytest.fixture(autouse=True)
def clear_cache(monkeypatch):
  server.movie_cache.cache.clear()
  monkeypatch.setattr(server.httpx, "AsyncClient", lambda *args, **kwargs: MockAsyncClient())


def test_root_endpoint_returns_metadata():
  response = client.get("/api/")
  assert response.status_code == 200
  data = response.json()
  assert data["message"] == "OMDB Movie Explorer API"
  assert "/api/movies/search" in data["endpoints"]


def test_search_movies_proxies_omdb():
  response = client.get("/api/movies/search", params={"query": "tt0133093", "page": 1})
  assert response.status_code == 200
  data = response.json()
  assert data["Response"] == "True"
  assert data["Search"][0]["Title"] == "The Matrix"


def test_movie_details_endpoint_returns_payload():
  response = client.get("/api/movies/tt0133093")
  assert response.status_code == 200
  data = response.json()
  assert data["Response"] == "True"
  assert data["Title"] == "The Matrix"

