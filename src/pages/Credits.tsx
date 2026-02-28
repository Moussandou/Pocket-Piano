import React from 'react';
import './Landing.css';

export const Credits: React.FC = () => {
    return (
        <main className="landing-main">
            <section className="features-section" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
                <div className="features-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <span className="subhead">Project Origin</span>
                        <h3 className="section-title">Credits</h3>
                    </div>
                </div>

                <div className="legal-content" style={{ maxWidth: '800px', padding: '0 1.5rem', fontFamily: 'var(--font-body)', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Concept & Development</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>Lead Architect & Dev :</strong> O. Moussandou<br />
                            Développé avec une passion pour l'ingénierie sonore et les interfaces industrielles minimalistes.
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Design Inspiration</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Le design visuel de Pocket Piano tire son inspiration des interfaces techniques de précision, du brutalisme numérique et des équipements de studio vintage.
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>Technology Stack</h4>
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            <li><strong>Core :</strong> React + TypeScript</li>
                            <li><strong>Audio :</strong> Web Audio API + Custom VST Sampler</li>
                            <li><strong>Infrastructure :</strong> Firebase (Auth, Firestore, Hosting)</li>
                            <li><strong>Styling :</strong> Pure Vanilla CSS</li>
                            <li><strong>Development :</strong> Vite + Antigravity AI</li>
                        </ul>
                    </div>

                    <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', opacity: 0.6, marginTop: '4rem' }}>
                        BUILD REV. 2.4.1 / AUDIO_ENGINE_v4
                    </p>
                </div>
            </section>
        </main>
    );
};
