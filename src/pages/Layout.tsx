import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { Volume2, Waves, Palette } from 'lucide-react';
import { AuthManager } from '../infra/AuthManager';

export const Layout: React.FC = () => {
    const { settings, updateSetting } = useSettings();
    const [activeMenu, setActiveMenu] = useState<'sound' | 'styles' | null>(null);
    const menuRef = useRef<HTMLElement>(null);
    const location = useLocation();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Determine if we should show the full header navigation
    // On the landing page, we might want a simpler header
    const isLandingPage = location.pathname === '/';

    return (
        <div className="app-container">
            <header className="app-header" ref={menuRef}>
                <div className="header-brand">
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                        <span className="material-symbols-outlined text-2xl">piano</span>
                        <h1>Pocket Piano</h1>
                    </Link>
                    <span className="version-badge">v2.0.4</span>
                </div>

                {!isLandingPage && (
                    <nav className="header-nav">
                        <div className="header-links">
                            {/* Context menus */}
                            <div className="menu-item" onClick={() => setActiveMenu(activeMenu === 'sound' ? null : 'sound')}>
                                <a href="#">Sound</a>
                                {activeMenu === 'sound' && (
                                    <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                                        <div className="setting-group">
                                            <div className="setting-label"><Volume2 size={16} /> Volume</div>
                                            <input type="range" min="-60" max="0" value={settings.volume} onChange={(e) => updateSetting('volume', parseInt(e.target.value))} />
                                            <span className="value-display">{settings.volume} dB</span>
                                        </div>
                                        <div className="setting-group">
                                            <div className="setting-label"><Waves size={16} /> Sustain</div>
                                            <input type="range" min="0.1" max="10" step="0.1" value={settings.sustain} onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))} />
                                            <span className="value-display">x{settings.sustain}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="menu-item" onClick={() => setActiveMenu(activeMenu === 'styles' ? null : 'styles')}>
                                <a href="#">Styles</a>
                                {activeMenu === 'styles' && (
                                    <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                                        <div className="setting-group">
                                            <div className="setting-label"><Palette size={16} /> Accent Color</div>
                                            <div className="color-presets">
                                                {['#0d59f2', '#ff4a4a', '#4aff4a', '#ff8c00', '#ff4aff'].map(color => (
                                                    <div key={color} className={`color-swatch ${settings.pianoColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateSetting('pianoColor', color)} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link to="/library">Library</Link>
                            <Link to="/profile">Profile</Link>
                        </div>

                        <div className="nav-divider"></div>

                        <div className="header-actions">
                            <Link to="/app" className="btn-midi" style={{ textDecoration: 'none' }}>
                                <span className="material-symbols-outlined text-sm">play_arrow</span>
                                <span className="text">Play Now</span>
                            </Link>
                            <AuthManager />
                        </div>
                    </nav>
                )}

                {isLandingPage && (
                    <nav className="header-nav">
                        <div className="header-links">
                            <Link to="/app">Studio</Link>
                        </div>
                        <div className="nav-divider"></div>
                        <div className="header-actions">
                            <AuthManager />
                        </div>
                    </nav>
                )}
            </header>

            {/* Renders the specific page */}
            <Outlet />
        </div>
    );
};
