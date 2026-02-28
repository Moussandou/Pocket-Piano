
import React from 'react';
import { X, Sliders, Palette, Volume2, Waves } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSetting } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Paramètres du Piano</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="settings-grid">
                    <section className="setting-group">
                        <div className="setting-label">
                            <Volume2 size={18} />
                            <span>Volume Master</span>
                        </div>
                        <input
                            type="range"
                            min="-60"
                            max="0"
                            value={settings.volume}
                            onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                        />
                        <span className="value-display">{settings.volume} dB</span>
                    </section>

                    <section className="setting-group">
                        <div className="setting-label">
                            <Waves size={18} />
                            <span>Sustain / Résonance</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="10"
                            step="0.1"
                            value={settings.sustain}
                            onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))}
                        />
                        <span className="value-display">x{settings.sustain}</span>
                    </section>

                    <section className="setting-group">
                        <div className="setting-label">
                            <Sliders size={18} />
                            <span>Transposition</span>
                        </div>
                        <div className="transpose-controls">
                            <button onClick={() => updateSetting('transpose', settings.transpose - 1)}>-</button>
                            <div className="transpose-value">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}</div>
                            <button onClick={() => updateSetting('transpose', settings.transpose + 1)}>+</button>
                        </div>
                    </section>

                    <section className="setting-group">
                        <div className="setting-label">
                            <Palette size={18} />
                            <span>Couleur de l'Accent</span>
                        </div>
                        <div className="color-presets">
                            {['#4a9eff', '#ff4a4a', '#4aff4a', '#ff8c00', '#ff4aff'].map(color => (
                                <div
                                    key={color}
                                    className={`color-swatch ${settings.pianoColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateSetting('pianoColor', color)}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
