import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatTime } from '../../utils/formatters';

interface StudioToolbarProps {
    isRecording: boolean;
    recordingTime: number;
    onToggleRecord: () => void;
    onOpenGallery: () => void;
    showHelp: boolean;
    onToggleHelp: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
    isRecording,
    recordingTime,
    onToggleRecord,
    onOpenGallery,
    showHelp,
    onToggleHelp,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="sidebar-right">
            <div className="record-btn-wrapper">
                <button
                    className={`btn-record-prominent ${isRecording ? 'recording' : ''}`}
                    onClick={onToggleRecord}
                    title={isRecording ? t('studio.stopRecording') : t('studio.startRecording')}
                >
                    <span className="material-symbols-outlined">{isRecording ? 'stop' : 'fiber_manual_record'}</span>
                </button>
                {isRecording && (
                    <span className="record-timer">{formatTime(recordingTime)}</span>
                )}
            </div>

            <div className="tool-actions">
                <button className="btn-tool" onClick={onOpenGallery} title={t('studio.gallery')}>
                    <span className="material-symbols-outlined">library_music</span>
                    <span className="tool-label">{t('studio.gallery')}</span>
                </button>

                <button className="btn-tool" onClick={onToggleHelp} title={t('studio.help')}>
                    <span className="material-symbols-outlined">{showHelp ? 'close' : 'help_outline'}</span>
                    <span className="tool-label">{t('studio.help')}</span>
                </button>
            </div>
        </aside>
    );
};
