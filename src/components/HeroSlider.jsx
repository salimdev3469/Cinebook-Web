import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { addToWatchList, isInWatchList } from '../api/firebase';
import './HeroSlider.css';

export default function HeroSlider({ movies }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [inWatchList, setInWatchList] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!movies || movies.length <= 1) return;

        const interval = setInterval(() => {
            goToNext();
        }, 6000);

        return () => clearInterval(interval);
    }, [movies, currentIndex]);

    // Check watch list status when movie or user changes
    useEffect(() => {
        async function checkStatus() {
            if (user && movies && movies[currentIndex]) {
                const status = await isInWatchList(user.uid, movies[currentIndex].id);
                setInWatchList(status);
            } else {
                setInWatchList(false);
            }
        }
        checkStatus();
    }, [currentIndex, user, movies]);

    const goToNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % movies.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const goToPrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handleAddToList = async () => {
        if (!isAuthenticated || !movies[currentIndex]) return;

        setActionLoading(true);
        try {
            await addToWatchList(user.uid, movies[currentIndex]);
            setInWatchList(true);
        } catch (error) {
            console.error('Error adding to list:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (!movies || movies.length === 0) {
        return (
            <div className="hero-slider skeleton">
                <div className="hero-skeleton-content" />
            </div>
        );
    }

    const movie = movies[currentIndex];
    const backdropUrl = tmdb.getImageUrl(movie.backdrop_path || movie.backdropPath, 'original');

    return (
        <section className="hero-slider">
            {/* Background */}
            <div
                className="hero-backdrop"
                style={{ backgroundImage: `url(${backdropUrl})` }}
            />

            {/* Gradient Overlay */}
            <div className="hero-gradient" />

            {/* Content */}
            <div className="hero-content">
                <h1 className="hero-title animate-slide-up">{movie.title}</h1>

                <p className="hero-overview animate-slide-up">
                    {movie.overview?.slice(0, 200)}
                    {movie.overview?.length > 200 ? '...' : ''}
                </p>

                <div className="hero-actions animate-slide-up">
                    <Link to={`/movie/${movie.id}`} className="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        İncele
                    </Link>
                    <button
                        className={`btn btn-outline ${inWatchList ? 'added' : ''}`}
                        onClick={handleAddToList}
                        disabled={actionLoading || inWatchList || !isAuthenticated}
                    >
                        {inWatchList ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        )}
                        {inWatchList ? 'Listede' : 'Listeme Ekle'}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="hero-nav">
                <button onClick={goToPrev} className="hero-arrow" aria-label="Önceki">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>
                <button onClick={goToNext} className="hero-arrow" aria-label="Sonraki">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                    </svg>
                </button>
            </div>

            {/* Dots */}
            <div className="hero-dots">
                {movies.map((_, index) => (
                    <button
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}

