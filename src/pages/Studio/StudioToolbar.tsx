import React from 'react';
import { useTranslation } from 'react-i18next';
import { Timer, Circle, Square, ListMusic, Music, SlidersHorizontal, HelpCircle } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

interface StudioToolbarProps {
    isRecording: boolean;
    recordingTime: number;
    onToggleRecord: () => void;
    showGallery: boolean;
    onToggleGallery: () => void;
    showSheet: boolean;
    onToggleSheet: () => void;
    showSettings: boolean;
    onToggleSettings: () => void;
    onHelp: () => void;
    metronome: {
        isActive: boolean;
        toggle: () => void;
        bpm: number;
        setBpm: (bpm: number) => void;
    };
}

export const StudioToolbar: React.FC<StudioToolbarProps> = ({
    isRecording,
    recordingTime,
    onToggleRecord,
    showGallery,
    onToggleGallery,
    showSheet,
    onToggleSheet,
    showSettings,
    onToggleSettings,
    onHelp,
    metronome,
}) => {
    const { t } = useTranslation();

    return (
        <div className="studio-toolbar">
            <button
                className={`tool-btn record ${isRecording ? 'is-recording' : ''}`}
                onClick={onToggleRecord}
                title={isRecording ? t('studio.stopRecording') : t('studio.record')}
                data-onboarding="record"
            >
                {isRecording ? <Square size={15} fill="currentColor" /> : <Circle size={15} fill="currentColor" />}
                <span>{isRecording ? formatTime(recordingTime) : t('studio.record')}</span>
            </button>

            <div className={`metronome-group ${metronome.isActive ? 'active' : ''}`}>
                <button
                    className={`tool-btn ${metronome.isActive ? 'active' : ''}`}
                    onClick={metronome.toggle}
                    title={t('studio.metronome')}
                >
                    <Timer size={15} />
                    <span>{t('studio.metronome')}</span>
                </button>
                {metronome.isActive && (
                    <input
                        type="number"
                        className="bpm-input"
                        value={metronome.bpm}
                        onChange={(e) => metronome.setBpm(parseInt(e.target.value) || 120)}
                        min="30"
                        max="300"
                        title={t('studio.bpm')}
                    />
                )}
            </div>

            <button
                className={`tool-btn ${showSheet ? 'active' : ''}`}
                onClick={onToggleSheet}
                title={t('sheet.title')}
                data-onboarding="sheet"
            >
                <Music size={15} />
                <span>{t('sheet.title')}</span>
            </button>

            <button
                className={`tool-btn ${showGallery ? 'active' : ''}`}
                onClick={onToggleGallery}
                title={t('studio.recordings')}
            >
                <ListMusic size={15} />
                <span>{t('studio.recordings')}</span>
            </button>

            <div className="toolbar-divider" />

            <button
                className={`tool-btn icon-only ${showSettings ? 'active' : ''}`}
                onClick={onToggleSettings}
                title={t('studio.soundSettings')}
            >
                <SlidersHorizontal size={15} />
            </button>

            <button className="tool-btn icon-only" onClick={onHelp} title={t('studio.help')}>
                <HelpCircle size={15} />
            </button>
        </div>
    );
};
