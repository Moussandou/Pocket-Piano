import {
    collection, query, where, onSnapshot, orderBy,
    deleteDoc, doc, updateDoc, addDoc, Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Sheet } from '../../domain/models';

export type SheetUnsubscribe = () => void;

export const sheetRepository = {
    subscribeByUser(
        userId: string,
        onData: (sheets: Sheet[]) => void
    ): SheetUnsubscribe {
        const q = query(
            collection(db, 'sheets'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const sheets: Sheet[] = snapshot.docs.map(d => {
                const data = d.data();
                const timestamp = data.timestamp instanceof Timestamp
                    ? data.timestamp.toMillis()
                    : (typeof data.timestamp === 'number' ? data.timestamp : 0);

                return {
                    ...data,
                    id: d.id,
                    timestamp,
                } as Sheet;
            });
            onData(sheets);
        });
    },

    async add(sheet: Omit<Sheet, 'id'>): Promise<string> {
        const docRef = await addDoc(collection(db, 'sheets'), {
            ...sheet,
            timestamp: Timestamp.now(),
        });
        return docRef.id;
    },

    async remove(id: string): Promise<void> {
        await deleteDoc(doc(db, 'sheets', id));
    },

    async updateFavorite(id: string, value: boolean): Promise<void> {
        await updateDoc(doc(db, 'sheets', id), { favorite: value });
    },
};
