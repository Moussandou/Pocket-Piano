import React, { useState } from 'react';
import { auth } from '../../infra/firebase';
import { LogIn } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SaveRecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    onDiscard: () => void;
}

export const SaveRecordingModal: React.FC<SaveRecordingModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDiscard
}) => {
    const { t } = useTranslation();
    const [recordingName, setRecordingName] = useState(t('recording.defaultName'));
    const isAuthenticated = !!auth.currentUser;
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const handleSave = () => {
        if (recordingName.trim()) {
            onSave(recordingName.trim());
            setRecordingName(t('recording.defaultName')); // Reset for next time
            onClose();
        }
    };

    const handleDiscard = () => {
        onDiscard();
        setRecordingName(t('recording.defaultName'));
        onClose();
    };

    const handleLogin = () => {
        navigate('/auth', { state: { from: location } });
    };

    return (
        <div className="gallery-overlay" style={{ zIndex: 1000 }}>
            <div className="gallery-modal" style={{ maxWidth: '400px', height: 'auto', padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>{t('recording.saveTitle')}</h2>

                    {!isAuthenticated && (
                        <div style={{
                            background: '#fff3cd',
                            color: '#856404',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem'
                        }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>{t('recording.notConnected')}</p>
                            <p style={{ margin: '0.25rem 0 0 0' }}>{t('recording.cloudNotice')}</p>
                            <button
                                onClick={handleLogin}
                                style={{
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    background: '#856404',
                                    color: '#fff3cd',
                                    border: 'none',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    width: '100%',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                                <LogIn size={16} />
                                {t('recording.loginButton')}
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="recording-name" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                            {t('recording.nameLabel')}
                        </label>
                        <input
                            id="recording-name"
                            type="text"
                            value={recordingName}
                            onChange={(e) => setRecordingName(e.target.value)}
                            placeholder={t('recording.namePlaceholder')}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                            }}
                            style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--neutral-main)',
                                fontSize: '1rem',
                                width: '100%',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                        onClick={handleDiscard}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--primary)',
                            background: 'transparent',
                            color: 'var(--primary)',
                            fontWeight: 500,
                            cursor: 'pointer'
                        }}
                    >
                        {t('recording.cancel')}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!recordingName.trim()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer',
                            opacity: !recordingName.trim() ? 0.5 : 1
                        }}
                    >
                        {t('recording.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
