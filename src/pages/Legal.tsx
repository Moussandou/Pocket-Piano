import React from 'react';
import { useTranslation } from 'react-i18next';
import './ContentPage.css';

export const Legal: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="content-page">
            <span className="page-eyebrow">{t('legal.subhead')}</span>
            <h2>{t('legal.title')}</h2>

            <section>
                <h3>{t('legal.mentions.title')}</h3>
                <p>
                    <strong>{t('legal.mentions.editor')}</strong><br />
                    {t('legal.mentions.editorDesc')}<br />
                    {t('legal.mentions.director')} O. Moussandou
                </p>
                <br />
                <p>
                    <strong>{t('legal.mentions.hosting')}</strong><br />
                    {t('legal.mentions.hostingDesc')}<br />
                    Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
                </p>
            </section>

            <section>
                <h3>{t('legal.privacy.title')}</h3>
                <p>{t('legal.privacy.desc')}</p>
                <br />
                <p>
                    <strong>{t('legal.privacy.dataCollected')}</strong><br />
                    - {t('legal.privacy.email')}<br />
                    - {t('legal.privacy.stats')}
                </p>
                <br />
                <p>
                    <strong>{t('legal.privacy.purposes')}</strong><br />
                    {t('legal.privacy.purposesDesc')}
                </p>
                <br />
                <p>
                    <strong>{t('legal.privacy.rights')}</strong><br />
                    {t('legal.privacy.rightsDesc')}
                </p>
            </section>

            <section>
                <h3>{t('legal.intellectual.title')}</h3>
                <p>{t('legal.intellectual.desc')}</p>
            </section>
        </div>
    );
};
