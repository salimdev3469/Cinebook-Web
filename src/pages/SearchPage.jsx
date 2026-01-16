import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../api/api';
import { searchLocalMovies } from '../api/firebase';
import './SearchPage.css';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setSearched(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch(query);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const performSearch = async (searchQuery) => {
        setLoading(true);
        setSearched(true);
        try {
            // Search both TMDB and Firebase local movies
            const [tmdbResults, localResults] = await Promise.all([
                tmdb.searchMovies(searchQuery).catch(() => []),
                searchLocalMovies(searchQuery).catch(() => [])
            ]);

            // Combine results - local movies first, then TMDB
            const combinedResults = [...localResults, ...tmdbResults];

            // Remove duplicates by ID
            const uniqueResults = combinedResults.filter((movie, index, self) =>
                index === self.findIndex(m => m.id === movie.id)
            );

            setResults(uniqueResults);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-page">
            <header className="search-header">
                <Link to="/" className="back-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </Link>
                <div className="search-input-container">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Film ara..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {query && (
                        <button className="clear-btn" onClick={() => setQuery('')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                            </svg>
                        </button>
                    )}
                </div>
            </header>

            <div className="search-results">
                {!searched && !query && (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--divider-color)">
                            <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <p>Film aramak için yazın...</p>
                    </div>
                )}

                {loading && (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                )}

                {searched && !loading && results.length === 0 && (
                    <div className="empty-state">
                        <p>Sonuç bulunamadı.</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="results-list">
                        {results.map((movie) => (
                            <SearchResultItem key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SearchResultItem({ movie }) {
    // Handle both TMDB and Firebase local data structures
    const posterPath = movie.poster_path || movie.poster || movie.posterPath;
    const imageUrl = tmdb.getImageUrl(posterPath, 'w92');
    const year = movie.year || (movie.release_date ? new Date(movie.release_date).getFullYear() : '');

    return (
        <Link to={`/movie/${movie.id}`} className="result-item">
            <div className="result-poster">
                {posterPath ? (
                    <img src={imageUrl} alt={movie.title} />
                ) : (
                    <div className="no-poster">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text-grey)">
                            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="result-info">
                <h3>{movie.title}</h3>
                <span className="result-year">{year}</span>
            </div>
        </Link>
    );
}
