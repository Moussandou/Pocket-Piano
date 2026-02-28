
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Piano } from './components/Piano/Piano';
import { audioEngine } from './engine/audio';
import { useRecorder } from './hooks/useRecorder';
import { useSettings } from './hooks/useSettings';
import { Play, Volume2, Waves, Sliders, Palette } from 'lucide-react';
import { AuthManager } from './infra/AuthManager';
import { RecordingGallery } from './components/Gallery/RecordingGallery';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { settings, updateSetting } = useSettings();
  const { isRecording, recordings, startRecording, stopRecording, recordNote, playRecording } = useRecorder();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  // Dropdown states
  const [activeMenu, setActiveMenu] = useState<'sound' | 'styles' | null>(null);
  const menuRef = useRef<HTMLElement>(null);

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
      setActiveKeys(prev => Array.from(new Set([...prev, note])));
      recordNote(note);
    } else {
      setActiveKeys(prev => prev.filter(k => k !== note));
    }
  }, [recordNote, isLoaded]);

  return (
    <div className="app-container">
      <AuthManager />

      <div className="hud-container">
        <div className="speaker-grille"></div>
        <div className="hud-center" style={{ justifyContent: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', letterSpacing: '2px', fontWeight: 300 }}>POCKET PIANO</h1>
        </div>
        <div className="speaker-grille"></div>
      </div>

      <nav className="menu-bar" ref={menuRef}>
        <div className={`menu-item ${isRecording ? 'active' : ''}`} onClick={isRecording ? () => stopRecording() : startRecording}>
          {isRecording ? 'Stop' : 'Record'}
        </div>

        <div className="menu-item" onClick={() => setActiveMenu(activeMenu === 'sound' ? null : 'sound')}>
          Sound
          {activeMenu === 'sound' && (
            <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
              <div className="setting-group">
                <div className="setting-label"><Volume2 size={16} /> Volume</div>
                <input type="range" min="-60" max="0" value={settings.volume} onChange={(e) => updateSetting('volume', parseInt(e.target.value))} />
                <span className="value-display">{settings.volume} dB</span>
              </div>
              <div className="setting-group">
                <div className="setting-label"><Waves size={16} /> Sustain</div>
                <input type="range" min="0.1" max="10" step="0.1" value={settings.sustain} onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))} />
                <span className="value-display">x{settings.sustain}</span>
              </div>
              <div className="setting-group">
                <div className="setting-label"><Sliders size={16} /> Transpose</div>
                <div className="transpose-controls">
                  <button onClick={() => updateSetting('transpose', settings.transpose - 1)}>-</button>
                  <div className="transpose-value">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}</div>
                  <button onClick={() => updateSetting('transpose', settings.transpose + 1)}>+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="menu-item" onClick={() => setActiveMenu(activeMenu === 'styles' ? null : 'styles')}>
          Styles
          {activeMenu === 'styles' && (
            <div className="dropdown-menu" onClick={e => e.stopPropagation()}>
              <div className="setting-group">
                <div className="setting-label"><Palette size={16} /> Accent Color</div>
                <div className="color-presets">
                  {['#4a9eff', '#ff4a4a', '#4aff4a', '#ff8c00', '#ff4aff'].map(color => (
                    <div key={color} className={`color-swatch ${settings.pianoColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => updateSetting('pianoColor', color)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="menu-item">Key Assist</div>
        <div className="menu-item">Save</div>
        <div className="menu-item">More</div>
      </nav>

      <div className="key-display" style={{ minHeight: '30px' }}>
        {!isLoaded ? "Appuyez sur une touche pour commencer" : (activeKeys.length > 0 ? activeKeys.join(' • ') : '---')}
      </div>

      <main className="main-content">
        <div className="piano-view">
          <div className="piano-wrapper">
            <Piano onNotePlayed={(note) => handleNoteEvent(note, 'press')} onNoteReleased={(note) => handleNoteEvent(note, 'release')} />
          </div>
        </div>

        {recordings.length > 0 && (
          <aside className="recordings-panel">
            <div className="recordings-list">
              {recordings.map(rec => (
                <div key={rec.uuid} className="recording-item">
                  <span className="recording-name">{rec.name}</span>
                  <button onClick={() => playRecording(rec)}><Play size={12} /></button>
                </div>
              ))}
            </div>
          </aside>
        )}
      </main>

      <section className="gallery-section">
        <RecordingGallery />
      </section>
    </div>
  );
};

export default App;
