import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Landing.css';

export const Landing: React.FC = () => {
    const { t } = useTranslation();
    return (
        <main className="landing-main">
            {/* Hero Section */}
            <section className="hero-section border-bottom">
                <div className="hero-grid">
                    {/* Text Content (Left/Top) */}
                    <div className="hero-content">
                        <div className="system-status">
                            <span>{t('landing.status')}</span>
                            <span className="divider"></span>
                            <span>{t('landing.latency')}</span>
                        </div>
                        <h2 className="hero-title">
                            {t('landing.title1')}<br />
                            {t('landing.title2')}<br />
                            {t('landing.title3')}
                        </h2>
                        <p className="hero-description">
                            {t('landing.description')}
                        </p>
                        <div className="hero-actions">
                            <Link to="/app" className="btn-primary-tech">
                                <span>{t('landing.btnStart')}</span>
                                <span className="dot"></span>
                            </Link>
                            <button className="btn-secondary-tech">
                                <span className="material-symbols-outlined">download</span>
                                <span>{t('landing.btnManual')}</span>
                            </button>
                        </div>

                        {/* Technical Metadata Footer */}
                        <div className="hero-meta">
                            <div className="meta-grid">
                                <div className="meta-item">
                                    <span className="meta-label">{t('landing.metaVersion')}</span>
                                    2.4.1 Stable
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">{t('landing.metaBuild')}</span>
                                    2940-X
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">{t('landing.metaAudio')}</span>
                                    96kHz / 24bit
                                </div>
                                <div className="meta-item">
                                    <span className="meta-label">{t('landing.metaMidi')}</span>
                                    Full Support
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Content (Right/Bottom) */}
                    <div className="hero-visual">
                        <div className="landing-grid-bg"></div>
                        <div className="visual-wrapper">
                            <img
                                alt={t('landing.schematicAlt')}
                                className="schematic-img"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBykQRsx-mK77vwqZkxZioliFwesGiVUUGPlvndtkku-FPkJmfk4kAaei6u6YDL7SOcaWOXVgu3zKZD7wOSp6hWhQmLdh37LywL4Y6ZyQNz4Z7oWDbBzcLXwr2RAvGyfwosqk3fPV-5DxZJa43fSigGMSI1aa9iWUbMSQde_SGZKdkhbnOcGwNqVsmMlNwbwJKOi9CeEnLEqBH-w7umT0iDEDWiom2-k-w_6ytpn7yrg5U5-yWWza3AVTswSlPgutAL24BVsm5fvTA"
                            />
                            <div className="fig-label">FIG 1.2</div>
                            <div className="scale-label">SCALE: 1:1</div>
                            <div className="crosshair-h"></div>
                            <div className="crosshair-v"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section border-bottom">
                {/* Image Side */}
                <div className="cta-visual group hover-effect">
                    <div className="visual-overlay"></div>
                    <img
                        alt={t('landing.keysAlt')}
                        className="keys-img hover-scale"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuACC8x9v6vnmOXefrwUpnABQDUHxW4OBezN1kA5_3qUHx8dikSmPQmfKAKWpP20CV5cqmorNLsetxkr9MbyUJNmzhdRaMqmvAILXydBiATFpud-jiFd7epz2SZFf5RL2Di5ertG0FvQZT6o5DlQnofOssB5gFNJdhrh4Q27m49r-sFyhlWlKKjFQIjAh7_kaimzhCTvKkRRV_0GLLvg4DlkyVA0Qu5hD2_TYYlXbCH0IIprIQJpzdpvwIBSNzA4ksv3JB7WvV9O2rk"
                    />
                    <div className="cam-label">CAM_01: TOP_DOWN</div>
                </div>
                {/* Content Side */}
                <div className="cta-content relative-box">
                    <div className="decor-grid"></div>
                    <h2 className="cta-title">
                        {t('landing.ctaTitle1')}<br />{t('landing.ctaTitle2')}
                    </h2>
                    <p className="cta-desc">
                        {t('landing.ctaDesc')}
                    </p>
                    <Link to="/app" className="btn-cta group hover-primary">
                        <span>{t('landing.btnInitialize')}</span>
                        <span className="material-symbols-outlined slide-on-hover">arrow_forward</span>
                    </Link>
                    <div className="cta-checks">
                        <div className="check-item">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>{t('landing.checkNoInstall')}</span>
                        </div>
                        <div className="check-item">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>{t('landing.checkFreeAccess')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="features-section border-bottom">
                <div className="features-header">
                    <div>
                        <span className="subhead">{t('landing.featureSubhead')}</span>
                        <h3 className="section-title">{t('landing.featureTitle')}</h3>
                    </div>
                    <div className="status-text hidden-sm">
                        {t('landing.featureStatus')}<br />
                        {t('landing.featureModules')}
                    </div>
                </div>

                <div className="features-grid">
                    {/* Feature 1 */}
                    <div className="feature-card">
                        <div className="arrow-icon"><span className="material-symbols-outlined">arrow_outward</span></div>
                        <div className="feature-icon"><span className="material-symbols-outlined">graphic_eq</span></div>
                        <h4 className="feature-title">{t('landing.feat1Title')}</h4>
                        <p className="feature-desc">
                            {t('landing.feat1Desc')}
                        </p>
                        <div className="feature-meta">FREQ: 20Hz - 20kHz</div>
                    </div>

                    {/* Feature 2 */}
                    <div className="feature-card">
                        <div className="arrow-icon"><span className="material-symbols-outlined">arrow_outward</span></div>
                        <div className="feature-icon"><span className="material-symbols-outlined">sync_alt</span></div>
                        <h4 className="feature-title">{t('landing.feat2Title')}</h4>
                        <p className="feature-desc">
                            {t('landing.feat2Desc')}
                        </p>
                        <div className="feature-meta">Protocol: WSS/TLS</div>
                    </div>

                    {/* Feature 3 */}
                    <div className="feature-card">
                        <div className="arrow-icon"><span className="material-symbols-outlined">arrow_outward</span></div>
                        <div className="feature-icon"><span className="material-symbols-outlined">visibility</span></div>
                        <h4 className="feature-title">{t('landing.feat3Title')}</h4>
                        <p className="feature-desc">
                            {t('landing.feat3Desc')}
                        </p>
                        <div className="feature-meta">Refresh: 60/120/144 Hz</div>
                    </div>
                </div>
            </section>

        </main>
    );
};
