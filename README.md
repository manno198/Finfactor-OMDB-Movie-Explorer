# OMDB Movie Explorer

A modern, full-stack movie search application that uses the OMDB API to search and explore movies, series, and episodes. Built with FastAPI backend and React frontend, featuring a clean, responsive interface with favorites management and comprehensive movie information.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Development Notes](#-development-notes)

## 🎬 Features

### Core Functionality
- **Movie Search**: Search for movies, series, and episodes using OMDB API
- **Detailed Information**: View comprehensive movie details including:
  - Plot summary
  - Director and cast information
  - Ratings (IMDB, Rotten Tomatoes, Metacritic)
  - Awards and nominations
  - Genre, runtime, release date
- **Favorites System**: Bookmark your favorite movies with persistent browser local storage
- **Pagination**: Navigate through search results efficiently with page controls
- **Responsive Design**: Modern dark theme optimized for desktop, tablet, and mobile devices
- **Real-time Feedback**: Instant toast notifications for all user actions

### Technical Features
- **Backend Caching**: In-memory LRU cache with 10-minute TTL and 100-item max size
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **RESTful API**: Clean, well-structured REST endpoints
- **Secure API Key Management**: Environment variable-based configuration
- **CORS Support**: Configured for cross-origin requests

## 🛠️ Tech Stack

### Backend
- **FastAPI** (v0.110.1) - Modern, fast Python web framework
- **Motor** (v3.3.1) - Async MongoDB driver for Python
- **httpx** (v0.28.1) - Async HTTP client for external API calls
- **Pydantic** (v2.12.4) - Data validation and settings management
- **Uvicorn** (v0.25.0) - ASGI server for running FastAPI
- **Python** (3.11+)

### Frontend
- **React** (v19.0.0) - JavaScript library for building user interfaces
- **Create React App** (CRA) - React application boilerplate
- **CRACO** (v7.1.0) - Configuration override for CRA
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **Shadcn/UI** - High-quality, accessible UI component library
- **Axios** (v1.8.4) - HTTP client for API requests
- **Lucide React** (v0.507.0) - Icon library
- **Sonner** (v2.0.3) - Toast notification library

### Database
- **MongoDB** - NoSQL database (used for backend favorites storage, though frontend uses local storage)

### External APIs
- **OMDB API** - Movie database API (https://www.omdbapi.com/)

## 📋 Prerequisites

Before running this application locally, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Yarn** package manager (v1.22+) - [Install Guide](https://yarnpkg.com/getting-started/install)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/downloads/)
- **pip** (Python package manager, usually comes with Python)
- **MongoDB** (running locally or connection string) - [Download](https://www.mongodb.com/try/download/community)
- **OMDB API Key** (free) - [Get API Key](https://www.omdbapi.com/apikey.aspx)

### Verify Installation

```bash
# Check Node.js version
node --version

# Check Yarn version
yarn --version

# Check Python version
python --version

# Check pip version
pip --version

# Check MongoDB (if installed locally)
mongod --version
```

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd finefactor-project
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
# Navigate to project root
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
venv\Scripts\activate.bat

# On macOS/Linux:
source venv/bin/activate
```

#### 2.2 Install Dependencies

```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Windows PowerShell
cd backend
New-Item -Path .env -ItemType File

# macOS/Linux
cd backend
touch .env
```

Add the following content to `backend/.env`:

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="movie_explorer_db"
CORS_ORIGINS="*"
OMDB_API_KEY="your_omdb_api_key_here"
```

**Important**: Replace `your_omdb_api_key_here` with your actual OMDB API key from [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
```

#### 3.2 Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# macOS/Linux
touch .env
```

Add the following content to `frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Note**: If your backend runs on a different port, update this URL accordingly.

### Step 4: Get OMDB API Key

1. Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Choose the free tier (1000 requests/day)
3. Sign up with your email
4. Verify your email and receive your API key
5. Add the key to `backend/.env` file: `OMDB_API_KEY="your_key_here"`

### Step 5: Start MongoDB

#### Windows

```bash
# Option 1: Start MongoDB Service
# Open Services (services.msc) and start "MongoDB" service

# Option 2: Run MongoDB manually
mongod --dbpath "C:\data\db"
```

#### macOS (using Homebrew)

```bash
brew services start mongodb-community
```

#### Linux

```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**

```bash
# Connect to MongoDB shell
mongosh  # or mongo (older versions)

# You should see MongoDB shell prompt
```

## 🏃 Running the Application

### Start Backend Server

Open a terminal and run:

```bash
# Navigate to project root
cd finefactor-project

# Activate virtual environment (if not already activated)
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
venv\Scripts\activate.bat    # Windows CMD
# OR
source venv/bin/activate     # macOS/Linux

# Navigate to backend directory
cd backend

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['D:\\finefactor project\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The backend API will be available at: **http://localhost:8001**

**Test the backend:**
```bash
# In a new terminal
curl http://localhost:8001/api/
```

### Start Frontend Development Server

Open a **new terminal** (keep backend running) and run:

```bash
# Navigate to frontend directory
cd finefactor-project/frontend

# Start the development server
yarn start
```

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use yarn build.
```

The frontend will automatically open in your browser at: **http://localhost:3000**

### Quick Start (Both Servers)

**Windows PowerShell:**

```powershell
# Terminal 1 - Backend
cd "D:\finefactor project"
.\venv\Scripts\Activate.ps1
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2 - Frontend
cd "D:\finefactor project\frontend"
yarn start
```

## 📁 Project Structure

```
finefactor-project/
├── backend/
│   ├── __pycache__/          # Python bytecode cache
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables (not in git)
│
├── frontend/
│   ├── __mocks__/             # Jest mocks for testing
│   │   └── axios.js           # Axios mock for tests
│   ├── public/                # Static assets
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/           # Shadcn UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Application styles
│   │   ├── App.test.js       # React component tests
│   │   ├── index.js          # React entry point
│   │   ├── index.css         # Global styles
│   │   └── setupTests.js     # Jest test configuration
│   ├── plugins/              # CRACO custom plugins
│   ├── components.json       # Shadcn UI configuration
│   ├── craco.config.js       # CRACO webpack configuration
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── postcss.config.js     # PostCSS configuration
│   ├── jsconfig.json         # JavaScript path aliases
│   └── .env                  # Frontend environment variables (not in git)
│
├── tests/                    # Backend test suite
│   ├── __init__.py
│   └── test_api.py           # API endpoint tests
│
├── venv/                     # Python virtual environment (not in git)
├── README.md                 # This file
├── test_result.md            # Test results documentation
└── yarn.lock                 # Yarn lock file
```

## 🔌 API Documentation

### Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:8001/api
```

### Endpoints

#### Health Check

**GET** `/api/`

Returns API metadata and available endpoints.

**Response:**
```json
{
  "message": "OMDB Movie Explorer API",
  "version": "1.0.0",
  "endpoints": [
    "/api/movies/search",
    "/api/movies/{imdb_id}",
    "/api/favorites"
  ]
}
```

#### Search Movies

**GET** `/api/movies/search`

Search for movies, series, or episodes by title.

**Query Parameters:**
- `query` (required, string): Search query (min length: 1)
- `page` (optional, integer): Page number (default: 1, min: 1)

**Example Request:**
```bash
curl "http://localhost:8001/api/movies/search?query=inception&page=1"
```

**Response:**
```json
{
  "Response": "True",
  "Search": [
    {
      "Title": "Inception",
      "Year": "2010",
      "imdbID": "tt1375666",
      "Type": "movie",
      "Poster": "https://..."
    }
  ],
  "totalResults": "100"
}
```

#### Get Movie Details

**GET** `/api/movies/{imdb_id}`

Get detailed information about a specific movie by IMDB ID.

**Path Parameters:**
- `imdb_id` (required, string): IMDB ID (e.g., "tt1375666")

**Example Request:**
```bash
curl "http://localhost:8001/api/movies/tt1375666"
```

**Response:**
```json
{
  "Response": "True",
  "Title": "Inception",
  "Year": "2010",
  "Rated": "PG-13",
  "Released": "16 Jul 2010",
  "Runtime": "148 min",
  "Genre": "Action, Adventure, Sci-Fi",
  "Director": "Christopher Nolan",
  "Writer": "Christopher Nolan",
  "Actors": "Leonardo DiCaprio, Marion Cotillard, Tom Hardy",
  "Plot": "A thief who steals corporate secrets...",
  "Language": "English, Japanese, French",
  "Country": "United States, United Kingdom",
  "Awards": "Won 4 Oscars. 143 wins & 198 nominations total",
  "Poster": "https://...",
  "Ratings": [
    {
      "Source": "Internet Movie Database",
      "Value": "8.8/10"
    },
    {
      "Source": "Rotten Tomatoes",
      "Value": "87%"
    },
    {
      "Source": "Metacritic",
      "Value": "74/100"
    }
  ],
  "Metascore": "74",
  "imdbRating": "8.8",
  "imdbVotes": "2,448,123",
  "imdbID": "tt1375666",
  "Type": "movie",
  "DVD": "07 Dec 2010",
  "BoxOffice": "$292,576,195",
  "Production": "N/A",
  "Website": "N/A"
}
```

#### Favorites Endpoints

**Note**: These endpoints are available but the frontend uses browser local storage for favorites. These endpoints can be used for future server-side synchronization.

**GET** `/api/favorites`

Get all favorite movies from MongoDB.

**POST** `/api/favorites`

Add a movie to favorites.

**Request Body:**
```json
{
  "imdbID": "tt1375666",
  "title": "Inception",
  "year": "2010",
  "poster": "https://...",
  "type": "movie"
}
```

**DELETE** `/api/favorites/{imdb_id}`

Remove a movie from favorites.

**GET** `/api/favorites/check/{imdb_id}`

Check if a movie is in favorites.

**Response:**
```json
{
  "isFavorite": true
}
```

### Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "detail": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error message"
}
```

**502 Bad Gateway:**
```json
{
  "detail": "Error connecting to OMDB API"
}
```

**504 Gateway Timeout:**
```json
{
  "detail": "OMDB API request timed out"
}
```

## ✅ Testing

### Backend Tests

Run the backend test suite using pytest:

```bash
# Navigate to project root
cd finefactor-project

# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
source venv/bin/activate      # macOS/Linux

# Run tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py
```

**Expected Output:**
```
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.1
collected 3 items

tests\test_api.py ...                                                    [100%]

======================== 3 passed in 1.16s ==============================
```

**Test Coverage:**
- Health check endpoint
- Movie search endpoint
- Movie details endpoint

### Frontend Tests

Run the frontend test suite using Jest:

```bash
# Navigate to frontend directory
cd frontend

# Run tests (CI mode, no watch)
# Windows PowerShell:
$env:CI="true"; yarn test --watchAll=false

# Windows CMD:
set CI=true && yarn test --watchAll=false

# macOS/Linux:
CI=true yarn test --watchAll=false
```

**Expected Output:**
```
PASS src/App.test.js
  ✓ renders search input and updates favorites count from local storage (152 ms)
  ✓ adds a searched movie to favorites via local storage (146 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

**Test Coverage:**
- Component rendering
- Local storage favorites functionality
- User interactions

### Manual Testing

The application has been manually tested across multiple devices and browsers:

- **Windows 11 + Chrome 129** @ 1920×1080 — Verified movie search, detail modal, favorites add/remove
- **Chrome DevTools iPhone 12** preset (390×844) — Confirmed responsive layout, tabs usable, local storage favorites persist
- **Chrome DevTools iPad Air** preset (820×1180) — Validated grid density, modal scroll behavior, toasts readable
- **Edge 129** @ 1366×768 — Smoke-tested navigation between tabs and pagination controls

## 🔧 Configuration

### Backend Environment Variables

File: `backend/.env`

```env
# MongoDB Connection
MONGO_URL="mongodb://localhost:27017"

# Database Name
DB_NAME="movie_explorer_db"

# CORS Origins (comma-separated, use * for all)
CORS_ORIGINS="*"

# OMDB API Key (required)
OMDB_API_KEY="your_omdb_api_key_here"
```

### Frontend Environment Variables

File: `frontend/.env`

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Webpack Dev Server Socket Port (optional)
WDS_SOCKET_PORT=443

# Visual Edits (optional)
REACT_APP_ENABLE_VISUAL_EDITS=false

# Health Check (optional)
ENABLE_HEALTH_CHECK=false
```

### Cache Configuration

The backend uses an in-memory LRU cache with the following settings:

- **TTL (Time To Live)**: 10 minutes (600 seconds)
- **Max Size**: 100 items
- **Eviction Policy**: Least Recently Used (LRU)

Cache configuration is in `backend/server.py`:

```python
movie_cache = SimpleCache(ttl=600)  # 10 minutes cache
```

## 🐛 Troubleshooting

### Backend Issues

#### "uvicorn is not recognized"

**Problem**: PowerShell can't find the `uvicorn` command.

**Solution**: Activate the virtual environment first:

```powershell
cd "D:\finefactor project"
.\venv\Scripts\Activate.ps1
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Alternative**: Use Python module syntax:

```powershell
cd backend
..\venv\Scripts\python.exe -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### MongoDB Connection Error

**Problem**: Backend can't connect to MongoDB.

**Solutions**:

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   # Open Services (services.msc) and check MongoDB service status
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Start MongoDB:**
   ```bash
   # Windows - Start service
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Verify connection:**
   ```bash
   mongosh  # or mongo
   ```

4. **Check connection string in `.env`:**
   ```env
   MONGO_URL="mongodb://localhost:27017"
   ```

#### OMDB API Errors

**Problem**: API requests fail or return errors.

**Solutions**:

1. **Verify API key:**
   - Check `backend/.env` has correct `OMDB_API_KEY`
   - Ensure no extra quotes or spaces

2. **Check API limits:**
   - Free tier: 1000 requests/day
   - Verify at [OMDB API](https://www.omdbapi.com/)

3. **Test API key directly:**
   ```bash
   curl "http://www.omdbapi.com/?apikey=YOUR_KEY&s=inception"
   ```

4. **Check internet connectivity:**
   ```bash
   ping www.omdbapi.com
   ```

#### Port Already in Use

**Problem**: Port 8001 is already in use.

**Solutions**:

1. **Find process using port:**
   ```powershell
   # Windows
   netstat -ano | findstr :8001
   
   # macOS/Linux
   lsof -i :8001
   ```

2. **Kill the process:**
   ```powershell
   # Windows (replace PID with actual process ID)
   taskkill /PID <PID> /F
   
   # macOS/Linux
   kill -9 <PID>
   ```

3. **Use a different port:**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8002 --reload
   ```
   Then update `frontend/.env`: `REACT_APP_BACKEND_URL=http://localhost:8002`

### Frontend Issues

#### CORS Errors

**Problem**: Browser blocks requests with CORS error.

**Solutions**:

1. **Verify backend CORS configuration:**
   - Check `backend/.env`: `CORS_ORIGINS="*"` or include your frontend URL
   - Restart backend server after changing `.env`

2. **Check backend URL:**
   - Verify `frontend/.env`: `REACT_APP_BACKEND_URL=http://localhost:8001`
   - Restart frontend dev server after changing `.env`

3. **Verify backend is running:**
   ```bash
   curl http://localhost:8001/api/
   ```

#### Module Not Found Errors

**Problem**: Missing dependencies or import errors.

**Solutions**:

1. **Reinstall dependencies:**
   ```bash
   cd frontend
   rm -rf node_modules yarn.lock  # macOS/Linux
   # OR
   Remove-Item -Recurse -Force node_modules, yarn.lock  # Windows PowerShell
   yarn install
   ```

2. **Clear cache:**
   ```bash
   yarn cache clean
   yarn install
   ```

#### Port 3000 Already in Use

**Problem**: Frontend can't start on port 3000.

**Solutions**:

1. **Kill process on port 3000:**
   ```powershell
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   ```

2. **Use different port:**
   ```bash
   PORT=3001 yarn start
   ```

#### Local Storage Not Working

**Problem**: Favorites not persisting.

**Solutions**:

1. **Check browser console for errors:**
   - Open DevTools (F12)
   - Check Console tab for errors

2. **Verify browser allows local storage:**
   - Check if browser is in private/incognito mode
   - Some browsers block local storage in private mode

3. **Clear browser cache:**
   - Clear site data and reload

#### Movies Not Loading

**Problem**: Search returns no results or errors.

**Solutions**:

1. **Check backend is running:**
   ```bash
   curl http://localhost:8001/api/
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Check Network tab for failed requests
   - Check Console tab for errors

3. **Verify API key:**
   - Check `backend/.env` has valid `OMDB_API_KEY`
   - Restart backend after changing `.env`

4. **Test backend directly:**
   ```bash
   curl "http://localhost:8001/api/movies/search?query=inception&page=1"
   ```

## 📝 Development Notes

### Architecture

- **Backend**: FastAPI with async/await for non-blocking I/O
- **Frontend**: React with hooks for state management
- **Caching**: In-memory LRU cache on backend (10 min TTL, 100 items max)
- **Storage**: Browser local storage for favorites (frontend)
- **API Communication**: Axios for HTTP requests

### Key Implementation Details

1. **Caching Strategy**:
   - Cache keys: `search:{query}:{page}` and `detail:{imdb_id}`
   - Automatic expiration after 10 minutes
   - LRU eviction when cache exceeds 100 items

2. **Error Handling**:
   - Backend: HTTP status codes with descriptive error messages
   - Frontend: Toast notifications for user feedback
   - Graceful degradation for missing data

3. **Favorites Implementation**:
   - Frontend uses browser `localStorage` for persistence
   - Key: `cineexplorer_favorites`
   - Backend endpoints available for future server-side sync

4. **Responsive Design**:
   - Mobile-first approach
   - Breakpoints: sm (640px), md (768px), lg (1024px)
   - Grid adapts from 2 columns (mobile) to 5 columns (desktop)

### Performance Optimizations

- Backend caching reduces OMDB API calls
- React component memoization where appropriate
- Lazy loading for images
- Optimized bundle size with code splitting

### Security Considerations

- API keys stored in environment variables (never in code)
- CORS configured for development (adjust for production)
- Input validation on backend endpoints
- Error messages don't expose sensitive information

### Future Enhancements

- Server-side favorites synchronization
- User authentication and accounts
- Advanced filtering and sorting
- Watchlist functionality
- Movie recommendations
- Export favorites to CSV/JSON

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Built with ❤️ by Harshita Singh

---
