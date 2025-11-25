from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import httpx
from collections import OrderedDict
from time import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OMDB API Configuration
OMDB_API_KEY = os.environ.get('OMDB_API_KEY', 'YOUR_API_KEY_HERE')
OMDB_BASE_URL = "http://www.omdbapi.com/"

# Simple in-memory cache with TTL
class SimpleCache:
    def __init__(self, ttl=300):  # 5 minutes default TTL
        self.cache: OrderedDict = OrderedDict()
        self.ttl = ttl
        self.max_size = 100
    
    def get(self, key: str) -> Optional[Dict]:
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time() - timestamp < self.ttl:
                # Move to end (most recently used)
                self.cache.move_to_end(key)
                return value
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Dict):
        if key in self.cache:
            del self.cache[key]
        elif len(self.cache) >= self.max_size:
            # Remove oldest item
            self.cache.popitem(last=False)
        self.cache[key] = (value, time())

# Initialize cache
movie_cache = SimpleCache(ttl=600)  # 10 minutes cache

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Favorite(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    imdbID: str
    title: str
    year: str
    poster: str
    type: str
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FavoriteCreate(BaseModel):
    imdbID: str
    title: str
    year: str
    poster: str
    type: str

class MovieSearchResponse(BaseModel):
    Search: Optional[List[Dict[str, Any]]] = None
    totalResults: Optional[str] = None
    Response: str
    Error: Optional[str] = None

class MovieDetailResponse(BaseModel):
    Response: str
    Error: Optional[str] = None
    # Dynamic fields from OMDB
    imdbID: Optional[str] = None
    Title: Optional[str] = None
    Year: Optional[str] = None
    Rated: Optional[str] = None
    Released: Optional[str] = None
    Runtime: Optional[str] = None
    Genre: Optional[str] = None
    Director: Optional[str] = None
    Writer: Optional[str] = None
    Actors: Optional[str] = None
    Plot: Optional[str] = None
    Language: Optional[str] = None
    Country: Optional[str] = None
    Awards: Optional[str] = None
    Poster: Optional[str] = None
    Ratings: Optional[List[Dict[str, str]]] = None
    Metascore: Optional[str] = None
    imdbRating: Optional[str] = None
    imdbVotes: Optional[str] = None
    Type: Optional[str] = None
    DVD: Optional[str] = None
    BoxOffice: Optional[str] = None
    Production: Optional[str] = None
    Website: Optional[str] = None

# OMDB API Routes
@api_router.get("/movies/search")
async def search_movies(
    query: str = Query(..., min_length=1, description="Search query for movies"),
    page: int = Query(1, ge=1, description="Page number for pagination")
):
    """Search movies using OMDB API with caching"""
    try:
        # Check cache first
        cache_key = f"search:{query}:{page}"
        cached_result = movie_cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for search: {query}, page: {page}")
            return cached_result
        
        # Make API request
        async with httpx.AsyncClient() as client:
            params = {
                "apikey": OMDB_API_KEY,
                "s": query,
                "page": page
            }
            response = await client.get(OMDB_BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Cache the result
            if data.get("Response") == "True":
                movie_cache.set(cache_key, data)
                logger.info(f"Cached search result: {query}, page: {page}")
            
            return data
    
    except httpx.TimeoutException:
        logger.error(f"Timeout searching for: {query}")
        raise HTTPException(status_code=504, detail="OMDB API request timed out")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error searching for {query}: {str(e)}")
        raise HTTPException(status_code=502, detail="Error connecting to OMDB API")
    except Exception as e:
        logger.error(f"Error searching movies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@api_router.get("/movies/{imdb_id}")
async def get_movie_details(imdb_id: str):
    """Get detailed movie information by IMDB ID with caching"""
    try:
        # Check cache first
        cache_key = f"detail:{imdb_id}"
        cached_result = movie_cache.get(cache_key)
        if cached_result:
            logger.info(f"Cache hit for movie: {imdb_id}")
            return cached_result
        
        # Make API request
        async with httpx.AsyncClient() as client:
            params = {
                "apikey": OMDB_API_KEY,
                "i": imdb_id,
                "plot": "full"
            }
            response = await client.get(OMDB_BASE_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Cache the result
            if data.get("Response") == "True":
                movie_cache.set(cache_key, data)
                logger.info(f"Cached movie detail: {imdb_id}")
            
            return data
    
    except httpx.TimeoutException:
        logger.error(f"Timeout fetching movie: {imdb_id}")
        raise HTTPException(status_code=504, detail="OMDB API request timed out")
    except httpx.HTTPError as e:
        logger.error(f"HTTP error fetching movie {imdb_id}: {str(e)}")
        raise HTTPException(status_code=502, detail="Error connecting to OMDB API")
    except Exception as e:
        logger.error(f"Error fetching movie details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Favorites Routes
@api_router.get("/favorites", response_model=List[Favorite])
async def get_favorites():
    """Get all favorite movies"""
    try:
        favorites = await db.favorites.find({}, {"_id": 0}).to_list(1000)
        
        # Convert ISO string timestamps back to datetime objects
        for fav in favorites:
            if isinstance(fav.get('added_at'), str):
                fav['added_at'] = datetime.fromisoformat(fav['added_at'])
        
        # Sort by most recently added
        favorites.sort(key=lambda x: x.get('added_at', datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
        
        return favorites
    except Exception as e:
        logger.error(f"Error fetching favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching favorites: {str(e)}")

@api_router.post("/favorites", response_model=Favorite)
async def add_favorite(favorite_input: FavoriteCreate):
    """Add a movie to favorites"""
    try:
        # Check if already exists
        existing = await db.favorites.find_one({"imdbID": favorite_input.imdbID}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Movie already in favorites")
        
        # Create favorite object
        favorite = Favorite(**favorite_input.model_dump())
        
        # Convert to dict and serialize datetime to ISO string
        doc = favorite.model_dump()
        doc['added_at'] = doc['added_at'].isoformat()
        
        await db.favorites.insert_one(doc)
        logger.info(f"Added to favorites: {favorite.title}")
        
        return favorite
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding favorite: {str(e)}")

@api_router.delete("/favorites/{imdb_id}")
async def remove_favorite(imdb_id: str):
    """Remove a movie from favorites"""
    try:
        result = await db.favorites.delete_one({"imdbID": imdb_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Favorite not found")
        
        logger.info(f"Removed from favorites: {imdb_id}")
        return {"message": "Favorite removed successfully", "imdbID": imdb_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing favorite: {str(e)}")

@api_router.get("/favorites/check/{imdb_id}")
async def check_favorite(imdb_id: str):
    """Check if a movie is in favorites"""
    try:
        exists = await db.favorites.find_one({"imdbID": imdb_id}, {"_id": 0})
        return {"isFavorite": exists is not None}
    except Exception as e:
        logger.error(f"Error checking favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error checking favorite: {str(e)}")

# Health check
@api_router.get("/")
async def root():
    return {
        "message": "OMDB Movie Explorer API",
        "version": "1.0.0",
        "endpoints": [
            "/api/movies/search",
            "/api/movies/{imdb_id}",
            "/api/favorites"
        ]
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
