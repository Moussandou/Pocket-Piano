import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { recordingRepository } from '../../infra/repositories/recordingRepository';
import { statsRepository } from '../../infra/repositories/statsRepository';
import { levelFromXp, levelProgress as calcLevelProgress, xpForLevel } from '../../domain/leveling';
import type { Recording } from '../../domain/models';

interface ProfileStats {
    totalPlaytime: number;
    totalNotes: number;
    totalSessions: number;
    lastSession: Recording | null;
    avgVelocity: number;
    isLoading: boolean;
    globalNotes: number;
    globalPlaytime: number;
    globalAvgVelocity: number;
    globalSessions: number;
    currentStreak: number;
    bestStreak: number;
    xp: number;
    level: number;
}

const INITIAL_STATS: ProfileStats = {
    totalPlaytime: 0,
    totalNotes: 0,
    totalSessions: 0,
    lastSession: null,
    avgVelocity: 0,
    isLoading: true,
    globalNotes: 0,
    globalPlaytime: 0,
    globalAvgVelocity: 0,
    globalSessions: 0,
    currentStreak: 0,
    bestStreak: 0,
    xp: 0,
    level: 1,
};

export type Timeframe = 'weekly' | 'monthly' | 'yearly';

const TIMEFRAME_MS: Record<Timeframe, number> = {
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    yearly: 365 * 24 * 60 * 60 * 1000,
};

export function useProfileData() {
    const { user } = useAuth();
    const [stats, setStats] = useState<ProfileStats>(INITIAL_STATS);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [statsTimeframe, setStatsTimeframe] = useState<Timeframe>('weekly');

    useEffect(() => {
        if (!user) return;

        const cutoff = Date.now() - TIMEFRAME_MS[statsTimeframe];

        const unsubRecordings = recordingRepository.subscribeByUser(user.uid, (allRecordings) => {
            const filtered = allRecordings.filter(r => {
                const ts = typeof r.timestamp === 'number' ? r.timestamp : 0;
                return ts >= cutoff;
            });

            let playtime = 0;
            let notesCount = 0;
            let totalVelocity = 0;
            let noteCountForVelocity = 0;

            filtered.forEach(rec => {
                playtime += rec.duration || 0;
                notesCount += (rec.notes || []).length;
                (rec.notes || []).forEach(n => {
                    if (typeof n.velocity === 'number') {
                        totalVelocity += n.velocity;
                        noteCountForVelocity++;
                    }
                });
            });

            const sorted = [...filtered].sort((a, b) => {
                const tA = typeof a.timestamp === 'number' ? a.timestamp : 0;
                const tB = typeof b.timestamp === 'number' ? b.timestamp : 0;
                return tB - tA;
            });

            setStats(prev => ({
                ...prev,
                totalPlaytime: playtime,
                totalNotes: notesCount,
                totalSessions: filtered.length,
                lastSession: sorted[0] || null,
                avgVelocity: noteCountForVelocity > 0 ? totalVelocity / noteCountForVelocity : 0,
                isLoading: false,
            }));
            setRecordings(filtered);
        });

        const unsubGlobal = statsRepository.subscribeGlobal(user.uid, (globalStats) => {
            if (globalStats) {
                setStats(prev => ({
                    ...prev,
                    globalNotes: globalStats.totalNotes,
                    globalPlaytime: globalStats.totalPlaytime,
                    globalAvgVelocity: globalStats.noteCountForVelocity > 0
                        ? globalStats.totalVelocity / globalStats.noteCountForVelocity
                        : 0,
                    globalSessions: globalStats.totalSessions,
                    currentStreak: globalStats.currentStreak || 0,
                    bestStreak: globalStats.bestStreak || 0,
                    xp: globalStats.xp || 0,
                    level: globalStats.level || 1,
                }));
            }
        });

        return () => {
            unsubRecordings();
            unsubGlobal();
        };
    }, [user, statsTimeframe]);

    const displayNotes = stats.globalNotes || stats.totalNotes;
    const displayPlaytime = stats.globalPlaytime || stats.totalPlaytime;
    const displayAvgVelocity = stats.globalAvgVelocity || stats.avgVelocity;
    const displaySessions = stats.globalSessions || stats.totalSessions;

    const currentLevel = levelFromXp(stats.xp);
    const progress = calcLevelProgress(stats.xp);
    const xpToNextLevel = xpForLevel(currentLevel + 1);

    return {
        user,
        stats,
        recordings,
        statsTimeframe,
        setStatsTimeframe,
        displayNotes,
        displayPlaytime,
        displayAvgVelocity,
        displaySessions,
        currentLevel,
        levelProgress: progress * 100,
        xpToNextLevel,
        currentStreak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        xp: stats.xp,
    };
}
