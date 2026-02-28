import React from 'react';
import { auth, googleProvider } from '../infra/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user } = useAuth();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
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
    return (
        <div className="profile-container">
            <main className="profile-main">
                {/* Profile Header */}
                <section className="profile-header">
                    <div className="profile-info-group">
                        <div className="profile-avatar-wrapper">
                            <img
                                alt={user?.displayName || "Profile avatar"}
                                className="profile-avatar-img"
                                src={user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuCBiF0_QcQXA0GYX1l-TNPu0JAk1sRMWlQgqQPzrSEFRyTQcWMyY0E77wrSb1rybE2BtKHwJJZIqw0ALG7Kmgi4hKl5mseIE-wHsA72bzwMuSp6o9eZAZtvzWecww__e0prkFSA7e9aatFhLNfqLGkqGQvngUc-lVYFN23H1hlhgl4ok4cF7iFVv7Id6Ri5y_Ai1QReKDLrST_XNu58PNESZp0W6D_jugsKcFcw4nE_yOSJ6TRVsZzuW4p2GJZuZxXe9DXWmOPYa9I"}
                            />
                            <div className="avatar-edit-icon">
                                <span className="material-symbols-outlined text-white text-sm">edit</span>
                            </div>
                        </div>
                        <div className="profile-details">
                            <div>
                                <h2 className="profile-username">{user?.displayName || "Guest Profile"}</h2>
                                <div className="status-indicator">
                                    <span className="status-dot"></span>
                                    <span className="status-text">{user ? 'Online Now' : 'Offline'}</span>
                                </div>
                            </div>
                            <div className="profile-meta">
                                <p>Email: <span className="highlight-text">{user?.email || "Not signed in"}</span></p>
                                <p>Plan: <span className="highlight-primary">Basic Tier</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <button className="btn-config">
                            <span className="material-symbols-outlined text-lg">settings</span>
                            Config
                        </button>
                        {user ? (
                            <button className="btn-export" onClick={handleLogout}>
                                <span className="material-symbols-outlined text-lg">logout</span>
                                Sign Out
                            </button>
                        ) : (
                            <button className="btn-export" onClick={handleLogin}>
                                <span className="material-symbols-outlined text-lg">login</span>
                                Sign In
                            </button>
                        )}
                    </div>
                </section>

                {/* Asymmetric Layout Grid */}
                <div className="profile-dashboard-grid">
                    {/* Left Panel: Settings & Tech Preferences */}
                    <div className="panel-left">
                        {/* Technical Preferences */}
                        <div className="tech-preferences-box">
                            <div className="box-header">
                                <h3 className="box-title">Audio Engine</h3>
                                <span className="material-symbols-outlined">tune</span>
                            </div>
                            <div className="box-content space-y-wide">
                                <div className="setting-group">
                                    <div className="setting-label-row">
                                        <label>Buffer Size</label>
                                        <span>128 Samples</span>
                                    </div>
                                    <div className="slider-track-bg">
                                        <div className="slider-track-fill"></div>
                                    </div>
                                    <div className="slider-labels">
                                        <span>64</span>
                                        <span>2048</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-label-row">
                                        <label>Sample Rate</label>
                                        <span>48 kHz</span>
                                    </div>
                                    <div className="toggle-group-3">
                                        <button className="btn-toggle">44.1</button>
                                        <button className="btn-toggle active">48</button>
                                        <button className="btn-toggle">96</button>
                                    </div>
                                </div>
                                <div className="setting-group pt-2">
                                    <div className="switch-row">
                                        <span className="switch-label">Exclusive Mode</span>
                                        <div className="switch-track active">
                                            <div className="switch-thumb"></div>
                                        </div>
                                    </div>
                                    <div className="switch-row">
                                        <span className="switch-label">Low Latency</span>
                                        <div className="switch-track">
                                            <div className="switch-thumb"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Settings / MIDI Mapping */}
                        <div className="tech-preferences-box">
                            <div className="box-header">
                                <h3 className="box-title">MIDI Mapping</h3>
                                <span className="material-symbols-outlined">cable</span>
                            </div>
                            <div className="box-content space-y-loose">
                                <div className="dropdown-row">
                                    <div className="dropdown-info">
                                        <span className="dropdown-label">Input Channel</span>
                                        <span className="dropdown-val">Omni</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray">arrow_drop_down</span>
                                </div>
                                <div className="dropdown-row">
                                    <div className="dropdown-info">
                                        <span className="dropdown-label">Velocity Curve</span>
                                        <span className="dropdown-val">Linear (Hard)</span>
                                    </div>
                                    <span className="material-symbols-outlined text-gray">arrow_drop_down</span>
                                </div>
                                <div className="dropdown-row no-border">
                                    <div className="dropdown-info">
                                        <span className="dropdown-label">Local Control</span>
                                        <span className="dropdown-val">Off</span>
                                    </div>
                                    <div className="checkbox-empty"></div>
                                </div>
                            </div>
                        </div>

                        {/* Hardware List */}
                        <div className="hardware-list-section">
                            <h3 className="hardware-title">Authorized Hardware</h3>
                            <div className="hardware-items">
                                <div className="hardware-item active">
                                    <div className="hard-icon"><span className="material-symbols-outlined">piano</span></div>
                                    <div className="hard-info">
                                        <p className="hard-name">Roland FP-90</p>
                                        <p className="hard-detail">USB-MIDI • CH 1</p>
                                    </div>
                                    <div className="status-dot-green"></div>
                                </div>
                                <div className="hardware-item inactive">
                                    <div className="hard-icon"><span className="material-symbols-outlined">speaker</span></div>
                                    <div className="hard-info">
                                        <p className="hard-name">Focusrite 2i2</p>
                                        <p className="hard-detail">ASIO • 48kHz</p>
                                    </div>
                                    <div className="status-dot-gray"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Analytics */}
                    <div className="panel-right">
                        {/* Main Stats Row */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">Total Playtime</span>
                                <div className="stat-val-group">
                                    <span className="stat-val">142<span className="stat-unit">h</span></span>
                                    <span className="stat-val">30<span className="stat-unit">m</span></span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Keys Pressed</span>
                                <span className="stat-val">2.4M</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Avg. Latency</span>
                                <div className="stat-val-group">
                                    <span className="stat-val primary-color">4</span>
                                    <span className="stat-unit lower">ms</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Sessions</span>
                                <span className="stat-val">88</span>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="chart-box">
                            <div className="chart-header">
                                <h3 className="box-title text-2xl">Performance Analytics</h3>
                                <div className="chart-tabs">
                                    <button className="tab-active">Weekly</button>
                                    <button className="tab-inactive">Monthly</button>
                                    <button className="tab-inactive">Yearly</button>
                                </div>
                            </div>
                            <div className="chart-area">
                                {/* Grid Lines */}
                                <div className="chart-grid-lines">
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                    <div className="grid-line"></div>
                                </div>
                                {/* Data Bars */}
                                <div className="chart-bars">
                                    <div className="bar-wrapper" style={{ height: '30%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">1.2h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '45%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">2.1h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '80%' }}>
                                        <div className="bar primary"></div>
                                        <div className="tooltip visible">4.5h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '25%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">0.8h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '55%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">2.8h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '90%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">5.2h</div>
                                    </div>
                                    <div className="bar-wrapper" style={{ height: '20%' }}>
                                        <div className="bar default"></div>
                                        <div className="tooltip">0.5h</div>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-labels">
                                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                            </div>
                        </div>

                        {/* Velocity Dynamics & Last Session */}
                        <div className="bottom-stats-grid">
                            <div className="velocity-box">
                                <div className="velocity-header">
                                    <h4 className="box-title">Dynamic Range</h4>
                                    <div className="velocity-score">
                                        <span className="score-val">84</span>
                                        <span className="score-unit">avg</span>
                                    </div>
                                </div>
                                <div className="velocity-bars-container">
                                    <div className="vel-bar default h-10" title="pp"></div>
                                    <div className="vel-bar default h-25" title="p"></div>
                                    <div className="vel-bar default h-45" title="mp"></div>
                                    <div className="vel-bar primary h-85" title="mf"></div>
                                    <div className="vel-bar default h-60" title="f"></div>
                                    <div className="vel-bar default h-30" title="ff"></div>
                                </div>
                                <div className="velocity-labels">
                                    <span>pp</span><span>p</span><span>mp</span><span>mf</span><span>f</span><span>ff</span>
                                </div>
                            </div>

                            <div className="session-box">
                                <h4 className="box-title mb-4">Last Session</h4>
                                <div className="session-content">
                                    <div className="session-item">
                                        <span className="material-symbols-outlined text-primary">schedule</span>
                                        <div>
                                            <p className="session-name">Oct 24, 2023</p>
                                            <p className="session-detail">20:45 - 21:30</p>
                                        </div>
                                    </div>
                                    <div className="session-item">
                                        <span className="material-symbols-outlined text-primary">music_note</span>
                                        <div>
                                            <p className="session-name">Nocturne No. 2</p>
                                            <p className="session-detail">Chopin • 92% Accuracy</p>
                                        </div>
                                    </div>
                                    <div className="session-link-wrapper">
                                        <button className="link-view-analysis">
                                            View Analysis
                                            <span className="material-symbols-outlined text-sm icon-arrow">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="profile-footer">
                    <p>© 2023 Pocket Piano Inc. Systems v2.4.1</p>
                    <div className="footer-links">
                        <button>Privacy Protocol</button>
                        <button>Terms of Service</button>
                        <button>System Status: <span className="text-green-600">Stable</span></button>
                    </div>
                </footer>
            </main>
        </div>
    );
};
