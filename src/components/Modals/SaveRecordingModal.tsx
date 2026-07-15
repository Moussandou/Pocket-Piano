import React, { useState } from 'react';
import { LogIn, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

interface SaveRecordingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    onDiscard: () => void;
    /** Present when an MP3 of the take is available for export. */
    onExportAudio?: (name: string) => void;
}

export const SaveRecordingModal: React.FC<SaveRecordingModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDiscard,
    onExportAudio
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [recordingName, setRecordingName] = useState(t('recording.defaultName'));
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const handleSave = () => {
        if (recordingName.trim()) {
            onSave(recordingName.trim());
            setRecordingName(t('recording.defaultName'));
            onClose();
        }
    };

    const handleDiscard = () => {
        onDiscard();
        setRecordingName(t('recording.defaultName'));
        onClose();
    };

    return (
        <div className="gallery-overlay">
            <div className="modal-card">
                <h2>{t('recording.saveTitle')}</h2>

                {!user && (
                    <div className="modal-notice">
                        <p><strong>{t('recording.notConnected')}</strong></p>
                        <p>{t('recording.cloudNotice')}</p>
                        <button className="btn btn-secondary" onClick={() => navigate('/auth', { state: { from: location } })}>
                            <LogIn size={15} />
                            {t('recording.loginButton')}
                        </button>
                    </div>
                )}

                <label htmlFor="recording-name" className="modal-label">
                    {t('recording.nameLabel')}
                </label>
                <input
                    id="recording-name"
                    type="text"
                    className="modal-input"
                    value={recordingName}
                    onChange={(e) => setRecordingName(e.target.value)}
                    placeholder={t('recording.namePlaceholder')}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                />

                <div className="modal-actions">
                    {onExportAudio && (
                        <button
                            className="btn btn-secondary"
                            style={{ marginRight: 'auto' }}
                            onClick={() => onExportAudio(recordingName.trim() || 'recording')}
                        >
                            <Download size={15} />
                            {t('recording.exportMp3')}
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleDiscard}>
                        {t('recording.cancel')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!recordingName.trim() || !user}>
                        {t('recording.save')}
                    </button>
                </div>
            </div>
        </div>
    );
};
