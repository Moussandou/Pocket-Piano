import React from 'react';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthManager: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const login = () => {
        // Pass the current location so we can redirect back after login
        navigate('/auth', { state: { from: location } });
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
