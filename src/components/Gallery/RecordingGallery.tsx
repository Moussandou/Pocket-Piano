import React, { useState, useEffect } from 'react';
import { Play, Square, Trash2, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { usePlayback } from '../../hooks/usePlayback';
import { recordingRepository } from '../../infra/repositories/recordingRepository';
import { formatDuration } from '../../utils/formatters';
import type { Recording } from '../../domain/models';

export const RecordingGallery: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { playingId, playRecording } = usePlayback();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

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

    const removeRecording = async (id: string) => {
        if (confirm(t('gallery.confirmDelete'))) {
            await recordingRepository.remove(id);
        }
    };

    if (loading) return <div className="gallery-loading">{t('gallery.loading')}</div>;

    if (!user) {
        return (
            <div className="gallery-empty">
                <Music size={40} strokeWidth={1.25} />
                <p>{t('gallery.notLoggedIn')}</p>
            </div>
        );
    }

    return (
        <div className="recording-gallery">
            <h3>{t('gallery.title')}</h3>
            <div className="recordings-grid">
                {recordings.length === 0 ? (
                    <p className="no-data">{t('gallery.empty')}</p>
                ) : (
                    recordings.map(rec => {
                        const isPlaying = playingId === rec.id;
                        return (
                            <div key={rec.id} className="recording-card">
                                <div className="rec-info">
                                    <span className="rec-name">{rec.name}</span>
                                    <span className="rec-meta">
                                        {typeof rec.timestamp === 'number' && new Date(rec.timestamp).toLocaleDateString()}
                                        {rec.duration ? ` · ${formatDuration(rec.duration)}` : ''}
                                    </span>
                                </div>
                                <div className="rec-actions">
                                    <button
                                        className={`icon-btn play ${isPlaying ? 'playing' : ''}`}
                                        onClick={() => playRecording(rec)}
                                        title={isPlaying ? t('gallery.stop') : t('gallery.play')}
                                    >
                                        {isPlaying ? <Square size={15} fill="currentColor" /> : <Play size={15} />}
                                    </button>
                                    <button
                                        className="icon-btn delete"
                                        onClick={() => rec.id && removeRecording(rec.id)}
                                        title={t('gallery.delete')}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
