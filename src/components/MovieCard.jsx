import { Link } from 'react-router-dom';
import { tmdb } from '../api/api';
import './MovieCard.css';

export default function MovieCard({ movie, size = 'medium' }) {
    const imageUrl = tmdb.getImageUrl(movie.poster_path || movie.posterPath, 'w342');

    return (
        <Link to={`/movie/${movie.id}`} className={`movie-card ${size}`}>
            <div className="movie-card-image">
                <img
                    src={imageUrl}
                    alt={movie.title}
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/assets/placeholder.jpg';
                    }}
                />
                <div className="movie-card-overlay">
                    <button className="play-btn" aria-label="Oynat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            {size !== 'small' && (
                <div className="movie-card-info">
                    <h4 className="movie-title">{movie.title}</h4>
                    {movie.vote_average > 0 && (
                        <div className="movie-rating">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--rating-gold)">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span>{movie.vote_average?.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            )}
        </Link>
    );
}
