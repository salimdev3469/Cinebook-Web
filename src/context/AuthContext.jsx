import { createContext, useContext, useState, useEffect } from 'react';
import {
    auth,
    signIn as firebaseSignIn,
    signUp as firebaseSignUp,
    signOut as firebaseSignOut,
    subscribeToAuth
} from '../api/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuth((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const user = await firebaseSignIn(email, password);
            return { success: true, user };
        } catch (error) {
            let message = 'Giriş başarısız.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                message = 'Kullanıcı bulunamadı veya şifre yanlış.';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Şifre hatalı.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Geçersiz e-posta formatı.';
            }
            return { success: false, error: message };
        }
    };

    const register = async (email, password, displayName) => {
        try {
            const user = await firebaseSignUp(email, password, displayName);
            return { success: true, user };
        } catch (error) {
            let message = 'Kayıt başarısız.';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Bu e-posta adresi zaten kullanımda.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Şifre en az 6 karakter olmalı.';
            }
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Çıkış yapılamadı.' };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
