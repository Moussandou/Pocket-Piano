import {
    collection, query, where, onSnapshot, orderBy,
    deleteDoc, doc, updateDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Recording } from '../../domain/models';

export type RecordingUnsubscribe = () => void;

/**
 * Abstracts all Firestore operations on the 'recordings' collection.
 * Pages never import firebase/firestore directly.
 */
export const recordingRepository = {
    subscribeByUser(
        userId: string,
        onData: (recordings: Recording[]) => void
    ): RecordingUnsubscribe {
        const q = query(
            collection(db, 'recordings'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const recordings: Recording[] = snapshot.docs.map(d => {
                const data = d.data();
                const timestamp = data.timestamp instanceof Timestamp
                    ? data.timestamp.toMillis()
                    : (typeof data.timestamp === 'number' ? data.timestamp : 0);

                return {
                    ...data,
                    id: d.id,
                    timestamp,
                } as Recording;
            });
            onData(recordings);
        });
    },

    async remove(id: string): Promise<void> {
        await deleteDoc(doc(db, 'recordings', id));
    },

    async updateFavorite(id: string, value: boolean): Promise<void> {
        await updateDoc(doc(db, 'recordings', id), { favorite: value });
    },
};
