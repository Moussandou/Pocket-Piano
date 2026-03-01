import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserStats } from '../../domain/models';

export type StatsUnsubscribe = () => void;

/**
 * Abstracts Firestore operations on the user stats sub-collection.
 */
export const statsRepository = {
    subscribeGlobal(
        userId: string,
        onData: (stats: UserStats | null) => void
    ): StatsUnsubscribe {
        const statsRef = doc(db, 'users', userId, 'stats', 'global');

        return onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                onData({
                    totalNotes: data.totalNotes || 0,
                    totalPlaytime: data.totalPlaytime || 0,
                    totalSessions: data.totalSessions || 0,
                    totalVelocity: data.totalVelocity || 0,
                    noteCountForVelocity: data.noteCountForVelocity || 0,
                    lastUpdated: data.lastUpdated,
                });
            } else {
                onData(null);
            }
        });
    },
};
