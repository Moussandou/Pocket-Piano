import { useRef, useCallback, useEffect } from 'react';
import { db, auth } from '../infra/firebase';
import { doc, setDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import { XP_PER_NOTE, XP_SESSION_BONUS, levelFromXp } from '../domain/leveling';

const SYNC_INTERVAL_MS = 30000;
const NOTE_THRESHOLD = 50;

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

export const useAnalytics = () => {
    const buffer = useRef({
        notes: 0,
        velocitySum: 0,
        playtimeStart: 0,
        lastNoteTime: 0,
        untrackedPlaytime: 0
    });
    const hasIncrementedSession = useRef(false);

    const syncToFirestore = useCallback(async () => {
        const user = auth.currentUser;
        if (!user || (buffer.current.notes === 0 && buffer.current.untrackedPlaytime === 0)) return;

        const { notes, velocitySum, untrackedPlaytime } = buffer.current;
        const shouldIncrementSession = !hasIncrementedSession.current;

        if (shouldIncrementSession) {
            hasIncrementedSession.current = true;
        }

        buffer.current = {
            notes: 0,
            velocitySum: 0,
            playtimeStart: 0,
            lastNoteTime: 0,
            untrackedPlaytime: 0
        };

        try {
            const statsRef = doc(db, 'users', user.uid, 'stats', 'global');

            // Compute streak and XP updates
            const xpEarned = (notes * XP_PER_NOTE) + (shouldIncrementSession ? XP_SESSION_BONUS : 0);
            const today = todayISO();

            // Read current streak data to compute new streak
            const snap = await getDoc(statsRef);
            const current = snap.data();
            let streakUpdate: Record<string, unknown> = {};

            if (shouldIncrementSession) {
                const lastDate = current?.lastPlayDate as string | undefined;
                const currentStreak = (current?.currentStreak as number) || 0;
                const bestStreak = (current?.bestStreak as number) || 0;

                if (lastDate === today) {
                    // Already played today, no streak change
                } else {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayISO = yesterday.toISOString().slice(0, 10);

                    const newStreak = lastDate === yesterdayISO ? currentStreak + 1 : 1;
                    streakUpdate = {
                        currentStreak: newStreak,
                        bestStreak: Math.max(bestStreak, newStreak),
                        lastPlayDate: today,
                    };
                }
            }

            // Compute new level from accumulated XP
            const currentXp = ((current?.xp as number) || 0) + xpEarned;
            const newLevel = levelFromXp(currentXp);

            await setDoc(statsRef, {
                totalNotes: increment(notes),
                totalVelocity: increment(velocitySum),
                noteCountForVelocity: increment(notes),
                totalPlaytime: increment(untrackedPlaytime),
                totalSessions: increment(shouldIncrementSession ? 1 : 0),
                xp: increment(xpEarned),
                level: newLevel,
                lastUpdated: serverTimestamp(),
                ...streakUpdate,
            }, { merge: true });
        } catch (error) {
            console.error("[Analytics] Sync failed", error);
        }
    }, []);

    const trackNote = useCallback((_note: string, velocity: number = 0.8) => {
        const now = Date.now();

        // Playtime logic: if last note was less than 5 seconds ago, add the diff to untrackedPlaytime
        if (buffer.current.lastNoteTime > 0) {
            const diff = now - buffer.current.lastNoteTime;
            if (diff < 5000) { // 5 second threshold for "continuous play"
                buffer.current.untrackedPlaytime += diff;
            }
        }

        buffer.current.lastNoteTime = now;
        buffer.current.notes += 1;
        buffer.current.velocitySum += velocity;

        if (buffer.current.notes >= NOTE_THRESHOLD) {
            syncToFirestore();
        }
    }, [syncToFirestore]);

    // Periodical sync
    useEffect(() => {
        const interval = setInterval(() => {
            syncToFirestore();
        }, SYNC_INTERVAL_MS);

        return () => {
            clearInterval(interval);
            syncToFirestore(); // Final sync on unmount
        };
    }, [syncToFirestore]);

    return { trackNote };
};
