/**
 * Firebase Configuration
 * CineBook Web App
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    collection,
    getDocs
} from 'firebase/firestore';

// Firebase configuration - from Firebase Console (Web App)
const firebaseConfig = {
    apiKey: "AIzaSyC7nqyffCc_TeOkDSKrBSWoUEBD3Pr8ZP8",
    authDomain: "cinebook-e46f4.firebaseapp.com",
    projectId: "cinebook-e46f4",
    storageBucket: "cinebook-e46f4.firebasestorage.app",
    messagingSenderId: "466923942915",
    appId: "1:466923942915:web:797eb62fb6a9ba4ff60a36",
    measurementId: "G-M6341L31QZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Authentication Functions
 */

// Sign in with email and password
export async function signIn(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// Register new user
export async function signUp(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile with display name
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: displayName || '',
        watch_list: [],
        watched_list: [],
        created_at: new Date().toISOString()
    });

    return userCredential.user;
}

// Sign out
export async function signOut() {
    await firebaseSignOut(auth);
}

// Listen to auth state changes
export function subscribeToAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

/**
 * Library Functions (Watch List / Watched List)
 */

// Get user's lists (one-time fetch)
export async function getUserLists(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return { watch_list: [], watched_list: [] };
    }

    const data = docSnap.data();
    return {
        watch_list: data.watch_list || [],
        watched_list: data.watched_list || []
    };
}

// Subscribe to user's lists (real-time)
export function subscribeToUserLists(uid, callback) {
    const docRef = doc(db, 'users', uid);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            callback({
                watch_list: data.watch_list || [],
                watched_list: data.watched_list || []
            });
        } else {
            callback({ watch_list: [], watched_list: [] });
        }
    });
}

// Add movie to watch list
export async function addToWatchList(uid, movie) {
    const movieData = {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path || movie.posterPath || '',
        backdrop: movie.backdrop_path || movie.backdropPath || '',
        rating: movie.vote_average || movie.rating || 0,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        overview: movie.overview || '',
    };

    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
        watch_list: arrayUnion(movieData)
    });
}

// Remove movie from watch list
export async function removeFromWatchList(uid, movieId) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const currentList = docSnap.data().watch_list || [];
        const updatedList = currentList.filter(m => m.id !== movieId);
        await updateDoc(docRef, { watch_list: updatedList });
    }
}

// Add movie to watched list
export async function addToWatchedList(uid, movie) {
    const movieData = {
        id: movie.id,
        title: movie.title,
        poster: movie.poster_path || movie.posterPath || '',
        backdrop: movie.backdrop_path || movie.backdropPath || '',
        rating: movie.vote_average || movie.rating || 0,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        overview: movie.overview || '',
    };

    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
        watched_list: arrayUnion(movieData)
    });
}

// Remove movie from watched list
export async function removeFromWatchedList(uid, movieId) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const currentList = docSnap.data().watched_list || [];
        const updatedList = currentList.filter(m => m.id !== movieId);
        await updateDoc(docRef, { watched_list: updatedList });
    }
}

// Check if movie is in watch list
export async function isInWatchList(uid, movieId) {
    const lists = await getUserLists(uid);
    return lists.watch_list.some(m => m.id === movieId);
}

// Check if movie is in watched list
export async function isInWatchedList(uid, movieId) {
    const lists = await getUserLists(uid);
    return lists.watched_list.some(m => m.id === movieId);
}

/**
 * Local Movies (from Firestore 'movies' collection)
 */

// Get all local movies from Firestore
export async function getLocalMovies() {
    try {
        const moviesRef = collection(db, 'movies');
        const snapshot = await getDocs(moviesRef);
        const movies = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            movies.push({
                id: data.id || doc.id,
                title: data.title || '',
                overview: data.description || data.overview || '',
                poster: data.poster || '',
                backdrop: data.backdropPath || data.backdrop || '',
                rating: data.rating || 0,
                year: data.year || null,
                trailer: data.trailer || null,
                genre_ids: data.genre_ids || [],
                type: 'local'
            });
        });

        return movies;
    } catch (error) {
        console.error('Error fetching local movies:', error);
        return [];
    }
}

// Search local movies
export async function searchLocalMovies(query) {
    const allMovies = await getLocalMovies();
    const queryLower = query.toLowerCase().trim();

    return allMovies.filter(m =>
        m.title.toLowerCase().includes(queryLower) ||
        m.overview.toLowerCase().includes(queryLower)
    );
}

export default app;
