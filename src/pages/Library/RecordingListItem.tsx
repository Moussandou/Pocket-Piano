import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
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
        <div className={`list-item ${isPlaying ? 'active-card' : ''}`}>
            <button className="list-play-btn" onClick={(e) => onPlay(rec, e)}>
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
                    onClick={(e) => rec.id && onToggleFavorite(rec.id, !!rec.favorite, e)}
                >
                    <span className="material-symbols-outlined">
                        {rec.favorite ? 'favorite' : 'favorite_border'}
                    </span>
                </button>
                <button className="btn-card-action" onClick={(e) => onDownload(rec, e)}>
                    <span className="material-symbols-outlined">download</span>
                </button>
                <button
                    className="btn-card-action danger"
                    onClick={(e) => rec.id && onDelete(rec.id, e)}
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    );
};
