import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '../../hooks/useSettings';

interface StudioSidebarProps {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    resetSettings: () => void;
    exportSettings: () => void;
    importSettings: (file: File) => void;
    isLoaded: boolean;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    isLoaded,
}) => {
    const { t } = useTranslation();

    return (
        <aside className="sidebar-left">
            <div className="sidebar-header">
                <div className="sidebar-title">
                    <h2>{t('studio.controls')}</h2>
                    <div className="pulse-dot"></div>
                </div>
            </div>

            <div className="sidebar-content custom-scrollbar">
                {/* Mastery / Gain Section */}
                <div className="control-section">
                    {/* Volume */}
                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">volume_up</span>
                                {t('studio.masterGain')}
                            </label>
                            <span className="slider-value">{settings.volume} {t('common.units.db')}</span>
                        </div>
                        <div className="slider-wrapper">
                            <div className="slider-fill" style={{ width: `${((settings.volume + 60) / 60) * 100}%` }}></div>
                            <input className="stitch-slider" type="range" min="-60" max="0" value={settings.volume} onChange={(e) => updateSetting('volume', parseInt(e.target.value))} />
                        </div>
                    </div>

                    {/* Sustain */}
                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">graphic_eq</span>
                                {t('studio.sustain')}
                            </label>
                            <span className="slider-value">{Math.round(settings.sustain * 10)}{t('common.units.percent')}</span>
                        </div>
                        <div className="slider-wrapper">
                            <div className="slider-fill" style={{ width: `${(settings.sustain / 10) * 100}%` }}></div>
                            <input className="stitch-slider" type="range" min="0.1" max="10" step="0.1" value={settings.sustain} onChange={(e) => updateSetting('sustain', parseFloat(e.target.value))} />
                        </div>
                    </div>

                    {/* Transpose */}
                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">music_note</span>
                                {t('studio.transpose')}
                            </label>
                            <span className="slider-value">{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} {t('common.units.st')}</span>
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

                {/* Instrument Selection */}
                <div className="control-section">
                    <div className="slider-header" style={{ marginBottom: '1rem' }}>
                        <label className="slider-label">
                            <span className="material-symbols-outlined">piano</span>
                            {t('studio.instrument')}
                        </label>
                        <span className="slider-value" style={{ textTransform: 'uppercase' }}>
                            {settings.currentInstrument}
                        </span>
                    </div>
                    <div className="instrument-selector">
                        {[
                            { id: 'piano', label: 'Grand Piano', icon: 'piano' },
                            { id: 'marimba', label: 'Casio Marimba', icon: 'music_note' }
                        ].map(instr => (
                            <button
                                key={instr.id}
                                className={`btn-instrument ${settings.currentInstrument === instr.id ? 'active' : ''}`}
                                onClick={() => updateSetting('currentInstrument', instr.id)}
                            >
                                <span className="material-symbols-outlined">{instr.icon}</span>
                                <span>{instr.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-divider"></div>

                {/* Audio FX */}
                <div className="control-section">
                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">blur_on</span>
                                {t('studio.reverb')}
                            </label>
                            <span className="slider-value">{Math.round(settings.reverb * 100)}{t('common.units.percent')}</span>
                        </div>
                        <div className="slider-wrapper">
                            <div className="slider-fill" style={{ width: `${settings.reverb * 100}%` }}></div>
                            <input className="stitch-slider" type="range" min="0" max="100" value={settings.reverb * 100} onChange={(e) => updateSetting('reverb', parseInt(e.target.value) / 100)} />
                        </div>
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">schedule</span>
                                {t('studio.delay')}
                            </label>
                            <span className="slider-value">{Math.round(settings.delay * 100)}{t('common.units.percent')}</span>
                        </div>
                        <div className="slider-wrapper">
                            <div className="slider-fill" style={{ width: `${settings.delay * 100}%` }}></div>
                            <input className="stitch-slider" type="range" min="0" max="100" value={settings.delay * 100} onChange={(e) => updateSetting('delay', parseInt(e.target.value) / 100)} />
                        </div>
                    </div>

                    <div className="slider-group">
                        <div className="slider-header">
                            <label className="slider-label">
                                <span className="material-symbols-outlined">laps</span>
                                {t('studio.feedback')}
                            </label>
                            <span className="slider-value">{Math.round(settings.feedback * 100)}{t('common.units.percent')}</span>
                        </div>
                        <div className="slider-wrapper">
                            <div className="slider-fill" style={{ width: `${settings.feedback * 100}%` }}></div>
                            <input className="stitch-slider" type="range" min="0" max="100" value={settings.feedback * 100} onChange={(e) => updateSetting('feedback', parseInt(e.target.value) / 100)} />
                        </div>
                    </div>
                </div>

                <div className="control-divider"></div>

                {/* Color presets */}
                <div className="control-section">
                    <div className="slider-header" style={{ marginBottom: '1rem' }}>
                        <label className="slider-label">
                            <span className="material-symbols-outlined">palette</span>
                            {t('studio.pianoAccent')}
                        </label>
                        <span className="slider-value" style={{ textTransform: 'uppercase' }}>
                            {settings.pianoColor === '#0d59f2' ? t('studio.default') : t('studio.custom')}
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
            </div>

            <div className="sidebar-footer">
                <div className="midi-status">
                    <div className="status-dot"></div>
                    <span>{t('studio.midiInput')} {isLoaded ? t('studio.active') : t('studio.waiting')}</span>
                </div>

                <div className="control-divider"></div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-studio-action" onClick={exportSettings}>
                        <span className="material-symbols-outlined">download</span>
                        Export
                    </button>
                    <button className="btn-studio-action" onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) importSettings(file);
                        };
                        input.click();
                    }}>
                        <span className="material-symbols-outlined">upload</span>
                        Import
                    </button>
                </div>

                <button
                    className="btn-reset-studio"
                    onClick={() => {
                        if (window.confirm(t('studio.resetConfirm'))) {
                            resetSettings();
                        }
                    }}
                >
                    <span className="material-symbols-outlined">restart_alt</span>
                    {t('studio.resetSettings')}
                </button>
            </div>
        </aside>
    );
};
