import React, { useState, useEffect, useCallback } from 'react';
import { Piano } from '../../components/Piano/Piano';
import { audioEngine } from '../../engine/audio';
import { useRecorder } from '../../hooks/useRecorder';
import { useSettings } from '../../hooks/useSettings';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from 'react-i18next';
import { useComboSystem } from './useComboSystem';
import { StudioSidebar } from './StudioSidebar';

import { formatTime } from '../../utils/formatters';

import { RecordingGallery } from '../../components/Gallery/RecordingGallery';
import { SaveRecordingModal } from '../../components/Modals/SaveRecordingModal';
import { SessionRecap } from '../../components/Modals/SessionRecap';
import { KEYBOARD_MAP } from '../../domain/constants';

import './StudioSidebar.css';
import './StudioStage.css';
import './StudioToolbar.css';

export const Studio: React.FC = () => {
    const { t } = useTranslation();
    const [isLoaded, setIsLoaded] = useState(false);
    const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useSettings();
    const { isRecording, startRecording, stopRecording, saveRecording, discardRecording, recordNote } = useRecorder();
    const { trackNote } = useAnalytics();
    const { comboScore, multiplier, comboProgress, processNoteHit, resetCombo, maxSessionMultiplier } = useComboSystem();

    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [noteHistory, setNoteHistory] = useState<string[]>([]);
    const [showGallery, setShowGallery] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isRecapOpen, setIsRecapOpen] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [sessionStats, setSessionStats] = useState({
        totalNotes: 0,
        maxCombo: 1,
        score: 0,
        duration: 0,
        avgVelocity: 0.8
    });
    const [sessionStartTime, setSessionStartTime] = useState(0);
    const [currentSessionNotes, setCurrentSessionNotes] = useState(0);
    const [currentSessionVelocity, setCurrentSessionVelocity] = useState(0);

    const getDisplayNote = useCallback((note: string) => {
        if (settings.historyDisplayMode === 'keys') {
            const found = Object.entries(KEYBOARD_MAP).find((entry) => entry[1] === note);
            return found ? found[0] : note;
        }
        return note;
    }, [settings.historyDisplayMode]);

    // Sync settings with audio engine
    useEffect(() => {
        audioEngine.setVolume(settings.volume);
        audioEngine.setTranspose(settings.transpose);
        audioEngine.setSustain(settings.sustain);
        audioEngine.setReverb(settings.reverb);
        audioEngine.setDelay(settings.delay);
        audioEngine.setFeedback(settings.feedback);
    }, [settings]);

    // Recording timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleNoteEvent = useCallback((note: string, type: 'press' | 'release', velocity: number = 0.8) => {
        if (!isLoaded && type === 'press') {
            audioEngine.init().then(() => setIsLoaded(true));
        }

        if (type === 'press') {
            setActiveKeys(prev => Array.from(new Set([...prev, note])));
            setNoteHistory(prev => [note, ...prev].slice(0, 10));
            processNoteHit();
            setCurrentSessionNotes(prev => prev + 1);
            setCurrentSessionVelocity(prev => prev + velocity);
            recordNote(note, velocity, 'DOWN');
            trackNote(note, velocity);
        } else {
            setActiveKeys(prev => prev.filter(k => k !== note));
            recordNote(note, 0, 'UP');
        }
    }, [recordNote, trackNote, isLoaded, processNoteHit]);

    const handleToggleRecord = useCallback(() => {
        if (isRecording) {
            stopRecording();
            setIsSaveModalOpen(true);
            setSessionStats({
                totalNotes: currentSessionNotes,
                maxCombo: maxSessionMultiplier,
                score: comboScore,
                duration: Math.floor((Date.now() - sessionStartTime) / 1000),
                avgVelocity: currentSessionNotes > 0 ? currentSessionVelocity / currentSessionNotes : 0.8
            });
        } else {
            startRecording();
            setRecordingTime(0);
            setSessionStartTime(Date.now());
            setCurrentSessionNotes(0);
            setCurrentSessionVelocity(0);
            resetCombo();
        }
    }, [isRecording, stopRecording, startRecording, currentSessionNotes, maxSessionMultiplier, comboScore, sessionStartTime, currentSessionVelocity, resetCombo]);

    return (
        <main className="app-main">
            <StudioSidebar
                settings={settings}
                updateSetting={updateSetting}
                resetSettings={resetSettings}
                exportSettings={exportSettings}
                importSettings={importSettings}
                isLoaded={isLoaded}
            />

            {/* Main Stage */}
            <div className="main-stage">
                <div className="stage-content bg-grid-pattern">
                    <div className="stage-visualizer">
                        {activeKeys.slice(0, 10).map((_key, i) => (
                            <div key={i} className="vis-bar primary" style={{ height: `${20 + ((i * 37) % 80)}%` }}></div>
                        ))}
                        {!activeKeys.length && <div className="vis-bar" style={{ height: '30%' }}></div>}
                    </div>

                    <div className="stage-status-left">
                        <div className="status-block">
                            <span className="status-label">{t('studio.activeKeys')}</span>
                            <span className="status-value-large">{activeKeys.length > 0 ? activeKeys.length : '0'}</span>
                        </div>
                        <div className="status-block combo-block">
                            <span className="status-label">{t('studio.score')}</span>
                            <div className="combo-value-row">
                                <span className="status-value-med">{comboScore.toLocaleString()}</span>
                                {multiplier > 1 && <span className="multiplier-badge">x{multiplier}</span>}
                            </div>
                            <div className="combo-bar-container">
                                <div className="combo-bar-fill" style={{ width: `${comboProgress}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="stage-history">
                        <div className="status-label">{t('studio.history')}</div>
                        <div className="note-history-list">
                            {noteHistory.map((note, idx) => (
                                <span key={idx} className="note-history-item">{getDisplayNote(note)}</span>
                            ))}
                            {noteHistory.length === 0 && <span className="note-history-item">--</span>}
                        </div>
                    </div>
                </div>

                <div className="piano-stage">
                    <Piano onNotePlayed={(note) => handleNoteEvent(note, 'press')} onNoteReleased={(note) => handleNoteEvent(note, 'release')} />
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="sidebar-right">
                <div className="tool-group">
                    <button className="btn-tool" title={t('studio.metronome')}>
                        <span className="material-symbols-outlined">timer</span>
                    </button>

                    <div className="record-btn-wrapper">
                        <button
                            className={`btn-record-prominent ${isRecording ? 'is-recording' : ''}`}
                            title={isRecording ? t('studio.stopRecording') : t('studio.record')}
                            onClick={handleToggleRecord}
                        >
                            <span className="material-symbols-outlined">
                                {isRecording ? 'stop' : 'fiber_manual_record'}
                            </span>
                        </button>
                        {isRecording && (
                            <span className="record-timer">{formatTime(recordingTime)}</span>
                        )}
                    </div>

                    <button className={`btn-tool ${showGallery ? 'active' : ''}`} title={t('studio.library')} onClick={() => setShowGallery(!showGallery)}>
                        <span className="material-symbols-outlined">library_music</span>
                    </button>
                </div>

                <div className="tool-group bottom">
                    <button
                        className={`btn-tool ${settings.historyDisplayMode === 'notes' ? 'active' : ''}`}
                        title={t('studio.viewMode')}
                        onClick={() => updateSetting('historyDisplayMode', settings.historyDisplayMode === 'notes' ? 'keys' : 'notes')}
                    >
                        <span className="material-symbols-outlined">
                            {settings.historyDisplayMode === 'notes' ? 'music_note' : 'keyboard'}
                        </span>
                    </button>

                    <button className="btn-tool" title={t('studio.help')}>
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </aside>

            {/* Modals */}
            <SaveRecordingModal
                isOpen={isSaveModalOpen}
                onClose={() => { setIsSaveModalOpen(false); setIsRecapOpen(true); }}
                onSave={(name) => { saveRecording(name); setIsSaveModalOpen(false); setIsRecapOpen(true); }}
                onDiscard={() => { discardRecording(); setIsSaveModalOpen(false); setIsRecapOpen(true); }}
            />

            <SessionRecap
                isOpen={isRecapOpen}
                onClose={() => setIsRecapOpen(false)}
                stats={sessionStats}
            />

            {showGallery && (
                <div className="gallery-overlay">
                    <div className="gallery-modal custom-scrollbar">
                        <button className="btn-close-gallery" onClick={() => setShowGallery(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <RecordingGallery />
                    </div>
                </div>
            )}
        </main>
    );
};
