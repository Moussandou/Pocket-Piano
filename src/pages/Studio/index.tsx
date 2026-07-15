import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { Piano } from '../../components/Piano/Piano';
import { audioEngine } from '../../engine/audio';
import { useRecorder } from '../../hooks/useRecorder';
import { useSettings } from '../../hooks/useSettings';
import { useMetronome } from '../../hooks/useMetronome';
import { useSheetFollow } from '../../hooks/useSheetFollow';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Piano as PianoIcon, Moon, Sun, X, Play, Square, RotateCcw, Pencil, FolderOpen, Check, FilePlus, FileText } from 'lucide-react';
import { StudioToolbar } from './StudioToolbar';
import { SoundSettings } from './SoundSettings';
import { Onboarding } from '../../components/Onboarding/Onboarding';
import { sheetRepository } from '../../infra/repositories/sheetRepository';
import { getLabelForNote } from '../../domain/constants';
import { formatDuration } from '../../utils/formatters';
import { tokenLabel } from '../../domain/sheetParser';
import { AuthManager } from '../../infra/AuthManager';
import { RecordingGallery } from '../../components/Gallery/RecordingGallery';
import { SaveRecordingModal } from '../../components/Modals/SaveRecordingModal';
import type { Sheet } from '../../domain/models';
import './Studio.css';

export const Studio: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isLoaded, setIsLoaded] = useState(false);
    const { settings, updateSetting, resetSettings } = useSettings();
    const { isRecording, startRecording, stopRecording, saveRecording, discardRecording, recordNote, exportAudio, hasAudio } = useRecorder();
    const metronome = useMetronome();
    const sheetFollow = useSheetFollow();
    const sheetFollowRef = useRef(sheetFollow);
    sheetFollowRef.current = sheetFollow;
    const deskTrackRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    const [showGallery, setShowGallery] = useState(false);
    const [showSheetPanel, setShowSheetPanel] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [savedSheets, setSavedSheets] = useState<Sheet[]>([]);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [onboardingRun, setOnboardingRun] = useState(0);
    const [typedHistory, setTypedHistory] = useState<string>('');
    const [deskEditMode, setDeskEditMode] = useState(false);
    const [sheetInput, setSheetInput] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [deskScrollOffset, setDeskScrollOffset] = useState(0);

    // Sync input text when sheetText changes externally
    useEffect(() => {
        setSheetInput(sheetFollow.sheetText);
        if (sheetFollow.sheetText) {
            setDeskEditMode(false);
        } else {
            setDeskEditMode(true);
        }
    }, [sheetFollow.sheetText]);

    // Subscribe to saved sheets
    useEffect(() => {
        if (!user) {
            setSavedSheets([]);
            return;
        }
        return sheetRepository.subscribeByUser(user.uid, setSavedSheets);
    }, [user]);

    // Load sheet handed off from the Library (via sessionStorage)
    useEffect(() => {
        const pending = sessionStorage.getItem('pocket-piano-load-sheet');
        if (pending) {
            sessionStorage.removeItem('pocket-piano-load-sheet');
            sheetFollowRef.current.loadSheet(pending);
            setShowSheetPanel(true);
        }
    }, []);

    // Sync settings with audio engine
    useEffect(() => {
        audioEngine.setVolume(settings.volume);
        audioEngine.setTranspose(settings.transpose);
        audioEngine.setSustain(settings.sustain);
        audioEngine.setReverb(settings.reverb);
        audioEngine.setDelay(settings.delay);
        audioEngine.setFeedback(settings.feedback);
    }, [settings]);

    // Auto-scroll the music stand sheet track to the active note (smooth transform-based slide)
    useLayoutEffect(() => {
        if (!deskTrackRef.current) return;
        
        const updateOffset = () => {
            const activeEl = deskTrackRef.current?.querySelector('.desk-sheet-token.active') as HTMLElement;
            if (activeEl && deskTrackRef.current) {
                const wrapperWidth = deskTrackRef.current.parentElement?.offsetWidth ?? deskTrackRef.current.offsetWidth;
                const targetOffset = activeEl.offsetLeft - (wrapperWidth / 2) + (activeEl.offsetWidth / 2);
                setDeskScrollOffset(targetOffset);
            } else {
                setDeskScrollOffset(0);
            }
        };

        updateOffset();
        window.addEventListener('resize', updateOffset);
        return () => window.removeEventListener('resize', updateOffset);
    }, [sheetFollow.cursor]);

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
            audioEngine.init(settings.currentInstrument).then(() => setIsLoaded(true));
        }

        if (type === 'press') {
            recordNote(note, velocity, 'DOWN');

            const label = getLabelForNote(note);
            if (label) {
                setTypedHistory(prev => {
                    const next = prev ? prev + ' ' + label : label;
                    return next.length > 50 ? next.slice(next.length - 50) : next;
                });

                if (sheetFollowRef.current.isActive) {
                    sheetFollowRef.current.validateKey(label);
                }
            }
        } else {
            recordNote(note, 0, 'UP');
        }
    }, [recordNote, isLoaded, settings.currentInstrument]);

    // Reload instrument when user switches (only if engine is already loaded)
    useEffect(() => {
        if (isLoaded) {
            audioEngine.loadInstrument(settings.currentInstrument);
        }
    }, [settings.currentInstrument, isLoaded]);

    const handleToggleRecord = useCallback(() => {
        if (isRecording) {
            stopRecording();
            setIsSaveModalOpen(true);
        } else {
            startRecording();
            setRecordingTime(0);
        }
    }, [isRecording, stopRecording, startRecording]);

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language.startsWith('fr') ? 'en' : 'fr');
    };

    // Visible keyboard range, centered on middle C
    const octaves = settings.octaves;
    const startOctave = 4 - Math.floor(octaves / 2);
    const endOctave = startOctave + octaves - 1;
    const whiteKeyCount = octaves * 7 + 1;

    return (
        <div className="studio">
            <header className="studio-topbar">
                <div className="topbar-brand">
                    <PianoIcon size={20} strokeWidth={1.75} />
                    <span>Pocket Piano</span>
                </div>

                <StudioToolbar
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    onToggleRecord={handleToggleRecord}
                    showGallery={showGallery}
                    onToggleGallery={() => setShowGallery(v => !v)}
                    showSheet={showSheetPanel}
                    onToggleSheet={() => setShowSheetPanel(v => !v)}
                    showSettings={showSettings}
                    onToggleSettings={() => setShowSettings(v => !v)}
                    onHelp={() => setOnboardingRun(n => n + 1)}
                    metronome={metronome}
                />

                <div className="topbar-actions">
                    <button
                        className="btn-icon-ghost"
                        onClick={() => updateSetting('darkMode', !settings.darkMode)}
                        title={t('common.toggleTheme')}
                    >
                        {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button className="btn-icon-ghost" onClick={toggleLanguage} title={t('common.toggleLanguage')}>
                        {i18n.language.startsWith('fr') ? 'EN' : 'FR'}
                    </button>
                    {user && (
                        <Link to="/library" className="topbar-link">{t('nav.library')}</Link>
                    )}
                    {user && (
                        <Link to="/account" className="topbar-link">{t('nav.account')}</Link>
                    )}
                    <AuthManager />
                </div>
            </header>

            <main className="studio-stage" />

            <section className="studio-piano" data-onboarding="piano">
                <div className="music-desk">
                    {/* Left control panel next to the paper sheet */}
                    {showSheetPanel && sheetFollow.tokens.length > 0 && !deskEditMode && (
                        <div className="music-desk-controls">
                            {!sheetFollow.isActive ? (
                                <button className="desk-control-btn play" onClick={sheetFollow.start} title={t('sheet.start')}>
                                    <Play size={15} fill="currentColor" />
                                </button>
                            ) : (
                                <button className="desk-control-btn stop" onClick={sheetFollow.stop} title={t('sheet.stop')}>
                                    <Square size={15} fill="currentColor" />
                                </button>
                            )}
                            <button className="desk-control-btn" onClick={sheetFollow.restart} title={t('sheet.restart')}>
                                <RotateCcw size={14} />
                            </button>
                            <button className="desk-control-btn" onClick={() => { setDeskEditMode(true); sheetFollow.stop(); }} title={t('sheet.edit')}>
                                <Pencil size={14} />
                            </button>
                            <button className="desk-control-btn danger" onClick={() => { sheetFollow.reset(); setDeskEditMode(true); }} title={t('sheet.newSheet')}>
                                <FilePlus size={14} />
                            </button>
                        </div>
                    )}

                    {/* Main content: Sheet paper or Editor */}
                    {showSheetPanel && deskEditMode ? (
                        /* Editor View */
                        <div className="music-desk-editor">
                            <textarea
                                className="music-desk-textarea"
                                placeholder={t('sheet.placeholder')}
                                value={sheetInput}
                                onChange={(e) => setSheetInput(e.target.value)}
                            />
                            <div className="music-desk-editor-footer">
                                <div className="editor-left-actions">
                                    <button
                                        className="desk-editor-btn-sm"
                                        onClick={() => setShowPicker(!showPicker)}
                                    >
                                        <FolderOpen size={13} />
                                        <span>{t('sheet.loadSaved')}</span>
                                    </button>
                                    
                                    {showPicker && (
                                        <div className="desk-sheet-picker custom-scrollbar">
                                            {savedSheets.length === 0 ? (
                                                <div className="picker-empty">{t('sheet.noSavedSheets')}</div>
                                            ) : (
                                                savedSheets.map(s => (
                                                    <button key={s.id} className="picker-item" onClick={() => {
                                                        sheetFollow.loadSheet(s.content);
                                                        setDeskEditMode(false);
                                                        setShowPicker(false);
                                                    }}>
                                                        <FileText size={12} />
                                                        <span>{s.name}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="editor-right-actions">
                                    <button
                                        className="desk-editor-btn-primary"
                                        onClick={() => {
                                            if (sheetInput.trim()) {
                                                sheetFollow.loadSheet(sheetInput.trim());
                                                setDeskEditMode(false);
                                            }
                                        }}
                                        disabled={!sheetInput.trim()}
                                    >
                                        <Check size={13} />
                                        <span>{t('sheet.load')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : showSheetPanel && sheetFollow.tokens.length > 0 ? (
                        /* Sheet Paper View */
                        <div className="music-sheet">
                            {sheetFollow.isComplete ? (
                                /* Results Screen */
                                <div className="desk-sheet-results">
                                    <span className="results-title">{t('sheet.results.title')}</span>
                                    <div className="results-metrics">
                                        <div className="metric">
                                            <span className="metric-label">{t('sheet.results.accuracy')}</span>
                                            <span className="metric-value">{sheetFollow.stats.accuracy}%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">{t('sheet.results.time')}</span>
                                            <span className="metric-value">{formatDuration(sheetFollow.stats.durationMs)}</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">{t('library.notes')}</span>
                                            <span className="metric-value">{sheetFollow.stats.correct}/{sheetFollow.stats.total}</span>
                                        </div>
                                    </div>
                                    <button className="results-replay-btn" onClick={sheetFollow.restart}>
                                        <RotateCcw size={13} />
                                        <span>{t('sheet.results.replay')}</span>
                                    </button>
                                </div>
                            ) : (
                                /* Playing Notes View */
                                <>
                                    {/* Staff Lines in the background */}
                                    <div className="music-staff-lines">
                                        <div className="music-staff-line" />
                                        <div className="music-staff-line" />
                                        <div className="music-staff-line" />
                                        <div className="music-staff-line" />
                                        <div className="music-staff-line" />
                                    </div>
                                    
                                    {/* Meta info at the top of the paper */}
                                    <div className="music-sheet-meta">
                                        <div className="meta-left">
                                            <span className="meta-badge">
                                                {t('library.notes')} : {sheetFollow.tokens.length - sheetFollow.results.filter(r => r !== 'pending').length} restantes
                                            </span>
                                            {sheetFollow.stats.wrong > 0 && (
                                                <span className="meta-badge error">
                                                    Erreurs : {sheetFollow.stats.wrong}
                                                </span>
                                            )}
                                        </div>
                                        <div className="meta-right">
                                            <span>Précision : {sheetFollow.stats.accuracy}%</span>
                                        </div>
                                    </div>

                                    {/* Notes track wrapped in sliding container */}
                                    <div className="music-desk-sheet-track-wrapper">
                                        <div 
                                            className="music-desk-sheet-track" 
                                            ref={deskTrackRef}
                                            style={{ transform: `translateX(-${deskScrollOffset}px)` }}
                                        >
                                            {sheetFollow.tokens.map((token, i) => (
                                                <DeskSheetTokenElement
                                                    key={i}
                                                    token={token}
                                                    index={i}
                                                    result={sheetFollow.results[i]}
                                                    isCurrent={i === sheetFollow.cursor}
                                                    isStartMarker={i === sheetFollow.startCursor}
                                                    onClick={() => {
                                                        if (!sheetFollow.isActive) sheetFollow.onSetStartPosition(i);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Progress bar at the bottom of the paper */}
                                    <div className="music-sheet-progress">
                                        <div 
                                            className="music-sheet-progress-fill" 
                                            style={{ 
                                                width: `${sheetFollow.tokens.length > 0 
                                                    ? Math.round((sheetFollow.results.filter(r => r !== 'pending').length / sheetFollow.tokens.length) * 100) 
                                                    : 0}%` 
                                            }} 
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Free Play View */
                        <div className="music-sheet">
                            <div className="music-staff-lines">
                                <div className="music-staff-line" />
                                <div className="music-staff-line" />
                                <div className="music-staff-line" />
                                <div className="music-staff-line" />
                                <div className="music-staff-line" />
                            </div>
                            <div className={`music-desk-history ${!typedHistory ? 'placeholder' : ''}`}>
                                {typedHistory || t('studio.typePlaceholder')}
                            </div>
                            {typedHistory && (
                                <button
                                    className="music-desk-clear-ink"
                                    onClick={() => setTypedHistory('')}
                                    title={t('common.cancel')}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="piano-stage">
                    <Piano
                        startOctave={startOctave}
                        endOctave={endOctave}
                        showLabels={settings.showKeyLabels}
                        whiteKeyCount={whiteKeyCount}
                        onNotePlayed={(note) => handleNoteEvent(note, 'press')}
                        onNoteReleased={(note) => handleNoteEvent(note, 'release')}
                    />
                </div>
            </section>

            <SoundSettings
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                settings={settings}
                updateSetting={updateSetting}
                resetSettings={resetSettings}
            />

            <Onboarding run={onboardingRun} />

            <SaveRecordingModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={(name) => { saveRecording(name); setIsSaveModalOpen(false); }}
                onDiscard={() => { discardRecording(); setIsSaveModalOpen(false); }}
                onExportAudio={hasAudio ? exportAudio : undefined}
            />

            {showGallery && (
                <div className="gallery-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowGallery(false); }}>
                    <div className="gallery-modal custom-scrollbar">
                        <button className="btn-close-gallery" onClick={() => setShowGallery(false)}>
                            <X size={18} />
                        </button>
                        <RecordingGallery />
                    </div>
                </div>
            )}
        </div>
    );
};

interface DeskSheetTokenElementProps {
    token: any;
    index: number;
    result: any;
    isCurrent: boolean;
    isStartMarker: boolean;
    onClick: () => void;
}

const DeskSheetTokenElement: React.FC<DeskSheetTokenElementProps> = ({
    token,
    index,
    result,
    isCurrent,
    isStartMarker,
    onClick,
}) => {
    const isPause = token.type === 'pause';
    const isChord = token.type === 'chord';

    const classes = [
        'desk-sheet-token',
        isPause ? 'pause' : '',
        isChord ? 'is-chord' : '',
        isCurrent ? 'active' : '',
        result === 'correct' ? 'correct' : '',
        result === 'wrong' ? 'wrong' : '',
        isStartMarker ? 'start-marker' : '',
    ].filter(Boolean).join(' ');

    if (isPause) {
        return (
            <button className={classes} onClick={onClick} data-index={index}>
                <span className="token-note-head">{tokenLabel(token)}</span>
                {isStartMarker && <span className="start-indicator" />}
            </button>
        );
    }

    if (isChord) {
        return (
            <button className={classes} onClick={onClick} data-index={index}>
                <div className="chord-keys-container">
                    {token.keys.map((k: string, idx: number) => {
                        const isKeyUpper = k === k.toUpperCase() && k !== k.toLowerCase();
                        return (
                            <span key={idx} className="chord-key-node">
                                {k}
                                {isKeyUpper && <span className="shift-badge-inner">⇧</span>}
                            </span>
                        );
                    })}
                </div>
                {isStartMarker && <span className="start-indicator" />}
            </button>
        );
    }

    // Normal note
    const isUppercase = token.key === token.key.toUpperCase() && token.key !== token.key.toLowerCase();

    return (
        <button className={classes} onClick={onClick} data-index={index}>
            <span className="token-note-head">
                {token.key}
                {isUppercase && <span className="shift-badge">⇧</span>}
            </span>
            {isStartMarker && <span className="start-indicator" />}
        </button>
    );
};
