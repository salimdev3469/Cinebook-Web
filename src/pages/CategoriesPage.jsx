import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tmdb } from '../api/api';
import './CategoriesPage.css';

export default function CategoriesPage() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGenres() {
            try {
                const data = await tmdb.getGenres();
                setGenres(data);
            } catch (error) {
                console.error('Error fetching genres:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchGenres();
    }, []);

    if (loading) {
        return (
            <div className="categories-page loading">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="categories-page">
            <header className="page-header">
                <Link to="/" className="back-link">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </Link>
                <h1>Kategoriler</h1>
            </header>

            <div className="genres-list">
                {genres.map((genre) => (
                    <Link
                        key={genre.id}
                        to={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                        className="genre-item"
                    >
                        <span className="genre-name">{genre.name}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                        </svg>
                    </Link>
                ))}
            </div>
        </div>
    );
}
