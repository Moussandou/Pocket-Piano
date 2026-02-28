import React from 'react';
import { useTranslation } from 'react-i18next';
import './Landing.css'; // Reusing landing styles for consistency

export const Legal: React.FC = () => {
    const { t } = useTranslation();

    return (
        <main className="landing-main">
            <section className="features-section" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
                <div className="features-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <span className="subhead">{t('legal.subhead')}</span>
                        <h3 className="section-title">{t('legal.title')}</h3>
                    </div>
                </div>

                <div className="legal-content" style={{ maxWidth: '800px', padding: '0 1.5rem', fontFamily: 'var(--font-body)', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('legal.mentions.title')}</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>{t('legal.mentions.editor')}</strong><br />
                            {t('legal.mentions.editorDesc')}<br />
                            {t('legal.mentions.director')} O. Moussandou
                        </p>
                        <p>
                            <strong>{t('legal.mentions.hosting')}</strong><br />
                            {t('legal.mentions.hostingDesc')}<br />
                            Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('legal.privacy.title')}</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            {t('legal.privacy.desc')}
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>{t('legal.privacy.dataCollected')}</strong><br />
                            - {t('legal.privacy.email')}<br />
                            - {t('legal.privacy.stats')}
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>{t('legal.privacy.purposes')}</strong><br />
                            {t('legal.privacy.purposesDesc')}
                        </p>
                        <p>
                            <strong>{t('legal.privacy.rights')}</strong><br />
                            {t('legal.privacy.rightsDesc')}
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('legal.intellectual.title')}</h4>
                        <p>
                            {t('legal.intellectual.desc')}
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};
