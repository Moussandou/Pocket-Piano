import React, { useState, useEffect, useCallback } from 'react';
import { Piano } from '../components/Piano/Piano';
import { audioEngine } from '../engine/audio';
import { useRecorder } from '../hooks/useRecorder';
import { useSettings } from '../hooks/useSettings';

import { RecordingGallery } from '../components/Gallery/RecordingGallery';

export const Studio: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { settings, updateSetting } = useSettings();
    const { isRecording, startRecording, stopRecording, recordNote } = useRecorder();
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [showGallery, setShowGallery] = useState(false);

    // Sync settings with audio engine
    useEffect(() => {
        audioEngine.setVolume(settings.volume);
        audioEngine.setTranspose(settings.transpose);
        audioEngine.setSustain(settings.sustain);
    }, [settings]);

    const handleNoteEvent = useCallback((note: string, type: 'press' | 'release') => {
        if (!isLoaded && type === 'press') {
            audioEngine.init().then(() => setIsLoaded(true));
        }

        if (type === 'press') {
            setActiveKeys(prev => Array.from(new Set([...prev, note])));
            recordNote(note);
        } else {
            setActiveKeys(prev => prev.filter(k => k !== note));
        }
    }, [recordNote, isLoaded]);

    return (
        <main className="app-main">
            {/* Left Sidebar: Studio Controls */}
            <aside className="sidebar-left">
                <div className="sidebar-header">
                    <div className="sidebar-title">
                        <h2>Studio Controls</h2>
                        <div className="pulse-dot"></div>
                    </div>
                    <p className="session-id">SESSION ID: 8X-992A</p>
                </div>

                <div className="sidebar-content custom-scrollbar">
                    <div className="control-section">
                        {/* Volume Slider */}
                        <div className="slider-group">
                            <div className="slider-header">
                                <label className="slider-label">
                                    <span className="material-symbols-outlined">volume_up</span>
                                    Master Gain
                                </label>
                                <span className="slider-value">{settings.volume} dB</span>
                            </div>
                            <div className="slider-wrapper">
                                <div className="slider-fill" style={{ width: `${((settings.volume + 60) / 60) * 100}%` }}></div>
                                <input className="stitch-slider" type="range" min="-60" max="0" value={settings.volume} onChange={(e) => updateSetting('volume', parseInt(e.target.value))} />
                            </div>
                        </div>

                        {/* Sustain Slider */}
                        <div className="slider-group">
                            <div className="slider-header">
                                <label className="slider-label">
                                    <span className="material-symbols-outlined">graphic_eq</span>
                                    Sustain
                                </label>
                                <span className="slider-value">{settings.sustain * 10}%</span>
                            </div>
                            <div className="slider-wrapper">
                                <div className="slider-fill" style={{ width: `${(settings.sustain / 10) * 100}%` }}></div>
                                <input className="stitch-slider" type="range" min="0.1" max="10" step="0.1" value={settings.sustain} onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))} />
                            </div>
                        </div>

                        {/* Transpose Controls */}
                        <div className="slider-group">
                            <div className="slider-header">
                                <label className="slider-label">
                                    <span className="material-symbols-outlined">music_note</span>
                                    Transpose
                                </label>
                                <span className="slider-value">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} st</span>
                            </div>
                            <div className="transpose-stitch">
                                <button onClick={() => updateSetting('transpose', settings.transpose - 1)}>-</button>
                                <div className="trans-val">C3</div>
                                <button onClick={() => updateSetting('transpose', settings.transpose + 1)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="control-divider"></div>

                    {/* Dummy Effects Section to match design */}
                    <div className="control-section" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                        <div className="slider-header" style={{ marginBottom: '1rem' }}>
                            <label className="slider-label"><span className="material-symbols-outlined">blur_on</span> Reverb</label>
                        </div>
                        {/* Placeholders */}
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '10px' }}>[ Coming Soon ]</div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="midi-status">
                        <div className="status-dot"></div>
                        <span>MIDI Input: {isLoaded ? 'Active' : 'Waiting...'}</span>
                    </div>
                </div>
            </aside>

            {/* Main Stage: Piano & Grid */}
            <div className="main-stage">
                <div className="stage-content bg-grid-pattern">
                    {/* Visuals overlay */}
                    <div className="stage-visualizer">
                        {/* Map active keys to visual bars */}
                        {activeKeys.slice(0, 10).map((_key, i) => (
                            <div key={i} className="vis-bar primary" style={{ height: `${20 + ((i * 37) % 80)}%` }}></div>
                        ))}
                        {!activeKeys.length && <div className="vis-bar" style={{ height: '30%' }}></div>}
                    </div>

                    <div className="stage-status-left">
                        <span className="status-label">Active Keys</span>
                        <span className="status-value-large">{activeKeys.length > 0 ? activeKeys.length : '0'}</span>
                    </div>

                    <div className="stage-status-right">
                        <span className="status-label">Waveform</span>
                        <span className="status-value-med">Grand Piano</span>
                    </div>
                </div>

                <div className="piano-stage">
                    <Piano onNotePlayed={(note) => handleNoteEvent(note, 'press')} onNoteReleased={(note) => handleNoteEvent(note, 'release')} />
                </div>
            </div>

            {/* Right Sidebar: Tools */}
            <aside className="sidebar-right">
                <div className="tool-group">
                    <button className="btn-tool" title="Metronome">
                        <span className="material-symbols-outlined">timer</span>
                    </button>
                    <button className={`btn-tool ${isRecording ? 'active-record' : ''}`} title="Record" onClick={isRecording ? () => stopRecording() : startRecording}>
                        <span className="material-symbols-outlined">fiber_manual_record</span>
                    </button>
                    <button className={`btn-tool ${showGallery ? 'active' : ''}`} title="Library" onClick={() => setShowGallery(!showGallery)}>
                        <span className="material-symbols-outlined">library_music</span>
                    </button>
                </div>

                <div className="tool-group bottom">
                    <button className="btn-tool" title="Help">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </aside>

            {/* Gallery Overlay */}
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
