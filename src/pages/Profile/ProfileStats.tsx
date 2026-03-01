import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timestamp } from 'firebase/firestore';
import { formatPlaytime, formatNotes } from '../../utils/formatters';
import type { Recording } from '../../domain/models';
import type { Timeframe } from './useProfileData';

interface ProfileStatsProps {
    displayPlaytime: number;
    displayNotes: number;
    displayAvgVelocity: number;
    displaySessions: number;
    currentLevel: number;
    levelProgress: number;
    statsTimeframe: Timeframe;
    setStatsTimeframe: (tf: Timeframe) => void;
    recordings: Recording[];
    lastSession: Recording | null;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    displayPlaytime,
    displayNotes,
    displayAvgVelocity,
    displaySessions,
    currentLevel,
    levelProgress,
    statsTimeframe,
    setStatsTimeframe,
    recordings,
    lastSession,
}) => {
    const { t } = useTranslation();
    const { hours, minutes } = formatPlaytime(displayPlaytime);

    return (
        <div className="panel-right">
            {/* Stats grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">{t('profile.stats.playtime')}</span>
                    <div className="stat-val-group">
                        <span className="stat-val">{hours}<span className="stat-unit">{t('common.units.hours')}</span></span>
                        <span className="stat-val">{minutes}<span className="stat-unit">{t('common.units.minutes')}</span></span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('profile.stats.recordings')}</span>
                    <span className="stat-val">{formatNotes(displayNotes)}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('profile.stats.skillLevel')}</span>
                    <div className="stat-val-group">
                        <span className="stat-val primary-color">LVL {currentLevel}</span>
                    </div>
                    <div className="level-progress-wrapper">
                        <div className="level-progress-bar">
                            <div className="level-progress-fill" style={{ width: `${levelProgress}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">{t('profile.stats.sessions')}</span>
                    <span className="stat-val">{displaySessions}</span>
                </div>
            </div>

            {/* Chart */}
            <div className="chart-box">
                <div className="chart-header">
                    <h3 className="box-title text-2xl">{t('profile.stats.performanceAnalytics')}</h3>
                    <div className="chart-tabs">
                        {(['weekly', 'monthly', 'yearly'] as Timeframe[]).map(tf => (
                            <button
                                key={tf}
                                className={statsTimeframe === tf ? 'tab-active' : 'tab-inactive'}
                                onClick={() => setStatsTimeframe(tf)}
                            >{t(`profile.stats.${tf}`)}</button>
                        ))}
                    </div>
                </div>
                <div className="chart-area">
                    <div className="chart-grid-lines">
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                        <div className="grid-line"></div>
                    </div>
                    <div className="chart-bars">
                        {(() => {
                            const days = t('common.daysShort', { returnObjects: true }) as string[];
                            const now = new Date();
                            const dayData = days.map((_, i) => {
                                const targetDay = (i + 1) % 7;
                                let total = 0;
                                recordings.filter((r: Recording) => {
                                    const ts = r.timestamp instanceof Timestamp
                                        ? r.timestamp.toDate()
                                        : new Date(r.timestamp as number);
                                    return ts.getDay() === targetDay;
                                }).forEach((r: Recording) => { total += r.duration || 0; });
                                return total;
                            });
                            const maxVal = Math.max(...dayData, 1);
                            return dayData.map((val, i) => {
                                const pct = Math.max(2, (val / maxVal) * 100);
                                const hrs = (val / 3600000).toFixed(1);
                                const isToday = ((now.getDay() + 6) % 7) === i;
                                return (
                                    <div key={i} className="bar-wrapper" style={{ height: `${pct}%` }}>
                                        <div className={`bar ${isToday ? 'primary' : 'default'}`}></div>
                                        <div className={`tooltip ${isToday ? 'visible' : ''}`}>{hrs}{t('common.units.hours')}</div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
                <div className="chart-labels">
                    {(t('common.daysShort', { returnObjects: true }) as string[]).map((day, i) => (
                        <span key={i}>{day}</span>
                    ))}
                </div>
            </div>

            {/* Velocity + Last Session */}
            <div className="bottom-stats-grid">
                <div className="velocity-box">
                    <div className="velocity-header">
                        <h4 className="box-title">{t('profile.stats.dynamicRange')}</h4>
                        <div className="velocity-score">
                            <span className="score-val">{(displayAvgVelocity * 100).toFixed(0)}</span>
                            <span className="score-unit">{t('profile.stats.avg')}</span>
                        </div>
                    </div>
                    <div className="velocity-bars-container">
                        <div className="vel-bar default h-10" title="pp"></div>
                        <div className="vel-bar default h-25" title="p"></div>
                        <div className="vel-bar default h-45" title="mp"></div>
                        <div className="vel-bar primary h-85" title="mf"></div>
                        <div className="vel-bar default h-60" title="f"></div>
                        <div className="vel-bar default h-30" title="ff"></div>
                    </div>
                    <div className="velocity-labels">
                        <span>pp</span><span>p</span><span>mp</span><span>mf</span><span>f</span><span>ff</span>
                    </div>
                </div>

                <div className="session-box">
                    <h4 className="box-title mb-4">{t('profile.stats.lastSession')}</h4>
                    <div className="session-content">
                        {lastSession ? (
                            <>
                                <div className="session-item">
                                    <span className="material-symbols-outlined text-primary">schedule</span>
                                    <div>
                                        <p className="session-name">
                                            {lastSession.timestamp
                                                ? (lastSession.timestamp instanceof Timestamp
                                                    ? lastSession.timestamp.toDate().toLocaleDateString()
                                                    : new Date(lastSession.timestamp).toLocaleDateString())
                                                : t('library.dateUnknown')}
                                        </p>
                                        <p className="session-detail">
                                            {t('profile.stats.minutesDuration', { count: parseFloat(((lastSession.duration || 0) / 1000 / 60).toFixed(1)) })}
                                        </p>
                                    </div>
                                </div>
                                <div className="session-item">
                                    <span className="material-symbols-outlined text-primary">music_note</span>
                                    <div>
                                        <p className="session-name">{lastSession.name}</p>
                                        <p className="session-detail">{t('profile.stats.notesCaptured', { count: (lastSession.notes || []).length })}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-gray italic">{t('profile.stats.noSessions')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
