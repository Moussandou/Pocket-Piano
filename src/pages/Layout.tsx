import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Piano as PianoIcon, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { AuthManager } from '../infra/AuthManager';
import { useTranslation } from 'react-i18next';

export const Layout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const { settings, updateSetting } = useSettings();

    const toggleLanguage = () => {
        const nextLang = i18n.language.startsWith('fr') ? 'en' : 'fr';
        i18n.changeLanguage(nextLang);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-brand">
                    <Link to="/" className="brand-link">
                        <PianoIcon size={22} strokeWidth={1.75} />
                        <h1>Pocket Piano</h1>
                    </Link>
                </div>

                <nav className="header-nav">
                    {user && (
                        <div className="header-links">
                            <Link to="/library" className={location.pathname === '/library' ? 'active' : ''}>{t('nav.library')}</Link>
                            <Link to="/account" className={location.pathname === '/account' ? 'active' : ''}>{t('nav.account')}</Link>
                        </div>
                    )}

                    <div className="header-actions">
                        <button
                            onClick={() => updateSetting('darkMode', !settings.darkMode)}
                            className="btn-icon-ghost"
                            title={t('common.toggleTheme')}
                        >
                            {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button onClick={toggleLanguage} className="btn-icon-ghost" title={t('common.toggleLanguage')}>
                            {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
                        </button>
                        <AuthManager />
                    </div>
                </nav>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>
        </div>
    );
};
