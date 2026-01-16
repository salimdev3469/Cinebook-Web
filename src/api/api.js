/**
 * CineBook API Client
 * Connects to the Flask backend for movies, chat, and search
 */

// Configure this with your Flask API URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// TMDB API for fetching movies directly (backup)
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithError(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Flask Backend API
 */
export const api = {
    /**
     * Health check - ping the server
     */
    ping: async () => {
        return fetchWithError(`${API_BASE}/ping`);
    },

    /**
     * Search movies (TMDB + Local)
     * @param {string} query - Search query
     */
    search: async (query) => {
        return fetchWithError(`${API_BASE}/search`, {
            method: 'POST',
            body: JSON.stringify({ query }),
        });
    },

    /**
     * Get all local movies from database
     */
    getMovies: async () => {
        const data = await fetchWithError(`${API_BASE}/movies`);
        return data.movies || [];
    },
};

/**
 * TMDB Direct API (for movie listings)
 */
export const tmdb = {
    /**
     * Get image URL
     */
    getImageUrl: (path, size = 'w500') => {
        if (!path) return '/assets/placeholder.jpg';
        if (path.startsWith('http')) return path;
        return `${TMDB_IMAGE_BASE}/${size}${path}`;
    },

    /**
     * Get trending movies
     */
    getTrending: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get popular movies
     */
    getPopular: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get top rated movies
     */
    getTopRated: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get now playing movies
     */
    getNowPlaying: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get upcoming movies
     */
    getUpcoming: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/upcoming?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get movie details
     * @param {number} movieId - Movie ID
     */
    getMovieDetails: async (movieId) => {
        return fetchWithError(
            `${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=tr-TR&append_to_response=videos,credits`
        );
    },

    /**
     * Get similar movies
     * @param {number} movieId - Movie ID
     */
    getSimilarMovies: async (movieId) => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Search movies
     * @param {string} query - Search query
     */
    searchMovies: async (query) => {
        const data = await fetchWithError(
            `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR`
        );
        return data.results || [];
    },

    /**
     * Get all genres
     */
    getGenres: async () => {
        const data = await fetchWithError(
            `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=tr-TR`
        );
        return data.genres || [];
    },

    /**
     * Get movies by genre
     * @param {number} genreId - Genre ID
     * @param {number} page - Page number
     */
    getMoviesByGenre: async (genreId, page = 1) => {
        const data = await fetchWithError(
            `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&with_genres=${genreId}&page=${page}`
        );
        return data.results || [];
    },

    /**
     * Get movie trailer
     * @param {number} movieId - Movie ID
     */
    getMovieTrailer: async (movieId) => {
        const data = await fetchWithError(
            `${TMDB_BASE}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        const results = data.results || [];
        const trailer = results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        return trailer?.key || (results.find(v => v.site === 'YouTube')?.key) || null;
    },
};

/**
 * Movie data transformer
 */
export const transformMovie = (movie) => ({
    id: movie.id,
    title: movie.title || movie.name,
    overview: movie.overview || '',
    rating: movie.vote_average || 0,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    posterPath: movie.poster_path || movie.poster || movie.posterPath,
    backdropPath: movie.backdrop_path || movie.backdrop || movie.backdropPath,
    genreIds: movie.genre_ids || [],
});

export default api;
