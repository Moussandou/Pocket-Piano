import React from 'react';
import { useTranslation } from 'react-i18next';
import './ContentPage.css';

export const Credits: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="content-page">
            <span className="page-eyebrow">{t('credits.subhead')}</span>
            <h2>{t('credits.title')}</h2>

            <section>
                <h3>{t('credits.concept.title')}</h3>
                <p>
                    <strong>{t('credits.concept.lead')}</strong> O. Moussandou<br />
                    {t('credits.concept.desc')}
                </p>
            </section>

            <section>
                <h3>{t('credits.design.title')}</h3>
                <p>{t('credits.design.desc')}</p>
            </section>

            <section>
                <h3>{t('credits.tech.title')}</h3>
                <ul>
                    <li><strong>{t('credits.tech.core')}</strong> React + TypeScript</li>
                    <li><strong>{t('credits.tech.audio')}</strong> Web Audio API + Custom VST Sampler</li>
                    <li><strong>{t('credits.tech.infra')}</strong> Firebase (Auth, Firestore, Hosting)</li>
                    <li><strong>{t('credits.tech.styling')}</strong> Pure Vanilla CSS</li>
                    <li><strong>{t('credits.tech.dev')}</strong> Vite + Antigravity AI</li>
                </ul>
                <p className="page-footnote">{t('credits.build')}</p>
            </section>
        </div>
    );
};
