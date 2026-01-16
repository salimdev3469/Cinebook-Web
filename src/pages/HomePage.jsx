import { useState, useEffect } from 'react';
import { tmdb } from '../api/api';
import { getLocalMovies } from '../api/firebase';
import HeroSlider from '../components/HeroSlider';
import MovieSlider from '../components/MovieSlider';
import './HomePage.css';

export default function HomePage() {
    const [localMovies, setLocalMovies] = useState([]);
    const [trending, setTrending] = useState([]);
    const [popular, setPopular] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMovies() {
            try {
                const [localData, trendingData, popularData, topRatedData, nowPlayingData, upcomingData] = await Promise.all([
                    getLocalMovies().catch(() => []),
                    tmdb.getTrending(),
                    tmdb.getPopular(),
                    tmdb.getTopRated(),
                    tmdb.getNowPlaying(),
                    tmdb.getUpcoming(),
                ]);

                // Map local movies to match component expectations
                const mappedLocal = localData.map(m => ({
                    ...m,
                    poster_path: m.poster,
                    backdrop_path: m.backdrop,
                    vote_average: m.rating || 0
                }));

                setLocalMovies(mappedLocal);
                setTrending(trendingData.slice(0, 6));
                setPopular(popularData);
                setTopRated(topRatedData);
                setNowPlaying(nowPlayingData);
                setUpcoming(upcomingData);
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMovies();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Slider */}
            <HeroSlider movies={trending} />

            {/* Movie Sections */}
            <div className="movie-sections">
                {localMovies.length > 0 && (
                    <MovieSlider
                        title="CineBook Özel"
                        movies={localMovies}
                        loading={loading}
                    />
                )}

                <MovieSlider
                    title="Şu Anda Gösterimde"
                    movies={nowPlaying}
                    loading={loading}
                />

                <MovieSlider
                    title="Popüler Filmler"
                    movies={popular}
                    loading={loading}
                />

                <MovieSlider
                    title="En Çok Oy Alanlar"
                    movies={topRated}
                    loading={loading}
                />

                <MovieSlider
                    title="Yakında"
                    movies={upcoming}
                    loading={loading}
                />
            </div>
        </div>
    );
}
