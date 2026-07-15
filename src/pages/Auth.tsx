import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, discordProvider } from '../infra/firebase';
import { Piano } from 'lucide-react';
import './Auth.css';

export const Auth: React.FC = () => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Go back to the page the user came from, or the piano
    const from = location.state?.from?.pathname || '/';

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfo(null);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code === 'auth/email-already-in-use') {
                setError(t('auth.error.emailInUse'));
            } else if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
                setError(t('auth.error.invalidCredentials'));
            } else if (firebaseError.code === 'auth/weak-password') {
                setError(t('auth.error.weakPassword'));
            } else {
                setError(t('auth.error.generic'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleProviderAuth = async (provider: typeof googleProvider | typeof discordProvider, errorKey: string) => {
        setError(null);
        setInfo(null);
        try {
            await signInWithPopup(auth, provider);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const firebaseError = err as { code?: string };
            if (firebaseError.code !== 'auth/popup-closed-by-user') {
                setError(t(errorKey));
            }
        }
    };

    const handlePasswordReset = async () => {
        setError(null);
        setInfo(null);
        if (!email) {
            setError(t('auth.error.resetNoEmail'));
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setInfo(t('auth.resetSent'));
        } catch {
            setError(t('auth.error.generic'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Piano size={24} strokeWidth={1.75} />
                </div>

                <h2>{isLogin ? t('auth.titleLogin') : t('auth.titleRegister')}</h2>
                <p className="auth-subtitle">
                    {isLogin ? t('auth.descLogin') : t('auth.descRegister')}
                </p>

                {error && <div className="auth-message error">{error}</div>}
                {info && <div className="auth-message info">{info}</div>}

                <div className="auth-social">
                    <button onClick={() => handleProviderAuth(googleProvider, 'auth.error.google')} className="btn btn-secondary">
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                            </g>
                        </svg>
                        Google
                    </button>
                    <button onClick={() => handleProviderAuth(discordProvider, 'auth.error.discord')} className="btn btn-secondary">
                        <svg viewBox="0 0 127.14 96.36" width="18" height="14" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77.7,77.7,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.16,46,96.06,53,91,65.69,84.69,65.69Z" />
                        </svg>
                        Discord
                    </button>
                </div>

                <div className="auth-divider">
                    <span>{t('auth.orEmail')}</span>
                </div>

                <form onSubmit={handleEmailAuth} className="auth-form">
                    <label htmlFor="email" className="modal-label">{t('auth.emailLabel')}</label>
                    <input
                        id="email"
                        type="email"
                        className="modal-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('auth.emailPlaceholder')}
                        required
                    />

                    <label htmlFor="password" className="modal-label">{t('auth.passwordLabel')}</label>
                    <input
                        id="password"
                        type="password"
                        className="modal-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading
                            ? t('auth.submitting')
                            : (isLogin ? t('auth.submitLogin') : t('auth.submitRegister'))}
                    </button>
                </form>

                <div className="auth-links">
                    {isLogin && (
                        <button type="button" className="auth-link" onClick={handlePasswordReset}>
                            {t('auth.forgotPassword')}
                        </button>
                    )}
                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => { setIsLogin(!isLogin); setError(null); setInfo(null); }}
                    >
                        {isLogin ? t('auth.switchRegister') : t('auth.switchLogin')}
                    </button>
                </div>
            </div>
        </div>
    );
};
