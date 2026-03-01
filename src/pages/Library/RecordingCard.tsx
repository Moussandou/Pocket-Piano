import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import type { Recording } from '../../domain/models';

interface RecordingCardProps {
    recording: Recording;
    isPlaying: boolean;
    onPlay: (recording: Recording, e: React.MouseEvent) => void;
    onToggleFavorite: (id: string, currentVal: boolean, e: React.MouseEvent) => void;
    onDownload: (recording: Recording, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    formatDuration: (ms: number) => string;
}

export const RecordingCard: React.FC<RecordingCardProps> = ({
    recording: rec,
    isPlaying,
    onPlay,
    onToggleFavorite,
    onDownload,
    onDelete,
    formatDuration,
}) => {
    const { t } = useTranslation();

    return (
        <article className={`sheet-card hover-effect ${isPlaying ? 'active-card' : ''}`}>
            <div className="sheet-preview">
                <div className="note-mini-vis">
                    {rec.notes.slice(0, 40).map((n, i) => (
                        <div
                            key={i}
                            className={`note-bar ${isPlaying ? 'playing' : ''}`}
                            style={{
                                height: `${Math.max(15, n.velocity * 100)}%`,
                                animationDelay: isPlaying ? `${i * 0.05}s` : '0s'
                            }}
                        />
                    ))}
                    {rec.notes.length === 0 && (
                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af' }}>music_note</span>
                    )}
                </div>
                <div className="preview-overlay">
                    <button className="play-btn" onClick={(e) => onPlay(rec, e)}>
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
                            onClick={(e) => rec.id && onToggleFavorite(rec.id, !!rec.favorite, e)}
                            title="Favorite"
                        >
                            <span className="material-symbols-outlined">
                                {rec.favorite ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                        <button className="btn-card-action" onClick={(e) => onDownload(rec, e)} title="Download">
                            <span className="material-symbols-outlined">download</span>
                        </button>
                        <button
                            className="btn-card-action danger"
                            onClick={(e) => rec.id && onDelete(rec.id, e)}
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
