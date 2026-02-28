import React, { useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthManager } from '../infra/AuthManager';

export const Layout: React.FC = () => {
    const { user } = useAuth();
    const menuRef = useRef<HTMLElement>(null);
    const location = useLocation();



    // Determine if we should show the full header navigation
    // On the landing page, we might want a simpler header
    const isLandingPage = location.pathname === '/';
    const isStudioPage = location.pathname === '/app';

    return (
        <div className={`app-container ${isStudioPage ? 'layout-viewport-locked' : ''}`}>
            <header className="app-header" ref={menuRef}>
                <div className="header-brand">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                        <span className="material-symbols-outlined text-2xl">piano</span>
                        <h1>Pocket Piano</h1>
                    </Link>
                    <span className="version-badge">v2.0.4</span>
                </div>

                <nav className="header-nav">
                    <div className="header-links">


                        {/* Navigation links - conditional on auth */}
                        {user ? (
                            <>
                                <Link to="/library" className={location.pathname === '/library' ? 'active' : ''}>Library</Link>
                                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link>
                            </>
                        ) : !isLandingPage && (
                            <Link to="/">Landing</Link>
                        )}

                        {isLandingPage && <Link to="/app">Studio</Link>}
                    </div>

                    <div className="nav-divider"></div>

                    <div className="header-actions">
                        {!isStudioPage && (
                            <Link to="/app" className="btn-midi" style={{ textDecoration: 'none' }}>
                                <span className="material-symbols-outlined text-sm">play_arrow</span>
                                <span className="text">Play Now</span>
                            </Link>
                        )}
                        <AuthManager />
                    </div>
                </nav>
            </header>

            {/* Renders the specific page */}
            <Outlet />
        </div>
    );
};
