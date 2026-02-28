import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, discordProvider } from '../infra/firebase';
import { Piano } from 'lucide-react';
import './Auth.css';

export const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Go back to the page the user came from, or home
    const from = location.state?.from?.pathname || '/app';

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error("Auth error:", err);
            // Translate common Firebase errors
            if (err.code === 'auth/email-already-in-use') {
                setError('Cet email est déjà utilisé.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Email ou mot de passe incorrect.');
            } else if (err.code === 'auth/weak-password') {
                setError('Le mot de passe doit contenir au moins 6 caractères.');
            } else {
                setError('Une erreur est survenue lors de l\'authentification.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error("Google Auth error:", err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Échec de la connexion avec Google.');
            }
        }
    };

    const handleDiscordAuth = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, discordProvider);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error("Discord Auth error:", err);
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Échec de la connexion avec Discord.');
            }
        }
    };

    return (
        <div className="auth-container">
            {/* Left Side: Technical Info Panel */}
            <aside className="auth-sidebar">
                <div className="auth-sidebar-top">
                    <div className="auth-brand">
                        <div className="auth-brand-icon">
                            <Piano size={20} />
                        </div>
                        <h1 className="auth-brand-text">Pocket Piano</h1>
                    </div>

                    <div className="auth-system-status">
                        <div className="auth-system-label">System Status</div>
                        <div className="auth-system-title">
                            <div className="auth-status-dot"></div>
                            <span>Signal Terminal v.04</span>
                        </div>
                        <p className="auth-system-desc">
                            Interface MIDI haute fidélité. Initialisation du protocole d'authentification pour relier le matériel local à l'architecture cloud.
                        </p>

                        <div className="auth-stats">
                            <div className="auth-stat-row">
                                <span className="auth-stat-label">Signal Strength</span>
                                <div className="auth-signal-bars">
                                    <div className="auth-signal-bar active"></div>
                                    <div className="auth-signal-bar active"></div>
                                    <div className="auth-signal-bar active"></div>
                                    <div className="auth-signal-bar inactive"></div>
                                </div>
                            </div>
                            <div className="auth-stat-row">
                                <span className="auth-stat-label">Encryption</span>
                                <span className="auth-stat-value text-green">SECURE / AES-256</span>
                            </div>
                            <div className="auth-stat-row">
                                <span className="auth-stat-label">Latency</span>
                                <span className="auth-stat-value">14ms</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-sidebar-bottom">
                    <div className="auth-telemetry">
                        <div>Ref: PP-X89</div>
                        <div>Loc: 00.12.92</div>
                        <div>Enc: TLS_1.3</div>
                        <div>Mod: AUTH_MODE</div>
                    </div>
                </div>
            </aside>

            {/* Right Side: Main Auth Panel */}
            <main className="auth-main">
                <div className="auth-form-container">
                    <header className="auth-header-section">
                        <h2>{isLogin ? 'Access Port' : 'Registration Port'}</h2>
                        <div className="auth-header-meta">
                            <span className="auth-meta-primary">Protocol: SSL/TLS</span>
                            <span className="auth-meta-secondary">Node: OMEGA-4</span>
                        </div>
                        <p className="auth-header-desc">
                            {isLogin
                                ? 'Entrez vos identifiants pour la synchronisation'
                                : 'Initialisez un nouveau nœud utilisateur'}
                        </p>
                    </header>

                    {error && <div className="auth-error-box">{error}</div>}

                    <section className="auth-methods-section">
                        <div className="auth-section-divider">
                            <span>External Gateway</span>
                            <div className="auth-divider-line"></div>
                        </div>

                        <div className="auth-social-grid">
                            <button onClick={handleGoogleAuth} className="auth-social-btn group">
                                <span className="auth-social-btn-hover"></span>
                                <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" className="auth-social-icon">
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                    </g>
                                </svg>
                                Google
                            </button>
                            <button onClick={handleDiscordAuth} className="auth-social-btn group">
                                <span className="auth-social-btn-hover"></span>
                                <svg viewBox="0 0 127.14 96.36" width="18" height="14" xmlns="http://www.w3.org/2000/svg" className="auth-social-icon">
                                    <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.16,46,96.06,53,91,65.69,84.69,65.69Z" />
                                </svg>
                                Discord
                            </button>
                        </div>
                    </section>

                    <section className="auth-methods-section">
                        <div className="auth-section-divider">
                            <span>Direct Protocol</span>
                            <div className="auth-divider-line"></div>
                        </div>

                        <form onSubmit={handleEmailAuth} className="auth-direct-form">
                            <div className="auth-input-group">
                                <label htmlFor="email">
                                    <span className="auth-input-indicator indicator-green"></span>
                                    Terminal ID (Email)
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="USER@TERMINAL.NET"
                                    required
                                    className="auth-input"
                                />
                            </div>

                            <div className="auth-input-group">
                                <label htmlFor="password">
                                    <span className="auth-input-indicator indicator-neutral"></span>
                                    Access Code (Password)
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="auth-input"
                                />
                            </div>

                            <div className="auth-form-footer">
                                <button type="submit" className="auth-primary-btn" disabled={loading}>
                                    {loading ? 'Initializing...' : isLogin ? 'Initialize Link' : 'Register Node'}
                                    {!loading && <span style={{ marginLeft: '4px', fontSize: '1.2em' }}>&rarr;</span>}
                                </button>

                                <div className="auth-form-links">
                                    <a href="#" className="auth-link">Recovery Protocol</a>
                                    <button
                                        type="button"
                                        className="auth-link"
                                        onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}
                                    >
                                        {isLogin ? 'New Registration' : 'Return to Login'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            </main>

            {/* Decorative Elements */}
            <div className="auth-decorative top-right"></div>
            <div className="auth-decorative bottom-left"></div>
        </div>
    );
};
