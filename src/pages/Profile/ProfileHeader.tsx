import React, { useState } from 'react';
import { auth, googleProvider, discordProvider } from '../../infra/firebase';
import { signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import type { AuthProvider, User } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
    user: User | null;
    onConfigClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onConfigClick }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || '');

    const handleLogin = async (provider: AuthProvider = googleProvider) => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleSaveName = async () => {
        if (!user) return;
        try {
            await updateProfile(user, { displayName: newName });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    return (
        <section className="profile-header">
            <div className="profile-info-group">
                <div className="profile-avatar-wrapper">
                    <img
                        alt={t('profile.avatarAlt', { name: user?.displayName || 'User' })}
                        className="profile-avatar-img"
                        src={user?.photoURL || "https://api.dicebear.com/7.x/shapes/svg?seed=" + (user?.uid || 'guest')}
                    />
                    <div className="avatar-edit-icon">
                        <span className="material-symbols-outlined text-white text-sm">edit</span>
                    </div>
                </div>
                <div className="profile-details">
                    <div>
                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    className="profile-name-input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                                <button onClick={handleSaveName} className="btn-save-name">
                                    <span className="material-symbols-outlined">check</span>
                                </button>
                                <button onClick={() => { setIsEditing(false); setNewName(user?.displayName || ''); }} className="btn-cancel-name">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : (
                            <h2 className="profile-username" onClick={() => user && setIsEditing(true)}>
                                {user?.displayName || t('profile.guestProfile')}
                                {user && <span className="material-symbols-outlined text-sm ml-2 cursor-pointer opacity-50 hover:opacity-100">edit_note</span>}
                            </h2>
                        )}
                        <div className="status-indicator">
                            <span className="status-dot"></span>
                            <span className="status-text">{user ? t('profile.statusOnline') : t('profile.statusOffline')}</span>
                        </div>
                    </div>
                    <div className="profile-meta">
                        <p>{t('profile.emailLabel')} <span className="highlight-text">{user?.email || t('profile.notSignedIn')}</span></p>
                        <p>{t('profile.planLabel')} <span className="highlight-primary">COMMUNITY TIER</span></p>
                    </div>
                </div>
            </div>
            <div className="profile-actions">
                <button className="btn-config" onClick={onConfigClick}>
                    <span className="material-symbols-outlined text-lg">settings</span>
                    {t('profile.config')}
                </button>
                {user ? (
                    <button className="btn-export" onClick={handleLogout}>
                        <span className="material-symbols-outlined text-lg">logout</span>
                        {t('profile.signOut')}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="btn-config" onClick={() => handleLogin(googleProvider)}>
                            <span className="material-symbols-outlined text-lg">login</span>
                            Google
                        </button>
                        <button className="btn-config btn-discord" onClick={() => handleLogin(discordProvider)}>
                            <span className="material-symbols-outlined text-lg">login</span>
                            Discord
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};
