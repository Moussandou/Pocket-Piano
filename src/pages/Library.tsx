import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Library.css';
import { db } from '../infra/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { audioEngine } from '../engine/audio';

import type { Recording, RecordedNote } from '../domain/models';

type ViewMode = 'grid' | 'list';
type FilterMode = 'all' | 'favorites';

export const Library: React.FC = () => {
    const { t } = useTranslation();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [filterMode, setFilterMode] = useState<FilterMode>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const playbackTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setRecordings(prev => prev.length > 0 ? [] : prev);
            setLoading(prev => prev ? false : prev);
            return;
        }

        const q = query(
            collection(db, 'recordings'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Recording[];
            setRecordings(docs);
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
    }, [user]);

    const removeRecording = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('library.confirmDelete'))) {
            await deleteDoc(doc(db, 'recordings', id));
        }
    };

    const toggleFavorite = async (id: string, currentVal: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        await updateDoc(doc(db, 'recordings', id), { favorite: !currentVal });
    };

    const stopPlayback = useCallback(() => {
        playbackTimeouts.current.forEach(clearTimeout);
        playbackTimeouts.current = [];
        setPlayingId(null);
    }, []);

    const playRecording = useCallback(async (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();

        if (playingId === recording.id) {
            stopPlayback();
            return;
        }

        stopPlayback();

        if (!audioEngine.getReadyStatus()) {
            await audioEngine.init();
        }

        setPlayingId(recording.id || null);

        recording.notes.forEach((note: RecordedNote) => {
            const t1 = setTimeout(() => {
                audioEngine.playNote(note.note, note.velocity);
            }, note.time);
            playbackTimeouts.current.push(t1);

            const releaseDuration = note.duration || 200;
            const t2 = setTimeout(() => {
                audioEngine.releaseNote(note.note);
            }, note.time + releaseDuration);
            playbackTimeouts.current.push(t2);
        });

        const totalDuration = recording.duration || (
            recording.notes.length > 0
                ? recording.notes[recording.notes.length - 1].time + (recording.notes[recording.notes.length - 1].duration || 200)
                : 0
        );

        const tEnd = setTimeout(() => setPlayingId(null), totalDuration + 100);
        playbackTimeouts.current.push(tEnd);
    }, [playingId, stopPlayback]);

    const downloadNotes = (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        const data = {
            name: recording.name,
            duration: recording.duration,
            notes: recording.notes,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(recording.name || 'recording').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatDuration = (ms: number) => {
        if (!ms) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const filteredRecordings = recordings.filter(rec => {
        if (filterMode === 'favorites' && !rec.favorite) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (rec.name || '').toLowerCase().includes(q);
        }
        return true;
    });

    const renderCard = (rec: Recording) => {
        const isPlaying = playingId === rec.id;

        return (
            <article key={rec.id} className={`sheet-card hover-effect ${isPlaying ? 'active-card' : ''}`}>
                <div className="sheet-preview">
                    {/* Note sequence mini-visualizer */}
                    <div className="note-mini-vis">
                        {rec.notes.slice(0, 40).map((n, i) => (
                            <div
                                key={i}
                                className={`note-bar ${isPlaying ? 'playing' : ''}`}
                                style={{
                                    height: `${Math.max(15, n.velocity * 100)}%`,
                                    animationDelay: isPlaying ? `${i * 0.05}s` : '0s'
                                }}
                            ></div>
                        ))}
                        {rec.notes.length === 0 && (
                            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af' }}>music_note</span>
                        )}
                    </div>
                    <div className="preview-overlay">
                        <button className="play-btn" onClick={(e) => playRecording(rec, e)}>
                            <span className="material-symbols-outlined text-black">
                                {isPlaying ? 'stop' : 'play_arrow'}
                            </span>
                        </button>
                    </div>
                </div>
                <div className="sheet-info">
                    <div className="sheet-titles" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 className="sheet-title">{rec.name || t('library.untitled')}</h3>
                            <p className="sheet-composer">
                                {rec.timestamp ? (
                                    rec.timestamp instanceof Timestamp
                                        ? rec.timestamp.toDate().toLocaleDateString()
                                        : new Date(rec.timestamp).toLocaleDateString()
                                ) : t('library.dateUnknown')}
                            </p>
                        </div>
                        <div className="card-actions">
                            <button
                                className={`btn-card-action ${rec.favorite ? 'active' : ''}`}
                                onClick={(e) => rec.id && toggleFavorite(rec.id, !!rec.favorite, e)}
                                title="Favorite"
                            >
                                <span className="material-symbols-outlined">
                                    {rec.favorite ? 'favorite' : 'favorite_border'}
                                </span>
                            </button>
                            <button
                                className="btn-card-action"
                                onClick={(e) => downloadNotes(rec, e)}
                                title="Download"
                            >
                                <span className="material-symbols-outlined">download</span>
                            </button>
                            <button
                                className="btn-card-action danger"
                                onClick={(e) => rec.id && removeRecording(rec.id, e)}
                                title={t('library.deleteTitle')}
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    </div>
                    <div className="sheet-meta">
                        <div className="meta-col">
                            <span className="meta-label">{t('library.notes')}</span>
                            <span className="meta-val">{rec.notes?.length || 0}</span>
                        </div>
                        <div className="meta-col border-left">
                            <span className="meta-label">{t('library.duration')}</span>
                            <span className="meta-val">{formatDuration(rec.duration || 0)}</span>
                        </div>
                    </div>
                </div>
            </article>
        );
    };

    const renderListItem = (rec: Recording) => {
        const isPlaying = playingId === rec.id;

        return (
            <div key={rec.id} className={`list-item ${isPlaying ? 'active-card' : ''}`}>
                <button className="list-play-btn" onClick={(e) => playRecording(rec, e)}>
                    <span className="material-symbols-outlined">
                        {isPlaying ? 'stop' : 'play_arrow'}
                    </span>
                </button>
                <div className="list-info">
                    <span className="list-title">{rec.name || t('library.untitled')}</span>
                    <span className="list-date">
                        {rec.timestamp ? (
                            rec.timestamp instanceof Timestamp
                                ? rec.timestamp.toDate().toLocaleDateString()
                                : new Date(rec.timestamp).toLocaleDateString()
                        ) : ''}
                    </span>
                </div>
                <span className="list-meta">{rec.notes?.length || 0} notes</span>
                <span className="list-meta">{formatDuration(rec.duration || 0)}</span>
                <div className="list-actions">
                    <button
                        className={`btn-card-action ${rec.favorite ? 'active' : ''}`}
                        onClick={(e) => rec.id && toggleFavorite(rec.id, !!rec.favorite, e)}
                    >
                        <span className="material-symbols-outlined">
                            {rec.favorite ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                    <button className="btn-card-action" onClick={(e) => downloadNotes(rec, e)}>
                        <span className="material-symbols-outlined">download</span>
                    </button>
                    <button
                        className="btn-card-action danger"
                        onClick={(e) => rec.id && removeRecording(rec.id, e)}
                    >
                        <span className="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="library-container">
            {/* Sidebar Navigation */}
            <aside className="library-sidebar">
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">{t('library.allRecordings')}</h3>
                    <ul className="sidebar-nav">
                        <li>
                            <button
                                className={`nav-link ${filterMode === 'all' ? 'active' : ''}`}
                                onClick={() => setFilterMode('all')}
                            >
                                <span className="material-symbols-outlined">library_music</span>
                                <span>{t('library.allRecordings')}</span>
                            </button>
                        </li>
                        <li>
                            <button
                                className={`nav-link ${filterMode === 'favorites' ? 'active' : ''}`}
                                onClick={() => setFilterMode('favorites')}
                            >
                                <span className="material-symbols-outlined">favorite</span>
                                <span>{t('library.favorites')}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className="library-main">
                <div className="library-header">
                    <div className="header-text">
                        <h1 className="page-title">{t('library.title')}</h1>
                        <p className="page-subtitle">{t('library.subtitle')}</p>
                    </div>
                    <div className="filters-group">
                        {/* Search */}
                        <div className="search-box">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t('library.searchPlaceholder') || 'Search...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* View toggle */}
                        <button
                            className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                        <button
                            className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <span className="material-symbols-outlined">list</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'grid' ? (
                    <div className="sheets-grid">
                        <button className="sheet-card new-sheet" onClick={() => navigate('/app')}>
                            <div className="add-icon-wrapper">
                                <span className="material-symbols-outlined text-4xl">add</span>
                            </div>
                            <span className="new-sheet-text">{t('library.newRecording')}</span>
                        </button>

                        {loading ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>{t('library.loading')}</div>
                        ) : filteredRecordings.length === 0 ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>
                                {!user
                                    ? t('library.signToSee')
                                    : filterMode === 'favorites'
                                        ? t('library.noFavorites') || 'No favorites yet'
                                        : searchQuery
                                            ? t('library.noResults') || 'No results found'
                                            : t('library.noRecordings')}
                            </div>
                        ) : (
                            filteredRecordings.map(renderCard)
                        )}
                    </div>
                ) : (
                    <div className="sheets-list">
                        {loading ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>{t('library.loading')}</div>
                        ) : filteredRecordings.length === 0 ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>
                                {!user
                                    ? t('library.signToSee')
                                    : filterMode === 'favorites'
                                        ? t('library.noFavorites') || 'No favorites yet'
                                        : searchQuery
                                            ? t('library.noResults') || 'No results found'
                                            : t('library.noRecordings')}
                            </div>
                        ) : (
                            filteredRecordings.map(renderListItem)
                        )}
                    </div>
                )}

                {/* Count */}
                {!loading && filteredRecordings.length > 0 && (
                    <div className="library-pagination">
                        <span className="pagination-info">{t('library.showingCount', { count: filteredRecordings.length })}</span>
                    </div>
                )}
            </main>
        </div>
    );
};
