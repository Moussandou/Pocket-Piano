
import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';

export const AuthManager: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = () => signOut(auth);

    if (loading) return <div className="auth-loading">...</div>;

    return (
        <div className="auth-controls">
            {user ? (
                <div className="user-profile">
                    <img src={user.photoURL || ''} alt={user.displayName || ''} className="user-avatar" />
                    <button onClick={logout} className="auth-btn logout" title="Se déconnecter">
                        <LogOut size={16} />
                    </button>
                </div>
            ) : (
                <button onClick={login} className="auth-btn login">
                    <LogIn size={16} /> Connexion
                </button>
            )}
        </div>
    );
};
