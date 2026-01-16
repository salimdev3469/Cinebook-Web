import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { tmdb } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { addToWatchList, addToWatchedList, removeFromWatchList, removeFromWatchedList, isInWatchList, isInWatchedList, getLocalMovies } from '../api/firebase';
import MovieCard from '../components/MovieCard';
import './MovieDetailPage.css';

export default function MovieDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [movie, setMovie] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trailerKey, setTrailerKey] = useState(null);
    const [inWatchList, setInWatchList] = useState(false);
    const [inWatchedList, setInWatchedList] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [isLocalMovie, setIsLocalMovie] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // First check if it's a local Firebase movie
                const localMovies = await getLocalMovies().catch(() => []);
                const localMovie = localMovies.find(m => String(m.id) === String(id));

                if (localMovie) {
                    // It's a local movie from Firebase
                    setIsLocalMovie(true);
                    setMovie({
                        id: localMovie.id,
                        title: localMovie.title,
                        overview: localMovie.overview,
                        poster_path: localMovie.poster,
                        backdrop_path: localMovie.backdrop,
                        vote_average: localMovie.rating || 0,
                        release_date: localMovie.year ? `${localMovie.year}-01-01` : null,
                        genres: localMovie.genre_ids?.map(g => ({ id: g, name: g })) || [],
                        runtime: null
                    });
                    setTrailerKey(localMovie.trailer || null);
                    setSimilar([]);
                } else {
                    // It's a TMDB movie
                    setIsLocalMovie(false);
                    const [details, similarData] = await Promise.all([
                        tmdb.getMovieDetails(id),
                        tmdb.getSimilarMovies(id),
                    ]);
                    setMovie(details);
                    setSimilar(similarData.slice(0, 9));

                    // Get trailer
                    const trailer = details.videos?.results?.find(
                        (v) => v.type === 'Trailer' && v.site === 'YouTube'
                    );
                    if (trailer) {
                        setTrailerKey(trailer.key);
                    } else {
                        const key = await tmdb.getMovieTrailer(id);
                        setTrailerKey(key);
                    }
                }

                // Check list status if authenticated
                if (user) {
                    const movieId = isNaN(parseInt(id)) ? id : parseInt(id);
                    const [watchStatus, watchedStatus] = await Promise.all([
                        isInWatchList(user.uid, movieId),
                        isInWatchedList(user.uid, movieId),
                    ]);
                    setInWatchList(watchStatus);
                    setInWatchedList(watchedStatus);
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id, user]);

    const handleToggleWatchList = async () => {
        if (!isAuthenticated || !movie) return;
        setActionLoading(true);
        try {
            if (inWatchList) {
                await removeFromWatchList(user.uid, movie.id);
                setInWatchList(false);
            } else {
                if (inWatchedList) {
                    await removeFromWatchedList(user.uid, movie.id);
                    setInWatchedList(false);
                }
                await addToWatchList(user.uid, movie);
                setInWatchList(true);
            }
        } catch (error) {
            console.error('Error toggling watch list:', error);
        }
        setActionLoading(false);
    };

    const handleToggleWatchedList = async () => {
        if (!isAuthenticated || !movie) return;
        setActionLoading(true);
        try {
            if (inWatchedList) {
                await removeFromWatchedList(user.uid, movie.id);
                setInWatchedList(false);
            } else {
                if (inWatchList) {
                    await removeFromWatchList(user.uid, movie.id);
                    setInWatchList(false);
                }
                await addToWatchedList(user.uid, movie);
                setInWatchedList(true);
            }
        } catch (error) {
            console.error('Error toggling watched list:', error);
        }
        setActionLoading(false);
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareTitle = movie?.title || 'CineBook Film';
        const shareText = `${shareTitle} filmini CineBook'ta keşfet!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="movie-detail-page loading">
                <div className="spinner" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-detail-page error">
                <h2>Film bulunamadı</h2>
                <Link to="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    const backdropUrl = tmdb.getImageUrl(movie.backdrop_path, 'original');
    const posterUrl = tmdb.getImageUrl(movie.poster_path, 'w500');
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';

    return (
        <div className="movie-detail-page">
            {/* Backdrop */}
            <div className="detail-backdrop" style={{ backgroundImage: `url(${backdropUrl})` }}>
                <div className="backdrop-gradient" />
            </div>

            {/* Back Button */}
            <button
                className="back-btn"
                onClick={() => {
                    if (window.history.length > 1) {
                        navigate(-1);
                    } else {
                        navigate('/');
                    }
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
            </button>

            {/* Content */}
            <div className="detail-content">
                <div className="detail-poster">
                    <img src={posterUrl} alt={movie.title} />
                </div>

                <div className="detail-info">
                    <h1 className="detail-title">{movie.title}</h1>

                    <div className="detail-meta">
                        <span className="year">{year}</span>
                        <span className="rating">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--rating-gold)">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            {movie.vote_average?.toFixed(1)}
                        </span>
                        {movie.runtime && <span className="runtime">{movie.runtime} dk</span>}
                    </div>

                    {/* Genres */}
                    <div className="detail-genres">
                        {movie.genres?.map((genre) => (
                            <Link
                                key={genre.id}
                                to={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                                className="genre-tag"
                            >
                                {genre.name}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="detail-actions">
                        <button
                            className={`list-btn ${inWatchList ? 'active' : ''}`}
                            onClick={handleToggleWatchList}
                            disabled={actionLoading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {inWatchList ? (
                                    <path d="M20 6L9 17l-5-5" />
                                ) : (
                                    <path d="M12 5v14M5 12h14" />
                                )}
                            </svg>
                            <span>{inWatchList ? 'Listede' : 'İzleyeceğim'}</span>
                        </button>

                        <button
                            className={`list-btn watched ${inWatchedList ? 'active' : ''}`}
                            onClick={handleToggleWatchedList}
                            disabled={actionLoading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={inWatchedList ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>{inWatchedList ? 'İzlendi' : 'İzledim'}</span>
                        </button>

                        {/* Share Button */}
                        <button className="list-btn share" onClick={handleShare}>
                            {shareSuccess ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <polyline points="16 6 12 2 8 6" />
                                    <line x1="12" y1="2" x2="12" y2="15" />
                                </svg>
                            )}
                            <span>{shareSuccess ? 'Kopyalandı' : 'Paylaş'}</span>
                        </button>
                    </div>

                    {/* Overview */}
                    <div className="detail-overview">
                        <h3>Özet</h3>
                        <p>{movie.overview || 'Açıklama bulunmuyor.'}</p>
                    </div>
                </div>
            </div>

            {/* Trailer Section */}
            {trailerKey && (
                <div className="trailer-section">
                    <h2>Fragman</h2>
                    <div className="trailer-container">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                            title="Fragman"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* Similar Movies */}
            {similar.length > 0 && (
                <div className="similar-section">
                    <h2>Benzer Filmler</h2>
                    <div className="similar-grid">
                        {similar.map((m) => (
                            <MovieCard key={m.id} movie={m} size="small" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
