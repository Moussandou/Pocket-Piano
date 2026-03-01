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
    metronome: {
        isActive: boolean;
        toggle: () => void;
        bpm: number;
        setBpm: (bpm: number) => void;
    };
    displayMode: 'notes' | 'keys';
    onToggleDisplayMode: () => void;
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
    isRecording,
    recordingTime,
    onToggleRecord,
    onOpenGallery,
    showHelp,
    onToggleHelp,
    metronome,
    displayMode,
    onToggleDisplayMode,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="sidebar-right">
            <div className="tool-group">
                <div className="metronome-control">
                    <button
                        className={`btn-tool ${metronome.isActive ? 'active' : ''}`}
                        onClick={metronome.toggle}
                        title={t('studio.metronome')}
                    >
                        <span className="material-symbols-outlined">timer</span>
                    </button>
                    {metronome.isActive && (
                        <input
                            type="number"
                            className="bpm-input"
                            value={metronome.bpm}
                            onChange={(e) => metronome.setBpm(parseInt(e.target.value) || 120)}
                            min="30"
                            max="300"
                        />
                    )}
                </div>

                <div className="record-btn-wrapper">
                    <button
                        className={`btn-record-prominent ${isRecording ? 'is-recording' : ''}`}
                        onClick={onToggleRecord}
                        title={isRecording ? t('studio.stopRecording') : t('studio.startRecording')}
                    >
                        <span className="material-symbols-outlined">{isRecording ? 'stop' : 'fiber_manual_record'}</span>
                    </button>
                    {isRecording && (
                        <span className="record-timer">{formatTime(recordingTime)}</span>
                    )}
                </div>

                <button
                    className="btn-tool"
                    onClick={onOpenGallery}
                    title={t('studio.gallery')}
                >
                    <span className="material-symbols-outlined">library_music</span>
                </button>
            </div>

            <div className="tool-group bottom">
                <button
                    className={`btn-tool ${displayMode === 'notes' ? 'active' : ''}`}
                    onClick={onToggleDisplayMode}
                    title={t('studio.viewMode')}
                >
                    <span className="material-symbols-outlined">
                        {displayMode === 'notes' ? 'music_note' : 'keyboard'}
                    </span>
                </button>

                <button
                    className={`btn-tool ${showHelp ? 'active' : ''}`}
                    onClick={onToggleHelp}
                    title={t('studio.help')}
                >
                    <span className="material-symbols-outlined">{showHelp ? 'close' : 'help_outline'}</span>
                </button>
            </div>
        </aside>
    );
};
