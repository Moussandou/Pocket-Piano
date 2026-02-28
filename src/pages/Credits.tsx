import React from 'react';
import { useTranslation } from 'react-i18next';
import './Landing.css';

export const Credits: React.FC = () => {
    const { t } = useTranslation();

    return (
        <main className="landing-main">
            <section className="features-section" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
                <div className="features-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <span className="subhead">{t('credits.subhead')}</span>
                        <h3 className="section-title">{t('credits.title')}</h3>
                    </div>
                </div>

                <div className="legal-content" style={{ maxWidth: '800px', padding: '0 1.5rem', fontFamily: 'var(--font-body)', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('credits.concept.title')}</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>{t('credits.concept.lead')}</strong> O. Moussandou<br />
                            {t('credits.concept.desc')}
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('credits.design.title')}</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            {t('credits.design.desc')}
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('credits.tech.title')}</h4>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            <li><strong>{t('credits.tech.core')}</strong> React + TypeScript</li>
                            <li><strong>{t('credits.tech.audio')}</strong> Web Audio API + Custom VST Sampler</li>
                            <li><strong>{t('credits.tech.infra')}</strong> Firebase (Auth, Firestore, Hosting)</li>
                            <li><strong>{t('credits.tech.styling')}</strong> Pure Vanilla CSS</li>
                            <li><strong>{t('credits.tech.dev')}</strong> Vite + Antigravity AI</li>
                        </ul>
                    </div>

                    <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '4rem' }}>
                        {t('credits.build')}
                    </p>
                </div>
            </section>
        </main>
    );
};
