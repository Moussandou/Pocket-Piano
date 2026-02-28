import React, { useState, useEffect, useCallback } from 'react';
import { Piano } from '../components/Piano/Piano';
import { audioEngine } from '../engine/audio';
import { useRecorder } from '../hooks/useRecorder';
import { useSettings } from '../hooks/useSettings';
import { useAnalytics } from '../hooks/useAnalytics';

import { RecordingGallery } from '../components/Gallery/RecordingGallery';

export const Studio: React.FC = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const { settings, updateSetting } = useSettings();
    const { isRecording, startRecording, stopRecording, recordNote } = useRecorder();
    const { trackNote } = useAnalytics();
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const [showGallery, setShowGallery] = useState(false);

    // Sync settings with audio engine
    useEffect(() => {
        audioEngine.setVolume(settings.volume);
        audioEngine.setTranspose(settings.transpose);
        audioEngine.setSustain(settings.sustain);
    }, [settings]);

    const handleNoteEvent = useCallback((note: string, type: 'press' | 'release', velocity: number = 0.8) => {
        if (!isLoaded && type === 'press') {
            audioEngine.init().then(() => setIsLoaded(true));
        }

        if (type === 'press') {
            setActiveKeys(prev => Array.from(new Set([...prev, note])));
            recordNote(note, velocity);
            trackNote(note, velocity);
        } else {
            setActiveKeys(prev => prev.filter(k => k !== note));
        }
    }, [recordNote, trackNote, isLoaded]);

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
                    {/* Mastery / Gain Section */}
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
                                <span className="slider-value">{Math.round(settings.sustain * 10)}%</span>
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
                                <div className="trans-val">
                                    {settings.transpose === 0 ? 'C3' :
                                        settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}
                                </div>
                                <button onClick={() => updateSetting('transpose', settings.transpose + 1)}>+</button>
                            </div>
                        </div>
                    </div>

                    <div className="control-divider"></div>
                    <div className="control-section">
                        <div className="slider-header" style={{ marginBottom: '1rem' }}>
                            <label className="slider-label">
                                <span className="material-symbols-outlined">palette</span>
                                Piano Accent
                            </label>
                            <span className="slider-value" style={{ textTransform: 'uppercase' }}>
                                {settings.pianoColor === '#0d59f2' ? 'Default' : 'Custom'}
                            </span>
                        </div>
                        <div className="color-presets-studio">
                            {['#0d59f2', '#ff4a4a', '#4aff4a', '#ff8c00', '#ff4aff'].map(color => (
                                <div
                                    key={color}
                                    className={`color-swatch ${settings.pianoColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateSetting('pianoColor', color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="control-divider"></div>

                    {/* Audio Profile Section */}
                    <div className="control-section">
                        <div className="slider-header" style={{ marginBottom: '0.5rem' }}>
                            <label className="slider-label">
                                <span className="material-symbols-outlined">waves</span>
                                Engine Profile
                            </label>
                        </div>
                        <div className="engine-status-row">
                            <div className="engine-label">WAVEFORM</div>
                            <div className="engine-value">GRAND PIANO</div>
                        </div>
                        <div className="engine-status-row">
                            <div className="engine-label">AUTH MODE</div>
                            <div className="engine-value">SECURE</div>
                        </div>
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
                        <span className="status-label">Engine Info</span>
                        <span className="status-value-med">v2.0 PRO</span>
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
