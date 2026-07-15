import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import { Play, Square, Heart, Download, Trash2, Music } from 'lucide-react';
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

    const dateLabel = rec.timestamp
        ? (rec.timestamp instanceof Timestamp
            ? rec.timestamp.toDate().toLocaleDateString()
            : new Date(rec.timestamp).toLocaleDateString())
        : t('library.dateUnknown');

    return (
        <article className={`recording-tile ${isPlaying ? 'playing' : ''}`}>
            <div className="tile-preview" onClick={(e) => onPlay(rec, e)}>
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
                    {rec.notes.length === 0 && <Music size={36} className="tile-empty-icon" />}
                </div>
                <div className="tile-play">
                    {isPlaying ? <Square size={18} fill="currentColor" /> : <Play size={18} />}
                </div>
            </div>
            <div className="tile-body">
                <div className="tile-titles">
                    <h3>{rec.name || t('library.untitled')}</h3>
                    <p>{dateLabel} · {rec.notes?.length || 0} {t('library.notes').toLowerCase()} · {formatDuration(rec.duration || 0)}</p>
                </div>
                <div className="tile-actions">
                    <button
                        className={`btn-card-action ${rec.favorite ? 'active' : ''}`}
                        onClick={(e) => rec.id && onToggleFavorite(rec.id, !!rec.favorite, e)}
                        title={t('library.favorites')}
                    >
                        <Heart size={14} fill={rec.favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button className="btn-card-action" onClick={(e) => onDownload(rec, e)} title={t('library.download')}>
                        <Download size={14} />
                    </button>
                    <button
                        className="btn-card-action danger"
                        onClick={(e) => rec.id && onDelete(rec.id, e)}
                        title={t('library.deleteTitle')}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </article>
    );
};
