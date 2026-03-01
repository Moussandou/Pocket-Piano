import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserSettings } from '../../hooks/useSettings';

interface ProfileSettingsProps {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    exportSettings: () => void;
    onImportClick: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
    settings,
    updateSetting,
    exportSettings,
    onImportClick,
}) => {
    const { t } = useTranslation();

    return (
        <div className="panel-left">
            {/* Audio Preferences */}
            <div className="tech-preferences-box">
                <div className="box-header">
                    <h3 className="box-title">{t('profile.settings.audio.title')}</h3>
                    <span className="material-symbols-outlined">tune</span>
                </div>
                <div className="box-content space-y-wide">
                    {/* Volume */}
                    <div className="setting-group">
                        <div className="setting-label-row">
                            <label>{t('profile.settings.audio.volume')}</label>
                            <span>{settings.volume} {t('common.units.db')}</span>
                        </div>
                        <input
                            type="range" min="-60" max="0"
                            value={settings.volume}
                            onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                            className="profile-slider"
                        />
                        <div className="slider-labels">
                            <span>{t('profile.settings.audio.silence')}</span>
                            <span>{t('profile.settings.audio.peak')}</span>
                        </div>
                    </div>

                    {/* Reverb */}
                    <div className="setting-group">
                        <div className="setting-label-row">
                            <label>REVERB / SPACE</label>
                            <span>{Math.round(settings.reverb * 100)}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={settings.reverb * 100}
                            onChange={(e) => updateSetting('reverb', parseInt(e.target.value) / 100)}
                            className="profile-slider"
                        />
                    </div>

                    {/* Delay + Feedback grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="setting-group">
                            <div className="setting-label-row">
                                <label>DELAY</label>
                                <span>{Math.round(settings.delay * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={settings.delay * 100}
                                onChange={(e) => updateSetting('delay', parseInt(e.target.value) / 100)}
                                className="profile-slider"
                            />
                        </div>
                        <div className="setting-group">
                            <div className="setting-label-row">
                                <label>FEEDBACK</label>
                                <span>{Math.round(settings.feedback * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={settings.feedback * 100}
                                onChange={(e) => updateSetting('feedback', parseInt(e.target.value) / 100)}
                                className="profile-slider"
                            />
                        </div>
                    </div>

                    {/* Transpose */}
                    <div className="setting-group">
                        <div className="setting-label-row">
                            <label>{t('profile.settings.audio.transpose')}</label>
                            <span>{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} {t('common.units.st')}</span>
                        </div>
                        <div className="toggle-group-3">
                            <button
                                className={`btn-toggle ${settings.transpose === -12 ? 'active' : ''}`}
                                onClick={() => updateSetting('transpose', -12)}
                            >{t('profile.settings.audio.octMinus')}</button>
                            <button
                                className={`btn-toggle ${settings.transpose === 0 ? 'active' : ''}`}
                                onClick={() => updateSetting('transpose', 0)}
                            >{t('profile.settings.audio.transposeReset')}</button>
                            <button
                                className={`btn-toggle ${settings.transpose === 12 ? 'active' : ''}`}
                                onClick={() => updateSetting('transpose', 12)}
                            >{t('profile.settings.audio.octPlus')}</button>
                        </div>
                    </div>

                    {/* Sustain + Export/Import */}
                    <div className="setting-group pt-2">
                        <div className="switch-row">
                            <span className="switch-label">{t('profile.settings.audio.autoSustain')}</span>
                            <div
                                className={`switch-track ${settings.sustain > 0 ? 'active' : ''}`}
                                onClick={() => updateSetting('sustain', settings.sustain > 0 ? 0 : 1)}
                            >
                                <div className="switch-thumb"></div>
                            </div>
                        </div>
                        <div className="switch-row">
                            <span className="switch-label">DATA EXPORT / IMPORT</span>
                            <div className="flex gap-2">
                                <button className="btn-mini" onClick={exportSettings}>
                                    <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                                <button className="btn-mini" onClick={onImportClick}>
                                    <span className="material-symbols-outlined text-sm">upload</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MIDI Mapping */}
            <div className="tech-preferences-box">
                <div className="box-header">
                    <h3 className="box-title">{t('profile.settings.midi.title')}</h3>
                    <span className="material-symbols-outlined">cable</span>
                </div>
                <div className="box-content space-y-loose">
                    <div className="dropdown-row">
                        <div className="dropdown-info">
                            <span className="dropdown-label">{t('profile.settings.midi.channel')}</span>
                            <span className="dropdown-val">{t('profile.settings.midi.omni')}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray">arrow_drop_down</span>
                    </div>
                    <div className="dropdown-row">
                        <div className="dropdown-info">
                            <span className="dropdown-label">{t('profile.settings.midi.velocityCurve')}</span>
                            <span className="dropdown-val">{t('profile.settings.midi.linearHard')}</span>
                        </div>
                        <span className="material-symbols-outlined text-gray">arrow_drop_down</span>
                    </div>
                    <div className="dropdown-row no-border">
                        <div className="dropdown-info">
                            <span className="dropdown-label">{t('profile.settings.midi.localControl')}</span>
                            <span className="dropdown-val">{t('profile.settings.midi.off')}</span>
                        </div>
                        <div className="checkbox-empty"></div>
                    </div>
                </div>
            </div>

            {/* Hardware List */}
            <div className="hardware-list-section">
                <h3 className="hardware-title">{t('profile.settings.hardware.title')}</h3>
                <div className="hardware-items">
                    <div className="hardware-item active">
                        <div className="hard-icon"><span className="material-symbols-outlined">piano</span></div>
                        <div className="hard-info">
                            <p className="hard-name">Roland FP-90</p>
                            <p className="hard-detail">USB-MIDI • CH 1</p>
                        </div>
                        <div className="status-dot-green"></div>
                    </div>
                    <div className="hardware-item inactive">
                        <div className="hard-icon"><span className="material-symbols-outlined">speaker</span></div>
                        <div className="hard-info">
                            <p className="hard-name">Focusrite 2i2</p>
                            <p className="hard-detail">ASIO • 48kHz</p>
                        </div>
                        <div className="status-dot-gray"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
