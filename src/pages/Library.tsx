import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Library.css';
import { db } from '../infra/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

import type { Recording } from '../domain/models';

export const Library: React.FC = () => {
    const { t } = useTranslation();
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRecordings(prev => prev.length > 0 ? [] : prev);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(prev => prev ? false : prev);
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
    }, [user]);

    const removeRecording = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(t('library.confirmDelete'))) {
            await deleteDoc(doc(db, 'recordings', id));
        }
    };

    const formatDuration = (ms: number) => {
        if (!ms) return '0:00';
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="library-container">
            {/* Sidebar Navigation */}
            <aside className="library-sidebar">
                <div className="sidebar-section">
                    <h3 className="sidebar-heading">{t('library.allRecordings')}</h3>
                    <ul className="sidebar-nav">
                        <li>
                            <button className="nav-link active">
                                <span className="material-symbols-outlined">library_music</span>
                                <span>{t('library.allRecordings')}</span>
                            </button>
                        </li>
                        <li>
                            <button className="nav-link">
                                <span className="material-symbols-outlined">favorite</span>
                                <span>{t('library.favorites')}</span>
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="sidebar-footer">
                    <div className="pro-plan-box">
                        <h4 className="pro-title">{t('library.proPlan')}</h4>
                        <p className="pro-desc">{t('library.proDesc')}</p>
                        <button className="btn-upgrade">{t('library.upgrade')}</button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="library-main">
                <div className="library-header">
                    <div className="header-text">
                        <h1 className="page-title">{t('library.title')}</h1>
                        <p className="page-subtitle">{t('library.subtitle')}</p>
                    </div>
                    {/* Filters */}
                    <div className="filters-group">
                        <button className="btn-icon active">
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                        <button className="btn-icon">
                            <span className="material-symbols-outlined">list</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="sheets-grid">
                    {/* New Sheet Card */}
                    <button className="sheet-card new-sheet" onClick={() => navigate('/app')}>
                        <div className="add-icon-wrapper">
                            <span className="material-symbols-outlined text-4xl">add</span>
                        </div>
                        <span className="new-sheet-text">{t('library.newRecording')}</span>
                    </button>

                    {loading ? (
                        <div style={{ padding: '2rem', color: '#6b7280' }}>{t('library.loading')}</div>
                    ) : recordings.length === 0 ? (
                        <div style={{ padding: '2rem', color: '#6b7280' }}>
                            {!user
                                ? t('library.signToSee')
                                : t('library.noRecordings')}
                        </div>
                    ) : (
                        recordings.map((rec) => (
                            <article key={rec.id} className="sheet-card hover-effect">
                                <div className="sheet-preview">
                                    <div style={{ width: '100%', height: '100%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#9ca3af' }}>music_note</span>
                                    </div>
                                    <div className="preview-overlay">
                                        <div className="play-btn" onClick={(e) => { e.stopPropagation(); /* TODO: Implement playback */ }}>
                                            <span className="material-symbols-outlined text-black">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="sheet-info">
                                    <div className="sheet-titles" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 className="sheet-title">{rec.name || t('library.untitled')}</h3>
                                            <p className="sheet-composer">
                                                {rec.timestamp ? (
                                                    rec.timestamp instanceof Timestamp
                                                        ? rec.timestamp.toDate().toLocaleDateString()
                                                        : new Date(rec.timestamp).toLocaleDateString()
                                                ) : t('library.dateUnknown')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => rec.id && removeRecording(rec.id, e)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                            title={t('library.deleteTitle')}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                        </button>
                                    </div>
                                    <div className="sheet-meta">
                                        <div className="meta-col">
                                            <span className="meta-label">{t('library.notes')}</span>
                                            <span className="meta-val">{rec.notes?.length || 0}</span>
                                        </div>
                                        <div className="meta-col border-left">
                                            <span className="meta-label">{t('library.duration')}</span>
                                            <span className="meta-val">{formatDuration(rec.duration || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!loading && recordings.length > 0 && (
                    <div className="library-pagination">
                        <span className="pagination-info">{t('library.showingCount', { count: recordings.length })}</span>
                    </div>
                )}
            </main>
        </div>
    );
};

