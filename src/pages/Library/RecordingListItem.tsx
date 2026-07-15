import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import { Play, Square, Heart, Download, Trash2 } from 'lucide-react';
import type { Recording } from '../../domain/models';

interface RecordingListItemProps {
    recording: Recording;
    isPlaying: boolean;
    onPlay: (recording: Recording, e: React.MouseEvent) => void;
    onToggleFavorite: (id: string, currentVal: boolean, e: React.MouseEvent) => void;
    onDownload: (recording: Recording, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    formatDuration: (ms: number) => string;
}

export const RecordingListItem: React.FC<RecordingListItemProps> = ({
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
        <div className={`list-item ${isPlaying ? 'playing' : ''}`}>
            <button className="btn-card-action" onClick={(e) => onPlay(rec, e)} title={isPlaying ? t('gallery.stop') : t('gallery.play')}>
                {isPlaying ? <Square size={14} fill="currentColor" /> : <Play size={14} />}
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
            <span className="list-meta">{rec.notes?.length || 0} {t('library.notes').toLowerCase()}</span>
            <span className="list-meta">{formatDuration(rec.duration || 0)}</span>
            <div className="list-actions">
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
    );
};
