import React, { useState } from 'react';
import { auth } from '../../infra/firebase';

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
    const [recordingName, setRecordingName] = useState('Mon Morceau');
    const isAuthenticated = !!auth.currentUser;

    if (!isOpen) return null;

    const handleSave = () => {
        if (recordingName.trim()) {
            onSave(recordingName.trim());
            setRecordingName('Mon Morceau'); // Reset for next time
            onClose();
        }
    };

    const handleDiscard = () => {
        onDiscard();
        setRecordingName('Mon Morceau');
        onClose();
    };

    return (
        <div className="gallery-overlay" style={{ zIndex: 1000 }}>
            <div className="gallery-modal" style={{ maxWidth: '400px', height: 'auto', padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Sauvegarder l'enregistrement</h2>

                    {!isAuthenticated && (
                        <div style={{
                            background: '#fff3cd',
                            color: '#856404',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem'
                        }}>
                            <p style={{ margin: 0, fontWeight: 500 }}>Non connecté(e)</p>
                            <p style={{ margin: '0.25rem 0 0 0' }}>Cet enregistrement sera téléchargé sur votre appareil. Connectez-vous pour le sauvegarder dans le cloud et le retrouver sur tous vos appareils.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="recording-name" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                            Nom du morceau
                        </label>
                        <input
                            id="recording-name"
                            type="text"
                            value={recordingName}
                            onChange={(e) => setRecordingName(e.target.value)}
                            placeholder="Entrez le nom du morceau..."
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
                        Annuler
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
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    );
};
