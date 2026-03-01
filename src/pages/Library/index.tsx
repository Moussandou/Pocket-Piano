import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { audioEngine } from '../../engine/audio';
import { recordingRepository } from '../../infra/repositories/recordingRepository';
import { formatDuration } from '../../utils/formatters';
import { RecordingCard } from './RecordingCard';
import { RecordingListItem } from './RecordingListItem';
import '../Library.css';

import type { Recording, RecordedNote } from '../../domain/models';

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

        return recordingRepository.subscribeByUser(user.uid, (docs) => {
            setRecordings(docs);
            setLoading(false);
        });
    }, [user]);

    const removeRecording = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('library.confirmDelete'))) {
            await recordingRepository.remove(id);
        }
    };

    const toggleFavorite = async (id: string, currentVal: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        await recordingRepository.updateFavorite(id, !currentVal);
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

    const filteredRecordings = recordings.filter(rec => {
        if (filterMode === 'favorites' && !rec.favorite) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (rec.name || '').toLowerCase().includes(q);
        }
        return true;
    });

    const emptyMessage = !user
        ? t('library.signToSee')
        : filterMode === 'favorites'
            ? t('library.noFavorites') || 'No favorites yet'
            : searchQuery
                ? t('library.noResults') || 'No results found'
                : t('library.noRecordings');

    return (
        <div className="library-container">
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

            <main className="library-main">
                <div className="library-header">
                    <div className="header-text">
                        <h1 className="page-title">{t('library.title')}</h1>
                        <p className="page-subtitle">{t('library.subtitle')}</p>
                    </div>
                    <div className="filters-group">
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
                        <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                        <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                            <span className="material-symbols-outlined">list</span>
                        </button>
                    </div>
                </div>

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
                            <div style={{ padding: '2rem', color: '#6b7280' }}>{emptyMessage}</div>
                        ) : (
                            filteredRecordings.map(rec => (
                                <RecordingCard
                                    key={rec.id}
                                    recording={rec}
                                    isPlaying={playingId === rec.id}
                                    onPlay={playRecording}
                                    onToggleFavorite={toggleFavorite}
                                    onDownload={downloadNotes}
                                    onDelete={removeRecording}
                                    formatDuration={formatDuration}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="sheets-list">
                        {loading ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>{t('library.loading')}</div>
                        ) : filteredRecordings.length === 0 ? (
                            <div style={{ padding: '2rem', color: '#6b7280' }}>{emptyMessage}</div>
                        ) : (
                            filteredRecordings.map(rec => (
                                <RecordingListItem
                                    key={rec.id}
                                    recording={rec}
                                    isPlaying={playingId === rec.id}
                                    onPlay={playRecording}
                                    onToggleFavorite={toggleFavorite}
                                    onDownload={downloadNotes}
                                    onDelete={removeRecording}
                                    formatDuration={formatDuration}
                                />
                            ))
                        )}
                    </div>
                )}

                {!loading && filteredRecordings.length > 0 && (
                    <div className="library-pagination">
                        <span className="pagination-info">{t('library.showingCount', { count: filteredRecordings.length })}</span>
                    </div>
                )}
            </main>
        </div>
    );
};
