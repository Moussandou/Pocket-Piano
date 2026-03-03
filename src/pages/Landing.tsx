import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    Music,
    Cloud,
    Activity,
    Download,
    FileText,
    Cable,
    Sliders,
    Trophy,
    Keyboard,
    Globe,
    ArrowRight,
    Play
} from 'lucide-react';
import { Piano } from '../components/Piano/Piano';
import './Landing.css';

export const Landing: React.FC = () => {
    const { t } = useTranslation();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [demoPianoVisible, setDemoPianoVisible] = React.useState(false);

    useEffect(() => {
        // Reveal animation on scroll
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }

                // Specifically track demo piano visibility
                if (entry.target.classList.contains('piano-wrapper')) {
                    setDemoPianoVisible(entry.isIntersecting);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.reveal, .piano-wrapper').forEach(el => {
            observerRef.current?.observe(el);
        });

        return () => observerRef.current?.disconnect();
    }, []);

    const features = [
        { id: 1, icon: <Music size={24} />, title: t('landing.features.feat1.title'), desc: t('landing.features.feat1.desc') },
        { id: 2, icon: <Cloud size={24} />, title: t('landing.features.feat2.title'), desc: t('landing.features.feat2.desc') },
        { id: 3, icon: <Activity size={24} />, title: t('landing.features.feat3.title'), desc: t('landing.features.feat3.desc') },
        { id: 4, icon: <Download size={24} />, title: t('landing.features.feat4.title'), desc: t('landing.features.feat4.desc') },
        { id: 5, icon: <FileText size={24} />, title: t('landing.features.feat5.title'), desc: t('landing.features.feat5.desc') },
        { id: 6, icon: <Cable size={24} />, title: t('landing.features.feat6.title'), desc: t('landing.features.feat6.desc') },
        { id: 7, icon: <Sliders size={24} />, title: t('landing.features.feat7.title'), desc: t('landing.features.feat7.desc') },
        { id: 8, icon: <Trophy size={24} />, title: t('landing.features.feat8.title'), desc: t('landing.features.feat8.desc') },
        { id: 9, icon: <Keyboard size={24} />, title: t('landing.features.feat9.title'), desc: t('landing.features.feat9.desc') },
        { id: 10, icon: <Globe size={24} />, title: t('landing.features.feat10.title'), desc: t('landing.features.feat10.desc') },
    ];

    return (
        <main className="landing-main">
            {/* 1. Hero Section */}
            <section className="hero-section border-bottom">
                <div className="section-container hero-grid">
                    <div className="hero-content reveal">
                        <div className="hero-tag mono">{t('site.version')}</div>
                        <h1 className="hero-title">{t('landing.hero.title')}</h1>
                        <p className="hero-description">{t('landing.hero.description')}</p>
                        <div className="hero-actions">
                            <Link to="/app" className="btn btn-primary">
                                {t('landing.hero.cta')} <Play size={16} style={{ marginLeft: '8px' }} />
                            </Link>
                        </div>
                    </div>
                    <div className="hero-visual reveal">
                        <div className="piano-mockup">
                            <div className="mockup-body">
                                <div className="mockup-keys">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`mockup-key ${[1, 3, 6, 8, 10].includes(i % 12) ? 'black' : 'white'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Interactive Piano Section */}
            <section className="interactive-section border-bottom">
                <div className="scrolling-sheets-bg" />
                <div className="section-container">
                    <div className="interactive-header reveal">
                        <span className="label-pill">{t('landing.try.label')}</span>
                        <h2 className="hero-title" style={{ fontSize: '3rem', color: 'white' }}>{t('landing.try.title')}</h2>
                        <p className="hero-description" style={{ color: 'white', margin: '1rem auto' }}>{t('landing.try.description')}</p>
                    </div>
                    <div className="piano-wrapper reveal">
                        <Piano active={demoPianoVisible} startOctave={3} endOctave={4} />
                    </div>
                </div>
            </section>

            {/* 3. Features Grid */}
            <section className="features-section border-bottom">
                <div className="section-container">
                    <div className="reveal" style={{ marginBottom: '4rem' }}>
                        <span className="text-primary mono" style={{ fontWeight: 700 }}>{t('landing.features.subhead')}</span>
                        <h2 className="hero-title" style={{ fontSize: '3.5rem' }}>{t('landing.features.title')}</h2>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                className="feature-card reveal"
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <div className="feature-icon-wrapper">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Final CTA Section */}
            <section className="final-cta-section">
                <div className="section-container">
                    <div className="cta-box reveal">
                        <h2 className="cta-title">{t('landing.final.title')}</h2>
                        <p className="cta-description">{t('landing.final.description')}</p>
                        <div className="cta-actions">
                            <Link to="/app" className="btn btn-primary">
                                {t('landing.final.cta')} <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                            </Link>
                            <a
                                href="https://ko-fi.com/moussandou"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline"
                            >
                                {t('landing.final.kofi')}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
