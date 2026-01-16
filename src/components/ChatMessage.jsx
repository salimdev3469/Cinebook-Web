import { tmdb } from '../api/api';
import './ChatMessage.css';

export default function ChatMessage({ message }) {
    const { isUser, text, movies = [] } = message;

    return (
        <div className={`chat-message ${isUser ? 'user' : 'assistant'}`}>
            {!isUser && (
                <div className="message-avatar">
                    <img src="/assets/chatbot.png" alt="AI" />
                </div>
            )}

            <div className="message-content">
                <div className="message-bubble">
                    <p>{text}</p>
                </div>

                {/* Movie Suggestions */}
                {movies.length > 0 && (
                    <div className="message-movies">
                        {movies.map((movie) => (
                            <MovieSuggestion key={movie.id} movie={movie} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MovieSuggestion({ movie }) {
    const imageUrl = tmdb.getImageUrl(movie.poster || movie.posterPath, 'w200');

    return (
        <div className="movie-suggestion">
            <img
                src={imageUrl}
                alt={movie.title}
                className="suggestion-poster"
            />
            <div className="suggestion-info">
                <h4>{movie.title}</h4>
                <div className="suggestion-actions">
                    <button className="action-btn play" aria-label="Detay">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </button>
                    <button className="action-btn add" aria-label="Listeye ekle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function TypingIndicator() {
    return (
        <div className="chat-message assistant">
            <div className="message-avatar">
                <img src="/assets/chatbot.png" alt="AI" />
            </div>
            <div className="message-content">
                <div className="message-bubble typing">
                    <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
