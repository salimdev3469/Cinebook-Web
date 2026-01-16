import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { tmdb } from '../api/api';
import MovieCard from '../components/MovieCard';
import './GenreMoviesPage.css';

export default function GenreMoviesPage() {
    const { genreId } = useParams();
    const [searchParams] = useSearchParams();
    const genreName = searchParams.get('name') || 'Filmler';

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            try {
                const data = await tmdb.getMoviesByGenre(genreId, page);
                if (page === 1) {
                    setMovies(data);
                } else {
                    setMovies(prev => [...prev, ...data]);
                }
                setHasMore(data.length === 20);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [genreId, page]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="genre-movies-page">
            <header className="page-header">
                <Link to="/categories" className="back-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </Link>
                <h1>{genreName}</h1>
            </header>

            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {loading && (
                <div className="loading-more">
                    <div className="spinner" />
                </div>
            )}

            {hasMore && !loading && (
                <button className="load-more-btn" onClick={loadMore}>
                    Daha Fazla Yükle
                </button>
            )}
        </div>
    );
}
