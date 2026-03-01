import React from 'react';
import { Timestamp } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import type { Recording } from '../../domain/models';
import { formatDuration } from '../../utils/formatters';
import './SessionHistory.css';

interface SessionHistoryProps {
    recordings: Recording[];
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ recordings }) => {
    const { t } = useTranslation();

    const sorted = [...recordings].sort((a, b) => {
        const tA = typeof a.timestamp === 'number' ? a.timestamp : 0;
        const tB = typeof b.timestamp === 'number' ? b.timestamp : 0;
        return tB - tA;
    });

    const recent = sorted.slice(0, 20);

    if (recent.length === 0) {
        return (
            <div className="session-history">
                <h3 className="session-history-title">
                    <span className="material-symbols-outlined">history</span>
                    {t('profile.stats.sessionHistory', 'Session History')}
                </h3>
                <p className="session-history-empty">{t('profile.stats.noSessions')}</p>
            </div>
        );
    }

    return (
        <div className="session-history">
            <h3 className="session-history-title">
                <span className="material-symbols-outlined">history</span>
                {t('profile.stats.sessionHistory', 'Session History')}
            </h3>
            <div className="session-history-list">
                {recent.map((rec) => {
                    const date = rec.timestamp instanceof Timestamp
                        ? rec.timestamp.toDate()
                        : new Date(rec.timestamp as number);
                    const noteCount = (rec.notes || []).length;
                    const duration = rec.duration || 0;

                    return (
                        <div key={rec.id} className="session-history-item">
                            <div className="session-history-date">
                                <span className="session-day">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                <span className="session-date">{date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div className="session-history-body">
                                <span className="session-history-name">{rec.name}</span>
                                <div className="session-history-meta">
                                    <span>{formatDuration(duration)}</span>
                                    <span className="session-meta-sep">·</span>
                                    <span>{noteCount} note{noteCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
