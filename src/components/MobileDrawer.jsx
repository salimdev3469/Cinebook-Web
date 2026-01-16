import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileDrawer.css';

export default function MobileDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Close drawer on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Hamburger Button */}
            <button
                className="drawer-toggle"
                onClick={() => setIsOpen(true)}
                aria-label="Menü"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
            </button>

            {/* Overlay */}
            <div
                className={`drawer-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className={`drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <img src="/assets/cinebook.png" alt="CineBook" className="drawer-logo" />
                    <button
                        className="drawer-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Kapat"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                <nav className="drawer-nav">
                    <Link
                        to="/"
                        className={`drawer-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        Ana Sayfa
                    </Link>

                    <Link
                        to="/search"
                        className={`drawer-link ${location.pathname === '/search' ? 'active' : ''}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                        Ara
                    </Link>

                    <Link
                        to="/categories"
                        className={`drawer-link ${location.pathname.startsWith('/categories') || location.pathname.startsWith('/genre') ? 'active' : ''}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                        </svg>
                        Kategoriler
                    </Link>

                    <Link
                        to="/library"
                        className={`drawer-link ${location.pathname === '/library' ? 'active' : ''}`}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
                        </svg>
                        Kütüphanem
                    </Link>
                </nav>
            </div>
        </>
    );
}
