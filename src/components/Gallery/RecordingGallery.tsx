
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../infra/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { Play, Trash2, Calendar, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Recording {
    id: string;
    name: string;
    notes: unknown[];
    timestamp: Timestamp;
    duration: number;
}

export const RecordingGallery: React.FC = () => {
    const { t } = useTranslation();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) {
                setRecordings([]);
                setLoading(false);
                return;
            }

            const q = query(
                collection(db, 'recordings'),
                where('userId', '==', user.uid),
                orderBy('timestamp', 'desc')
            );

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Recording[];
                setRecordings(docs);
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        });

        return () => unsubscribeAuth();
    }, []);

    const removeRecording = async (id: string) => {
        if (confirm(t('gallery.confirmDelete'))) {
            await deleteDoc(doc(db, 'recordings', id));
        }
    };

    if (loading) return <div className="gallery-loading">{t('gallery.loading')}</div>;

    if (!auth.currentUser) {
        return (
            <div className="gallery-empty">
                <Music size={40} />
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
                    recordings.map(rec => (
                        <div key={rec.id} className="recording-card">
                            <div className="rec-info">
                                <span className="rec-name">{rec.name}</span>
                                <span className="rec-meta">
                                    <Calendar size={12} /> {rec.timestamp?.toDate().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="rec-actions">
                                <button className="icon-btn play" title={t('gallery.play')}><Play size={16} /></button>
                                <button className="icon-btn delete" onClick={() => removeRecording(rec.id)} title={t('gallery.delete')}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
