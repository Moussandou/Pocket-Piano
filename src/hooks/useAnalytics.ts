import { useRef, useCallback, useEffect } from 'react';
import { db, auth } from '../infra/firebase';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

const SYNC_INTERVAL_MS = 30000; // 30 seconds
const NOTE_THRESHOLD = 50; // Sync every 50 notes

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

        // Reset buffer before async call to avoid double counting
        buffer.current = {
            notes: 0,
            velocitySum: 0,
            playtimeStart: 0,
            lastNoteTime: 0,
            untrackedPlaytime: 0
        };

        try {
            const statsRef = doc(db, 'users', user.uid, 'stats', 'global');
            await setDoc(statsRef, {
                totalNotes: increment(notes),
                totalVelocity: increment(velocitySum),
                noteCountForVelocity: increment(notes),
                totalPlaytime: increment(untrackedPlaytime),
                totalSessions: increment(shouldIncrementSession ? 1 : 0),
                lastUpdated: serverTimestamp()
            }, { merge: true });
            console.log(`[Analytics] Synced ${notes} notes and ${untrackedPlaytime}ms playtime`);
        } catch (error) {
            console.error("[Analytics] Sync failed", error);
            // In a real app, we might want to put the data back in the buffer, 
            // but for simplicity we'll just log the error.
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
