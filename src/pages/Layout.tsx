import React, { useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Github, Instagram, Linkedin } from 'lucide-react';
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
            {isStudioPage ? (
                <Outlet />
            ) : (
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Outlet />
                </main>
            )}

            {/* Global Footer - Hidden in Studio */}
            {!isStudioPage && (
                <footer className="app-footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h5>Pocket Piano</h5>
                            <p>
                                © 2024 Audio Industries Ltd.<br />
                                All systems nominal.
                            </p>
                        </div>
                        <div className="footer-links">
                            <Link to="/legal" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined text-sm">gavel</span>
                                Mentions Légales & RGPD
                            </Link>
                            <Link to="/credits" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined text-sm">groups</span>
                                Credits
                            </Link>
                            <a href="https://moussandou.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined text-sm">person</span>
                                Portfolio
                            </a>
                            <a href="https://ko-fi.com/moussandou" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined text-sm">volunteer_activism</span>
                                Ko-fi
                            </a>
                        </div>
                        <div className="footer-social">
                            <a href="https://www.instagram.com/takaxdev/" target="_blank" rel="noopener noreferrer" title="Instagram">
                                <Instagram size={20} strokeWidth={1.5} />
                            </a>
                            <a href="https://www.linkedin.com/in/moussandou/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <Linkedin size={20} strokeWidth={1.5} />
                            </a>
                            <a href="https://github.com/Moussandou" target="_blank" rel="noopener noreferrer" title="GitHub">
                                <Github size={20} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};
