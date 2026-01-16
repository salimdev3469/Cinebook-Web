import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const navItems = [
    {
        path: '/',
        label: 'Ana Sayfa',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
        ),
    },
    {
        path: '/categories',
        label: 'Kategoriler',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
            </svg>
        ),
    },
    {
        path: '/library',
        label: 'Kütüphane',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
