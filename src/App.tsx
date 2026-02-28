
import React, { useState, useEffect, useCallback } from 'react';
import { Piano } from './components/Piano/Piano';
import { audioEngine } from './engine/audio';
import { useRecorder } from './hooks/useRecorder';
import { useSettings } from './hooks/useSettings';
import { Play, Search, Edit3 } from 'lucide-react';
import { AuthManager } from './infra/AuthManager';
import { RecordingGallery } from './components/Gallery/RecordingGallery';
import { SettingsModal } from './components/Modals/SettingsModal';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const { settings } = useSettings();
  const { isRecording, recordings, startRecording, stopRecording, recordNote, playRecording } = useRecorder();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isStarted) {
      audioEngine.init().then(() => {
        setIsLoaded(true);
        audioEngine.setVolume(settings.volume);
        audioEngine.setTranspose(settings.transpose);
        audioEngine.setSustain(settings.sustain);
      });
    }
  }, [isStarted]);

  useEffect(() => {
    if (isLoaded) {
      audioEngine.setVolume(settings.volume);
      audioEngine.setTranspose(settings.transpose);
      audioEngine.setSustain(settings.sustain);
    }
  }, [settings, isLoaded]);

  const handleNoteEvent = useCallback((note: string, type: 'press' | 'release') => {
    if (type === 'press') {
      setActiveKeys(prev => Array.from(new Set([...prev, note])));
      recordNote(note);
    } else {
      setActiveKeys(prev => prev.filter(k => k !== note));
    }
  }, [recordNote]);

  if (!isStarted) {
    return (
      <div className="loader-overlay">
        <h1>Pocket Piano</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Prêt à jouer ?</p>
        <button className="primary" onClick={() => setIsStarted(true)}>
          <Play size={20} /> Commencer
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <AuthManager />
      {!isLoaded && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem' }}>Chargement des sons...</p>
        </div>
      )}

      <div className="hud-container">
        <div className="speaker-grille"></div>

        <div className="hud-center">
          <div className="hud-section left">
            <span className="hud-title">Select Song</span>
            <div style={{ position: 'relative', marginTop: '5px' }}>
              <input type="text" placeholder="Search music sheets..." style={{ background: '#111', border: '1px solid #333', borderRadius: '3px', padding: '2px 25px 2px 5px', fontSize: '0.7rem', color: '#fff', width: '180px' }} />
              <Search size={12} style={{ position: 'absolute', right: '8px', top: '6px', color: '#444' }} />
            </div>
          </div>
          <div className="hud-section">
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="hud-title">Just Play</span>
              <Edit3 size={14} style={{ color: '#666' }} />
            </div>
            <span className="hud-subtitle">Use your computer keyboard to play your chosen song</span>
          </div>
        </div>

        <div className="speaker-grille"></div>
      </div>

      <nav className="menu-bar">
        <div className={`menu-item ${isRecording ? 'active' : ''}`} onClick={isRecording ? () => stopRecording() : startRecording}>
          {isRecording ? 'Stop' : 'Record'}
        </div>
        <div className="menu-item" onClick={() => setIsSettingsOpen(true)}>Sound</div>
        <div className="menu-item" onClick={() => setIsSettingsOpen(true)}>Styles</div>
        <div className="menu-item">Key Assist</div>
        <div className="menu-item">Save</div>
        <div className="menu-item">More</div>
      </nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <div className="key-display">
        {activeKeys.length > 0 ? activeKeys.join(' • ') : '---'}
      </div>

      <main className="main-content">
        <div className="piano-view">
          <div className="piano-wrapper">
            <Piano
              onNotePlayed={(note) => handleNoteEvent(note, 'press')}
              onNoteReleased={(note) => handleNoteEvent(note, 'release')}
            />
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
