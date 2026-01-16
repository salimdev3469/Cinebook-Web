import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import MobileDrawer from './components/MobileDrawer';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import LibraryPage from './pages/LibraryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CategoriesPage from './pages/CategoriesPage';
import GenreMoviesPage from './pages/GenreMoviesPage';
import SearchPage from './pages/SearchPage';
import './index.css';

function Layout({ children }) {
  const location = useLocation();
  const isMovieDetail = location.pathname.startsWith('/movie/');
  const hideNavbar = ['/login', '/register', '/search'].includes(location.pathname) || isMovieDetail;
  const hideBottomNav = ['/login', '/register', '/search'].includes(location.pathname) || isMovieDetail;
  const hideDrawer = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideBottomNav && <BottomNav />}
      {!hideDrawer && <MobileDrawer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/genre/:genreId" element={<GenreMoviesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<LibraryPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}
