import { useRef } from 'react';
import MovieCard from './MovieCard';
import './MovieSlider.css';

export default function MovieSlider({ title, movies, loading = false }) {
    const sliderRef = useRef(null);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth * 0.8;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (loading) {
        return (
            <section className="movie-slider">
                <h2 className="slider-title">{title}</h2>
                <div className="slider-container">
                    <div className="slider-track">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-image" />
                                <div className="skeleton-text" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <section className="movie-slider">
            <h2 className="slider-title">{title}</h2>

            <div className="slider-container">
                {/* Left Arrow */}
                <button
                    className="slider-arrow left"
                    onClick={() => scroll('left')}
                    aria-label="Sola kaydır"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </button>

                {/* Movies Track */}
                <div className="slider-track" ref={sliderRef}>
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    className="slider-arrow right"
                    onClick={() => scroll('right')}
                    aria-label="Sağa kaydır"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                    </svg>
                </button>
            </div>
        </section>
    );
}
