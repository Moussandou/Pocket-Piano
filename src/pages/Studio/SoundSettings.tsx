import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { UserSettings } from '../../hooks/useSettings';

interface SliderRowProps {
    label: string;
    value: number;
    display: string;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, display, min, max, step = 1, onChange }) => (
    <div className="setting-row">
        <div className="setting-row-header">
            <label>{label}</label>
            <span className="setting-value">{display}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
        />
    </div>
);

interface SoundSettingsProps {
    visible: boolean;
    onClose: () => void;
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    resetSettings: () => void;
}

const KEY_COLORS = ['#0d59f2', '#7c3aed', '#0d9488', '#e11d48', '#d97706'];

export const SoundSettings: React.FC<SoundSettingsProps> = ({
    visible,
    onClose,
    settings,
    updateSetting,
    resetSettings,
}) => {
    const { t } = useTranslation();

    if (!visible) return null;

    return (
        <aside className="sound-settings">
            <div className="sound-settings-header">
                <h2>{t('studio.soundSettings')}</h2>
                <button className="btn-icon-ghost" onClick={onClose} title={t('common.close')}>
                    <X size={16} />
                </button>
            </div>

            <div className="sound-settings-body custom-scrollbar">
                <section>
                    <h3>{t('studio.sound')}</h3>

                    <div className="setting-row">
                        <div className="setting-row-header">
                            <label>{t('studio.instrument')}</label>
                        </div>
                        <div className="segmented">
                            {[
                                { id: 'piano', label: t('studio.grandPiano') },
                                { id: 'marimba', label: t('studio.marimba') },
                            ].map(instr => (
                                <button
                                    key={instr.id}
                                    className={settings.currentInstrument === instr.id ? 'active' : ''}
                                    onClick={() => updateSetting('currentInstrument', instr.id)}
                                >
                                    {instr.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <SliderRow
                        label={t('studio.volume')}
                        value={settings.volume}
                        display={`${settings.volume} dB`}
                        min={-60}
                        max={0}
                        onChange={(v) => updateSetting('volume', v)}
                    />
                    <SliderRow
                        label={t('studio.sustain')}
                        value={settings.sustain}
                        display={`${Math.round(settings.sustain * 10)}%`}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onChange={(v) => updateSetting('sustain', v)}
                    />

                    <div className="setting-row">
                        <div className="setting-row-header">
                            <label>{t('studio.transpose')}</label>
                            <span className="setting-value">
                                {settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose} st
                            </span>
                        </div>
                        <div className="stepper">
                            <button onClick={() => updateSetting('transpose', Math.max(-12, settings.transpose - 1))}>−</button>
                            <span>{settings.transpose > 0 ? `+${settings.transpose}` : settings.transpose}</span>
                            <button onClick={() => updateSetting('transpose', Math.min(12, settings.transpose + 1))}>+</button>
                        </div>
                    </div>
                </section>

                <section>
                    <h3>{t('studio.effects')}</h3>
                    <SliderRow
                        label={t('studio.reverb')}
                        value={(settings.reverb || 0) * 100}
                        display={`${Math.round((settings.reverb || 0) * 100)}%`}
                        min={0}
                        max={100}
                        onChange={(v) => updateSetting('reverb', v / 100)}
                    />
                    <SliderRow
                        label={t('studio.delay')}
                        value={(settings.delay || 0) * 100}
                        display={`${Math.round((settings.delay || 0) * 100)}%`}
                        min={0}
                        max={100}
                        onChange={(v) => updateSetting('delay', v / 100)}
                    />
                    <SliderRow
                        label={t('studio.feedback')}
                        value={settings.feedback * 100}
                        display={`${Math.round(settings.feedback * 100)}%`}
                        min={0}
                        max={100}
                        onChange={(v) => updateSetting('feedback', v / 100)}
                    />
                </section>

                <section>
                    <h3>{t('studio.keyboard')}</h3>

                    <div className="setting-row">
                        <div className="setting-row-header">
                            <label>{t('studio.octaves')}</label>
                            <span className="setting-value">{settings.octaves}</span>
                        </div>
                        <div className="stepper">
                            <button onClick={() => updateSetting('octaves', Math.max(2, settings.octaves - 1))}>−</button>
                            <span>{settings.octaves}</span>
                            <button onClick={() => updateSetting('octaves', Math.min(6, settings.octaves + 1))}>+</button>
                        </div>
                    </div>

                    <div className="setting-row inline">
                        <label>{t('studio.keyLabels')}</label>
                        <button
                            className={`switch ${settings.showKeyLabels ? 'on' : ''}`}
                            onClick={() => updateSetting('showKeyLabels', !settings.showKeyLabels)}
                            role="switch"
                            aria-checked={settings.showKeyLabels}
                        >
                            <span className="switch-thumb" />
                        </button>
                    </div>

                    <div className="setting-row">
                        <div className="setting-row-header">
                            <label>{t('studio.keyColor')}</label>
                        </div>
                        <div className="color-row">
                            {KEY_COLORS.map(color => (
                                <button
                                    key={color}
                                    className={`color-swatch-round ${settings.pianoColor === color ? 'active' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateSetting('pianoColor', color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className="sound-settings-footer">
                <button
                    className="btn-ghost-danger"
                    onClick={() => {
                        if (window.confirm(t('studio.resetConfirm'))) resetSettings();
                    }}
                >
                    {t('studio.resetSettings')}
                </button>
            </div>
        </aside>
    );
};
