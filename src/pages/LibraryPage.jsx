import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserLists, removeFromWatchList, removeFromWatchedList } from '../api/firebase';
import { tmdb } from '../api/api';
import './LibraryPage.css';

export default function LibraryPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('watch');
    const [lists, setLists] = useState({ watch_list: [], watched_list: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const unsubscribe = subscribeToUserLists(user.uid, (data) => {
            setLists(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isAuthenticated]);

    const handleRemove = async (movieId, listType) => {
        if (!user) return;

        if (listType === 'watch') {
            await removeFromWatchList(user.uid, movieId);
        } else {
            await removeFromWatchedList(user.uid, movieId);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="library-page">
                <header className="library-header">
                    <img src="/assets/cinebook.png" alt="CineBook" className="library-logo" />
                </header>
                <div className="auth-prompt">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--divider-color)">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    <h2>Kütüphaneye erişmek için giriş yapın</h2>
                    <p>Film listelerinizi görmek ve yönetmek için hesabınıza giriş yapın.</p>
                    <Link to="/login" className="btn btn-primary">
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    const currentList = activeTab === 'watch' ? lists.watch_list : lists.watched_list;

    return (
        <div className="library-page">
            <header className="library-header">
                <img src="/assets/cinebook.png" alt="CineBook" className="library-logo" />
            </header>

            <div className="library-tabs">
                <button
                    className={`tab-btn ${activeTab === 'watch' ? 'active' : ''}`}
                    onClick={() => setActiveTab('watch')}
                >
                    İzleyeceğim
                </button>
                <button
                    className={`tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
                    onClick={() => setActiveTab('watched')}
                >
                    İzlediklerim
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : currentList.length === 0 ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--divider-color)">
                        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                    </svg>
                    <p>Bu listede henüz film yok</p>
                    <Link to="/" className="btn btn-outline">
                        Film Keşfet
                    </Link>
                </div>
            ) : (
                <div className="library-grid">
                    {currentList.map((movie) => (
                        <LibraryCard
                            key={movie.id}
                            movie={movie}
                            onRemove={() => handleRemove(movie.id, activeTab)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function LibraryCard({ movie, onRemove }) {
    const posterUrl = movie.poster?.startsWith('http')
        ? movie.poster
        : tmdb.getImageUrl(movie.poster, 'w342');

    return (
        <div className="library-card">
            <Link to={`/movie/${movie.id}`} className="card-link">
                <div className="card-poster">
                    {movie.poster ? (
                        <img src={posterUrl} alt={movie.title} />
                    ) : (
                        <div className="no-poster">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-grey)">
                                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
                            </svg>
                        </div>
                    )}
                </div>
                <span className="card-title">{movie.title}</span>
            </Link>
            <button className="remove-btn" onClick={onRemove} aria-label="Listeden çıkar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </button>
        </div>
    );
}
