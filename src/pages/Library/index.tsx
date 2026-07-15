import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Heart, LayoutGrid, List, Play, Trash2, Music, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlayback } from '../../hooks/usePlayback';
import { recordingRepository } from '../../infra/repositories/recordingRepository';
import { sheetRepository } from '../../infra/repositories/sheetRepository';
import { formatDuration } from '../../utils/formatters';
import { RecordingCard } from './RecordingCard';
import { RecordingListItem } from './RecordingListItem';
import '../Library.css';

import type { Recording, Sheet } from '../../domain/models';

type ViewMode = 'grid' | 'list';
type LibraryTab = 'recordings' | 'sheets';

export const Library: React.FC = () => {
    const { t } = useTranslation();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [sheets, setSheets] = useState<Sheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [sheetsLoading, setSheetsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<LibraryTab>('recordings');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { playingId, playRecording: startPlayback } = usePlayback();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setRecordings([]);
            setLoading(false);
            return;
        }
        return recordingRepository.subscribeByUser(user.uid, (docs) => {
            setRecordings(docs);
            setLoading(false);
        });
    }, [user]);

    useEffect(() => {
        if (!user) {
            setSheets([]);
            setSheetsLoading(false);
            return;
        }
        return sheetRepository.subscribeByUser(user.uid, (docs) => {
            setSheets(docs);
            setSheetsLoading(false);
        });
    }, [user]);

    const playRecording = (recording: Recording, e: React.MouseEvent) => {
        e.stopPropagation();
        startPlayback(recording);
    };

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

    const removeSheet = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('library.confirmDelete'))) {
            await sheetRepository.remove(id);
        }
    };

    const toggleSheetFavorite = async (id: string, currentVal: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!id) return;
        await sheetRepository.updateFavorite(id, !currentVal);
    };

    const loadSheetInStudio = (sheet: Sheet) => {
        sessionStorage.setItem('pocket-piano-load-sheet', sheet.content);
        navigate('/');
    };

    const filteredRecordings = recordings.filter(rec => {
        if (favoritesOnly && !rec.favorite) return false;
        if (searchQuery) {
            return (rec.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const filteredSheets = sheets.filter(s => {
        if (favoritesOnly && !s.favorite) return false;
        if (searchQuery) {
            return (s.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    const emptyMessage = favoritesOnly
        ? t('library.noFavorites')
        : searchQuery
            ? t('library.noResults')
            : t('library.noRecordings');

    return (
        <div className="library-page">
            <div className="library-header">
                <div>
                    <h1>{t('library.pageTitle')}</h1>
                    <p>{t('library.pageSubtitle')}</p>
                </div>
                <div className="library-controls">
                    <div className="search-box">
                        <Search size={15} />
                        <input
                            type="text"
                            placeholder={t('library.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn-icon-ghost ${favoritesOnly ? 'active' : ''}`}
                        onClick={() => setFavoritesOnly(v => !v)}
                        title={t('library.favorites')}
                    >
                        <Heart size={15} fill={favoritesOnly ? 'currentColor' : 'none'} />
                    </button>
                    {activeTab === 'recordings' && (
                        <>
                            <button
                                className={`btn-icon-ghost ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title={t('library.gridView')}
                            >
                                <LayoutGrid size={15} />
                            </button>
                            <button
                                className={`btn-icon-ghost ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title={t('library.listView')}
                            >
                                <List size={15} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="segmented library-tabs">
                <button
                    className={activeTab === 'recordings' ? 'active' : ''}
                    onClick={() => setActiveTab('recordings')}
                >
                    {t('library.recordings')}
                </button>
                <button
                    className={activeTab === 'sheets' ? 'active' : ''}
                    onClick={() => setActiveTab('sheets')}
                >
                    {t('library.sheets')}
                </button>
            </div>

            {activeTab === 'recordings' && (
                loading ? (
                    <p className="library-empty">{t('library.loading')}</p>
                ) : filteredRecordings.length === 0 ? (
                    <p className="library-empty">{emptyMessage}</p>
                ) : viewMode === 'grid' ? (
                    <div className="library-grid">
                        {filteredRecordings.map(rec => (
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
                        ))}
                    </div>
                ) : (
                    <div className="library-list">
                        {filteredRecordings.map(rec => (
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
                        ))}
                    </div>
                )
            )}

            {activeTab === 'sheets' && (
                sheetsLoading ? (
                    <p className="library-empty">{t('library.loading')}</p>
                ) : (
                    <div className="library-grid">
                        <button className="sheet-card new-sheet" onClick={() => navigate('/')}>
                            <Plus size={22} />
                            <span>{t('library.newSheet')}</span>
                        </button>
                        {filteredSheets.map(sheet => (
                            <div key={sheet.id} className="sheet-card" onClick={() => loadSheetInStudio(sheet)}>
                                <div className="sheet-card-header">
                                    <Music size={17} className="sheet-card-icon" />
                                    <button
                                        className={`btn-card-action ${sheet.favorite ? 'active' : ''}`}
                                        onClick={(e) => toggleSheetFavorite(sheet.id!, sheet.favorite || false, e)}
                                        title={t('library.favorites')}
                                    >
                                        <Heart size={15} fill={sheet.favorite ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                                <h4 className="sheet-card-name">{sheet.name}</h4>
                                <p className="sheet-card-preview">{sheet.content.slice(0, 60)}…</p>
                                <div className="sheet-card-actions">
                                    <button
                                        className="btn-card-action"
                                        onClick={(e) => { e.stopPropagation(); loadSheetInStudio(sheet); }}
                                        title={t('gallery.play')}
                                    >
                                        <Play size={15} />
                                    </button>
                                    <button
                                        className="btn-card-action danger"
                                        onClick={(e) => removeSheet(sheet.id!, e)}
                                        title={t('gallery.delete')}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredSheets.length === 0 && (
                            <p className="library-empty">{t('library.noSheets')}</p>
                        )}
                    </div>
                )
            )}
        </div>
    );
};
