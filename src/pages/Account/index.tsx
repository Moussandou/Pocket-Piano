import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut, updateProfile, deleteUser } from 'firebase/auth';
import { Check, X, Pencil, LogOut } from 'lucide-react';
import { auth } from '../../infra/firebase';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import './Account.css';

export const Account: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { settings, updateSetting, resetSettings } = useSettings();

    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState(user?.displayName || '');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    if (!user) return null;

    const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.uid}`;

    const handleSaveName = async () => {
        try {
            await updateProfile(user, { displayName: newName.trim() });
            setIsEditingName(false);
        } catch (error) {
            console.error('Failed to update profile', error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('account.deleteConfirm'))) return;
        setDeleteError(null);
        try {
            await deleteUser(user);
        } catch (error: unknown) {
            const code = (error as { code?: string }).code;
            setDeleteError(
                code === 'auth/requires-recent-login'
                    ? t('account.deleteRecentLogin')
                    : t('account.deleteError')
            );
        }
    };

    return (
        <div className="account-page">
            <h2>{t('account.title')}</h2>

            {/* Identity */}
            <section className="account-card">
                <h3>{t('account.identity')}</h3>
                <div className="account-identity">
                    <img
                        className="account-avatar"
                        src={avatarUrl}
                        alt={user.displayName || 'avatar'}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                `https://api.dicebear.com/7.x/shapes/svg?seed=${user.uid}`;
                        }}
                    />
                    <div className="account-identity-info">
                        {isEditingName ? (
                            <div className="account-name-edit">
                                <input
                                    type="text"
                                    className="modal-input"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                                    autoFocus
                                />
                                <button className="icon-btn" onClick={handleSaveName} title={t('common.save')}>
                                    <Check size={15} />
                                </button>
                                <button
                                    className="icon-btn"
                                    onClick={() => { setIsEditingName(false); setNewName(user.displayName || ''); }}
                                    title={t('common.cancel')}
                                >
                                    <X size={15} />
                                </button>
                            </div>
                        ) : (
                            <button className="account-name" onClick={() => setIsEditingName(true)}>
                                {user.displayName || t('account.noName')}
                                <Pencil size={13} />
                            </button>
                        )}
                        <span className="account-email">{user.email}</span>
                    </div>
                </div>
            </section>

            {/* Preferences */}
            <section className="account-card">
                <h3>{t('account.preferences')}</h3>

                <div className="account-row">
                    <span>{t('account.theme')}</span>
                    <div className="segmented small">
                        <button
                            className={!settings.darkMode ? 'active' : ''}
                            onClick={() => updateSetting('darkMode', false)}
                        >
                            {t('account.themeLight')}
                        </button>
                        <button
                            className={settings.darkMode ? 'active' : ''}
                            onClick={() => updateSetting('darkMode', true)}
                        >
                            {t('account.themeDark')}
                        </button>
                    </div>
                </div>

                <div className="account-row">
                    <span>{t('account.language')}</span>
                    <div className="segmented small">
                        <button
                            className={!i18n.language.startsWith('fr') ? 'active' : ''}
                            onClick={() => i18n.changeLanguage('en')}
                        >
                            English
                        </button>
                        <button
                            className={i18n.language.startsWith('fr') ? 'active' : ''}
                            onClick={() => i18n.changeLanguage('fr')}
                        >
                            Français
                        </button>
                    </div>
                </div>

                <div className="account-row">
                    <span>{t('account.resetSettings')}</span>
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            if (window.confirm(t('studio.resetConfirm'))) resetSettings();
                        }}
                    >
                        {t('account.reset')}
                    </button>
                </div>
            </section>

            {/* Account management */}
            <section className="account-card">
                <h3>{t('account.management')}</h3>

                <div className="account-row">
                    <span>{t('account.signOut')}</span>
                    <button className="btn btn-secondary" onClick={() => signOut(auth)}>
                        <LogOut size={15} />
                        {t('account.signOut')}
                    </button>
                </div>

                <div className="account-row">
                    <div>
                        <span>{t('account.deleteAccount')}</span>
                        <p className="account-row-hint">{t('account.deleteHint')}</p>
                        {deleteError && <p className="account-error">{deleteError}</p>}
                    </div>
                    <button className="btn btn-danger" onClick={handleDeleteAccount}>
                        {t('account.delete')}
                    </button>
                </div>
            </section>

            <footer className="account-footer">
                <Link to="/legal">{t('footer.legal')}</Link>
                <Link to="/credits">{t('footer.credits')}</Link>
                <a href="https://ko-fi.com/moussandou" target="_blank" rel="noopener noreferrer">Ko-fi</a>
            </footer>
        </div>
    );
};
