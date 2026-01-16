import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleSearchClick = () => {
        navigate('/search');
    };



    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/assets/cinebook.png" alt="CineBook" />
                </Link>

                {/* Navigation Links */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Ana Sayfa
                    </Link>
                    <Link
                        to="/categories"
                        className={`nav-link ${location.pathname.startsWith('/categories') || location.pathname.startsWith('/genre') ? 'active' : ''}`}
                    >
                        Kategoriler
                    </Link>
                    <Link
                        to="/library"
                        className={`nav-link ${location.pathname === '/library' ? 'active' : ''}`}
                    >
                        Kütüphanem
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="navbar-actions">
                    {/* Search */}
                    <button
                        className="icon-btn"
                        onClick={handleSearchClick}
                        aria-label="Ara"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>


                </div>
            </div>
        </nav>
    );
}

