import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../infra/firebase';
import { signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { collection, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import type { Recording } from '../domain/models';
import './Profile.css';

export const Profile: React.FC = () => {
    const { user } = useAuth();
    const { settings, updateSetting } = useSettings();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [stats, setStats] = useState({
        totalPlaytime: 0,
        totalNotes: 0,
        totalSessions: 0,
        lastSession: null as Recording | null,
        avgVelocity: 0,
        isLoading: true,
        // Combined with global stats
        globalPlaytime: 0,
        globalNotes: 0,
        globalAvgVelocity: 0,
        globalSessions: 0
    });

    useEffect(() => {
        if (user) {
            setNewName(user.displayName || '');

            const recordingsQuery = query(collection(db, 'recordings'), where('userId', '==', user.uid));
            const globalRef = doc(db, 'users', user.uid, 'stats', 'global');

            // Snapshot for recordings
            const unsubRecordings = onSnapshot(recordingsQuery, (snapshot) => {
                let playtime = 0;
                let notesCount = 0;
                let lastSession: Recording | null = null;
                let totalVelocity = 0;
                let noteCountForVelocity = 0;

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    playtime += data.duration || 0;
                    notesCount += (data.notes || []).length;

                    const recNotes = data.notes || [];
                    recNotes.forEach((n: { velocity?: number }) => {
                        if (typeof n.velocity === 'number') {
                            totalVelocity += n.velocity;
                            noteCountForVelocity++;
                        }
                    });

                    const ts = data.timestamp;
                    const timestamp = (ts && ts instanceof Timestamp) ? ts.toMillis() : (typeof ts === 'number' ? ts : 0);

                    if (!lastSession || timestamp > (lastSession.timestamp instanceof Timestamp ? lastSession.timestamp.toMillis() : 0)) {
                        lastSession = { ...data, id: doc.id } as Recording;
                    }
                });

                setStats(prev => ({
                    ...prev,
                    totalPlaytime: playtime,
                    totalNotes: notesCount,
                    totalSessions: snapshot.size,
                    lastSession,
                    avgVelocity: noteCountForVelocity > 0 ? (totalVelocity / noteCountForVelocity) : 0,
                    isLoading: false
                }));
            });

            // Snapshot for global stats
            const unsubGlobal = onSnapshot(globalRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    setStats(prev => ({
                        ...prev,
                        globalNotes: data.totalNotes || 0,
                        globalPlaytime: data.totalPlaytime || 0,
                        globalAvgVelocity: (data.noteCountForVelocity > 0)
                            ? (data.totalVelocity / data.noteCountForVelocity)
                            : 0,
                        globalSessions: data.totalSessions || 0
                    }));
                }
            });

            return () => {
                unsubRecordings();
                unsubGlobal();
            };
        }
    }, [user]);

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

    const handleSaveName = async () => {
        if (!user) return;
        try {
            await updateProfile(user, { displayName: newName });
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const formatPlaytime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    };

    const formatNotes = (n: number) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toString();
    };

    const totalDisplayPlaytime = stats.globalPlaytime || stats.totalPlaytime;
    const totalDisplayNotes = stats.globalNotes || stats.totalNotes;
    const totalDisplayAvgVelocity = stats.globalAvgVelocity || stats.avgVelocity;
    const totalDisplaySessions = stats.globalSessions || stats.totalSessions;

    const { hours, minutes } = formatPlaytime(totalDisplayPlaytime);
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
                                        {user?.displayName || "Guest Profile"}
                                        {user && <span className="material-symbols-outlined text-sm ml-2 cursor-pointer opacity-50 hover:opacity-100">edit_note</span>}
                                    </h2>
                                )}
                                <div className="status-indicator">
                                    <span className="status-dot"></span>
                                    <span className="status-text">{user ? 'Online Now' : 'Offline'}</span>
                                </div>
                            </div>
                            <div className="profile-meta">
                                <p>Email: <span className="highlight-text">{user?.email || "Not signed in"}</span></p>
                                <p>Plan: <span className="highlight-primary">Pro Tier</span></p>
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
                                        <label>Master Volume</label>
                                        <span>{settings.volume} dB</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="-60"
                                        max="0"
                                        value={settings.volume}
                                        onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                                        className="profile-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>Silence</span>
                                        <span>Peak</span>
                                    </div>
                                </div>
                                <div className="setting-group">
                                    <div className="setting-label-row">
                                        <label>Global Transpose</label>
                                        <span>{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} Semitones</span>
                                    </div>
                                    <div className="toggle-group-3">
                                        <button
                                            className={`btn-toggle ${settings.transpose === -12 ? 'active' : ''}`}
                                            onClick={() => updateSetting('transpose', -12)}
                                        >Oct -</button>
                                        <button
                                            className={`btn-toggle ${settings.transpose === 0 ? 'active' : ''}`}
                                            onClick={() => updateSetting('transpose', 0)}
                                        >Reset</button>
                                        <button
                                            className={`btn-toggle ${settings.transpose === 12 ? 'active' : ''}`}
                                            onClick={() => updateSetting('transpose', 12)}
                                        >Oct +</button>
                                    </div>
                                </div>
                                <div className="setting-group pt-2">
                                    <div className="switch-row">
                                        <span className="switch-label">Auto-Sustain</span>
                                        <div
                                            className={`switch-track ${settings.sustain > 0 ? 'active' : ''}`}
                                            onClick={() => updateSetting('sustain', settings.sustain > 0 ? 0 : 1)}
                                        >
                                            <div className="switch-thumb"></div>
                                        </div>
                                    </div>
                                    <div className="switch-row">
                                        <span className="switch-label">Performance Mode</span>
                                        <div className="switch-track active">
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
                                    <span className="stat-val">{hours}<span className="stat-unit">h</span></span>
                                    <span className="stat-val">{minutes}<span className="stat-unit">m</span></span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Lifetime Notes</span>
                                <span className="stat-val">{formatNotes(totalDisplayNotes)}</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Skill Level</span>
                                <div className="stat-val-group">
                                    <span className="stat-val primary-color">
                                        {totalDisplaySessions > 50 ? 'PRO' : totalDisplaySessions > 10 ? 'MID' : 'NEW'}
                                    </span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Sessions</span>
                                <span className="stat-val">{totalDisplaySessions}</span>
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
                                        <span className="score-val">{(totalDisplayAvgVelocity * 100).toFixed(0)}</span>
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
                                    {stats.lastSession ? (
                                        <>
                                            <div className="session-item">
                                                <span className="material-symbols-outlined text-primary">schedule</span>
                                                <div>
                                                    <p className="session-name">
                                                        {stats.lastSession.timestamp ? (
                                                            stats.lastSession.timestamp instanceof Timestamp
                                                                ? stats.lastSession.timestamp.toDate().toLocaleDateString()
                                                                : new Date(stats.lastSession.timestamp).toLocaleDateString()
                                                        ) : 'Date Unknown'}
                                                    </p>
                                                    <p className="session-detail">
                                                        {((stats.lastSession.duration || 0) / 1000 / 60).toFixed(1)} minutes duration
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="session-item">
                                                <span className="material-symbols-outlined text-primary">music_note</span>
                                                <div>
                                                    <p className="session-name">{stats.lastSession.name}</p>
                                                    <p className="session-detail">{(stats.lastSession.notes || []).length} notes captured</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray italic">No sessions recorded yet.</p>
                                    )}
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
