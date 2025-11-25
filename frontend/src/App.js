import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Search, Star, Film, Heart, Calendar, Clock, Award, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";
const API = `${BACKEND_URL}/api`;
const LOCAL_STORAGE_KEY = "cineexplorer_favorites";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const storedFavorites = (() => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!raw) {
          return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error("Failed to parse stored favorites:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return [];
      }
    })();
    setFavorites(storedFavorites);
    setFavoriteIds(new Set(storedFavorites.map((fav) => fav.imdbID)));
  }, []);

  const syncFavorites = (updatedFavorites) => {
    setFavorites(updatedFavorites);
    setFavoriteIds(new Set(updatedFavorites.map((fav) => fav.imdbID)));
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error("Failed to persist favorites:", error);
    }
  };

  const searchMovies = async (query, page = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API}/movies/search`, {
        params: { query: query.trim(), page }
      });
      
      if (response.data.Response === "True") {
        setMovies(response.data.Search || []);
        setTotalResults(parseInt(response.data.totalResults) || 0);
        setCurrentPage(page);
        setActiveTab("search");
      } else {
        setMovies([]);
        setTotalResults(0);
        toast.error(response.data.Error || "No movies found");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search movies. Please try again.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMovies(searchQuery, 1);
    }
  };

  const loadMovieDetails = async (imdbID) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(`${API}/movies/${imdbID}`);
      if (response.data.Response === "True") {
        setSelectedMovie(response.data);
      } else {
        toast.error("Failed to load movie details");
      }
    } catch (error) {
      console.error("Error loading details:", error);
      toast.error("Failed to load movie details");
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleFavorite = (movie) => {
    const imdbID = movie.imdbID || movie.imdbId || movie.id;
    if (!imdbID) {
      toast.error("Movie is missing an IMDB id");
      return;
    }

    const isFavorite = favoriteIds.has(imdbID);

    if (isFavorite) {
      const updatedFavorites = favorites.filter((fav) => fav.imdbID !== imdbID);
      syncFavorites(updatedFavorites);
      toast.success("Removed from favorites");
      return;
    }

    const normalizedFavorite = {
      imdbID,
      title: movie.Title || movie.title || "Untitled",
      year: movie.Year || movie.year || "N/A",
      poster: movie.Poster || movie.poster || "N/A",
      type: movie.Type || movie.type || "movie"
    };

    const updatedFavorites = [normalizedFavorite, ...favorites];
    syncFavorites(updatedFavorites);
    toast.success("Added to favorites");
  };

  const MovieCard = ({ movie, onClickCard }) => {
    const isFavorite = favoriteIds.has(movie.imdbID);
    const posterUrl = movie.Poster !== "N/A" ? movie.Poster : movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450/1e293b/64748b?text=No+Poster";
    
    return (
      <Card 
        data-testid={`movie-card-${movie.imdbID}`}
        className="group relative overflow-hidden bg-slate-800/40 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
      >
        <div className="relative aspect-[2/3] overflow-hidden" onClick={() => onClickCard(movie)}>
          <img 
            src={posterUrl}
            alt={movie.Title || movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => e.target.src = "https://via.placeholder.com/300x450/1e293b/64748b?text=No+Poster"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
          
          <button
            data-testid={`favorite-btn-${movie.imdbID}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(movie);
            }}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 hover:bg-amber-500 hover:border-amber-400 transition-all duration-300 group/btn"
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite 
                  ? "fill-amber-500 text-amber-500" 
                  : "text-slate-300 group-hover/btn:text-white"
              }`}
            />
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-amber-400 transition-colors duration-300">
            {movie.Title || movie.title}
          </h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {movie.Year || movie.year}
            </span>
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs capitalize">
              {movie.Type || movie.type}
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  const MovieDetailModal = () => {
    if (!selectedMovie) return null;
    
    const posterUrl = selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : "https://via.placeholder.com/400x600/1e293b/64748b?text=No+Poster";
    const isFavorite = favoriteIds.has(selectedMovie.imdbID);
    
    return (
      <DialogContent 
        data-testid="movie-detail-modal"
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {selectedMovie.Title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid md:grid-cols-[300px,1fr] gap-6 mt-4">
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img 
                    src={posterUrl}
                    alt={selectedMovie.Title}
                    className="w-full h-auto"
                    onError={(e) => e.target.src = "https://via.placeholder.com/400x600/1e293b/64748b?text=No+Poster"}
                  />
                </div>
                
                <Button 
                  data-testid="favorite-detail-btn"
                  onClick={() => toggleFavorite(selectedMovie)}
                  className={`w-full ${
                    isFavorite 
                      ? "bg-amber-500 hover:bg-amber-600 text-white" 
                      : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-white" : ""}`} />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.Year && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      <Calendar className="w-3 h-3 mr-1" />
                      {selectedMovie.Year}
                    </Badge>
                  )}
                  {selectedMovie.Rated && selectedMovie.Rated !== "N/A" && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      {selectedMovie.Rated}
                    </Badge>
                  )}
                  {selectedMovie.Runtime && selectedMovie.Runtime !== "N/A" && (
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      <Clock className="w-3 h-3 mr-1" />
                      {selectedMovie.Runtime}
                    </Badge>
                  )}
                </div>
                
                {selectedMovie.Plot && selectedMovie.Plot !== "N/A" && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-2">Plot</h3>
                    <p className="text-slate-300 leading-relaxed">{selectedMovie.Plot}</p>
                  </div>
                )}
                
                {selectedMovie.Genre && selectedMovie.Genre !== "N/A" && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-2">Genre</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovie.Genre.split(", ").map(genre => (
                        <Badge key={genre} className="bg-slate-800 text-amber-400 border-amber-500/30">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedMovie.Director && selectedMovie.Director !== "N/A" && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Director</h4>
                      <p className="text-slate-200">{selectedMovie.Director}</p>
                    </div>
                  )}
                  
                  {selectedMovie.Actors && selectedMovie.Actors !== "N/A" && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Cast</h4>
                      <p className="text-slate-200">{selectedMovie.Actors}</p>
                    </div>
                  )}
                  
                  {selectedMovie.imdbRating && selectedMovie.imdbRating !== "N/A" && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">IMDB Rating</h4>
                      <p className="text-amber-400 font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {selectedMovie.imdbRating}/10
                      </p>
                    </div>
                  )}
                  
                  {selectedMovie.Awards && selectedMovie.Awards !== "N/A" && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-1">Awards</h4>
                      <p className="text-slate-200 flex items-start gap-1">
                        <Award className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{selectedMovie.Awards}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedMovie.Ratings && selectedMovie.Ratings.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-amber-400 mb-2">Ratings</h3>
                    <div className="space-y-2">
                      {selectedMovie.Ratings.map((rating, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                          <span className="text-slate-300">{rating.Source}</span>
                          <span className="text-amber-400 font-semibold">{rating.Value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    );
  };

  const totalPages = Math.ceil(totalResults / 10);

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg shadow-amber-500/30">
                <Film className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              OMDB Movie Explorer
              </h1>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50 border border-slate-700/50">
              <TabsTrigger 
                data-testid="search-tab"
                value="search" 
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger 
                data-testid="favorites-tab"
                value="favorites"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="search" className="space-y-8">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  data-testid="search-input"
                  type="text"
                  placeholder="Search for movies, series, episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-4 text-lg bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Button 
                  data-testid="search-button"
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
              </form>
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
                <p className="text-slate-400">Searching movies...</p>
              </div>
            ) : movies.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-slate-400">
                    Found <span className="text-amber-400 font-semibold">{totalResults}</span> results
                  </p>
                  {totalPages > 1 && (
                    <p className="text-slate-400">
                      Page {currentPage} of {totalPages}
                    </p>
                  )}
                </div>
                
                <div data-testid="movies-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {movies.map((movie) => (
                    <MovieCard 
                      key={movie.imdbID} 
                      movie={movie}
                      onClickCard={(m) => {
                        loadMovieDetails(m.imdbID);
                      }}
                    />
                  ))}
                </div>
                
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      data-testid="prev-page-btn"
                      onClick={() => searchMovies(searchQuery, currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Previous
                    </Button>
                    <Button
                      data-testid="next-page-btn"
                      onClick={() => searchMovies(searchQuery, currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : searchQuery ? (
              <div className="text-center py-20">
                <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No movies found for "{searchQuery}"</p>
                <p className="text-slate-500 mt-2">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="text-center py-20">
                <TrendingUp className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Start exploring movies</p>
                <p className="text-slate-500 mt-2">Search for your favorite movies, series, or episodes</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favorites.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6">Your Favorite Movies</h2>
                <div data-testid="favorites-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {favorites.map((movie) => (
                    <MovieCard 
                      key={movie.imdbID} 
                      movie={movie}
                      onClickCard={(m) => {
                        loadMovieDetails(m.imdbID);
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No favorites yet</p>
                <p className="text-slate-500 mt-2">Start adding movies to your favorites collection</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Movie Detail Dialog */}
      <Dialog open={selectedMovie !== null} onOpenChange={(open) => !open && setSelectedMovie(null)}>
        <MovieDetailModal />
      </Dialog>
    </div>
  );
}

export default App;
