import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Piano } from './components/Piano/Piano';
import { audioEngine } from './engine/audio';
import { useRecorder } from './hooks/useRecorder';
import { useSettings } from './hooks/useSettings';
import { Volume2, Waves, Sliders, Palette, Settings, Music } from 'lucide-react';
import { AuthManager } from './infra/AuthManager';
import { RecordingGallery } from './components/Gallery/RecordingGallery';
import PianoVisualizer from './components/View/PianoVisualizer';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { settings, updateSetting } = useSettings();
  const { isRecording, startRecording, stopRecording, recordNote } = useRecorder();
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastVelocity, setLastVelocity] = useState(0.8);
  const [showGallery, setShowGallery] = useState(false);

  // Dropdown states
  const [activeMenu, setActiveMenu] = useState<'sound' | 'styles' | 'settings' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(note);
        return next;
      });
      setLastVelocity(0.7 + Math.random() * 0.3);
      recordNote(note);
    } else {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  }, [recordNote, isLoaded]);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <Music size={20} />
            POCKET PIANO
          </div>
          <span className="version-tag">v0.8.4</span>
        </div>

        <div className="header-center" ref={menuRef}>
          <div className="nav-link" onClick={() => setActiveMenu(activeMenu === 'sound' ? null : 'sound')}>
            Sound
            {activeMenu === 'sound' && (
              <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                <div className="setting-group">
                  <div className="setting-label"><Volume2 size={16} /> Volume</div>
                  <input type="range" min="-60" max="0" value={settings.volume} onChange={(e) => updateSetting('volume', parseInt(e.target.value))} />
                </div>
                <div className="setting-group">
                  <div className="setting-label"><Waves size={16} /> Sustain</div>
                  <input type="range" min="0.1" max="10" step="0.1" value={settings.sustain} onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))} />
                </div>
                <div className="setting-group">
                  <div className="setting-label"><Sliders size={16} /> Transpose</div>
                  <div className="transpose-controls">
                    <button onClick={() => updateSetting('transpose', settings.transpose - 1)}>-</button>
                    <span className="transpose-value">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}</span>
                    <button onClick={() => updateSetting('transpose', settings.transpose + 1)}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nav-link" onClick={() => setActiveMenu(activeMenu === 'styles' ? null : 'styles')}>
            Styles
            {activeMenu === 'styles' && (
              <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
                <div className="setting-group">
                  <div className="setting-label"><Palette size={16} /> Accent Color</div>
                  <div className="color-presets" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                      <div
                        key={color}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', background: color, cursor: 'pointer', border: settings.pianoColor === color ? '2px solid #000' : 'none' }}
                        onClick={() => updateSetting('pianoColor', color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nav-link" onClick={() => setShowGallery(!showGallery)}>
            Cloud
          </div>

          <div className="nav-link" onClick={() => (isRecording ? stopRecording() : startRecording())}>
            {isRecording ? 'Stop Rec' : 'Record'}
          </div>
        </div>

        <div className="header-right">
          <button className="btn-midi">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            CONNECT MIDI
          </button>

          <button className="btn-icon">
            <Settings size={18} />
          </button>

          <AuthManager />
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="display-area">
        <PianoVisualizer activeNotes={activeKeys} lastVelocity={lastVelocity} />
      </main>

      {/* PIANO SECTION */}
      <section className="piano-section">
        <Piano
          onNotePlayed={(note) => handleNoteEvent(note, 'press')}
          onNoteReleased={(note) => handleNoteEvent(note, 'release')}
        />
      </section>

      {/* OVERLAYS */}
      {showGallery && (
        <div className="gallery-overlay" style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 200, overflowY: 'auto' }}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #eee' }}>
            <button onClick={() => setShowGallery(false)}>Back to Piano</button>
          </div>
          <RecordingGallery />
        </div>
      )}

      {/* Initial load prompt */}
      {!isLoaded && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: '30px', pointerEvents: 'none', zIndex: 100, fontWeight: 600 }}>
          Press any key to start playing
        </div>
      )}

      {/* Bottom info bar */}
      <div style={{ position: 'absolute', bottom: '12px', right: '24px', fontSize: '0.7rem', color: '#a1a1aa', pointerEvents: 'none', fontWeight: 600, letterSpacing: '0.5px' }}>
        {isRecording && <span style={{ color: '#ef4444', marginRight: '12px' }}>● RECORDING</span>}
        {activeKeys.size} ACTIVE NOTES
      </div>
    </div>
  );
};

export default App;
