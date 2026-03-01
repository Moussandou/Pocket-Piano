
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SessionRecapProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        totalNotes: number;
        maxCombo: number;
        score: number;
        duration: number; // seconds
        avgVelocity: number;
    };
}

export const SessionRecap: React.FC<SessionRecapProps> = ({ isOpen, onClose, stats }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="recap-overlay">
            <div className="recap-modal">
                <div className="recap-header">
                    <span className="material-symbols-outlined recap-icon">analytics</span>
                    <h2>{t('studio.sessionRecap')}</h2>
                    <button className="recap-close" onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="recap-body">
                    <div className="recap-grid">
                        <div className="recap-stat">
                            <span className="stat-label">{t('studio.stats.totalNotes')}</span>
                            <span className="stat-value">{stats.totalNotes}</span>
                        </div>
                        <div className="recap-stat">
                            <span className="stat-label">{t('studio.stats.duration')}</span>
                            <span className="stat-value">{formatTime(stats.duration)}</span>
                        </div>
                        <div className="recap-stat">
                            <span className="stat-label">{t('studio.stats.maxCombo')}</span>
                            <span className="stat-value">{stats.maxCombo}x</span>
                        </div>
                        <div className="recap-stat highlight">
                            <span className="stat-label">{t('studio.stats.finalScore')}</span>
                            <span className="stat-value">{stats.score.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="recap-performance">
                        <div className="performance-row">
                            <span>{t('studio.stats.avgVelocity')}</span>
                            <div className="performance-bar">
                                <div className="performance-fill" style={{ width: `${stats.avgVelocity * 100}%` }}></div>
                            </div>
                            <span>{Math.round(stats.avgVelocity * 100)}%</span>
                        </div>
                    </div>
                </div>

                <div className="recap-footer">
                    <button className="btn-recap-primary" onClick={onClose}>
                        {t('common.continue')}
                    </button>
                </div>
            </div>
        </div>
    );
};
