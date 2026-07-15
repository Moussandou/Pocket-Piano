import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, auth } from '../infra/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface UserSettings {
    pianoColor: string;
    volume: number;
    sustain: number;
    transpose: number;
    reverb: number;
    delay: number;
    feedback: number;
    darkMode: boolean;
    metronomeBpm: number;
    metronomeVolume: number;
    currentInstrument: string;
    octaves: number;
    showKeyLabels: boolean;
}

const safeNum = (val: unknown, fallback: number): number =>
    typeof val === 'number' && Number.isFinite(val) ? val : fallback;

const DEFAULT_SETTINGS: UserSettings = {
    pianoColor: '#0d59f2',
    volume: -6,
    sustain: 0,
    transpose: 0,
    reverb: 0.3,
    delay: 0,
    feedback: 0,
    darkMode: false,
    metronomeBpm: 120,
    metronomeVolume: -6,
    currentInstrument: 'piano',
    octaves: 6,
    showKeyLabels: true,
};

const sanitizeSettings = (s: any): UserSettings => {
    const merged = { ...DEFAULT_SETTINGS, ...s };
    return {
        pianoColor: typeof merged.pianoColor === 'string' ? merged.pianoColor : DEFAULT_SETTINGS.pianoColor,
        volume: safeNum(merged.volume, DEFAULT_SETTINGS.volume),
        sustain: safeNum(merged.sustain, DEFAULT_SETTINGS.sustain),
        transpose: safeNum(merged.transpose, DEFAULT_SETTINGS.transpose),
        reverb: safeNum(merged.reverb, DEFAULT_SETTINGS.reverb),
        delay: safeNum(merged.delay, DEFAULT_SETTINGS.delay),
        feedback: safeNum(merged.feedback, DEFAULT_SETTINGS.feedback),
        darkMode: !!merged.darkMode,
        metronomeBpm: safeNum(merged.metronomeBpm, DEFAULT_SETTINGS.metronomeBpm),
        metronomeVolume: safeNum(merged.metronomeVolume, DEFAULT_SETTINGS.metronomeVolume),
        currentInstrument: typeof merged.currentInstrument === 'string' ? merged.currentInstrument : DEFAULT_SETTINGS.currentInstrument,
        octaves: Math.min(6, Math.max(2, safeNum(merged.octaves, DEFAULT_SETTINGS.octaves))),
        showKeyLabels: merged.showKeyLabels !== false,
    };
};

interface SettingsContextValue {
    settings: UserSettings;
    updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<UserSettings>(() => {
        const saved = localStorage.getItem('piano_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Upgrade previous default of 4 octaves to 6 octaves to ensure all playable keys are visible
                if (parsed && parsed.octaves === 4) {
                    parsed.octaves = 6;
                }
                return sanitizeSettings(parsed);
            } catch {
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('piano_settings', JSON.stringify(settings));
        document.documentElement.style.setProperty('--accent', settings.pianoColor);
        document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light';

        if (auth.currentUser) {
            setDoc(doc(db, 'userSettings', auth.currentUser.uid), settings, { merge: true });
        }
    }, [settings]);

    // Instrument loading is deferred to the first user interaction
    // (audioEngine.playNote handles lazy init). We only store the name here.

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docSnap = await getDoc(doc(db, 'userSettings', user.uid));
                if (docSnap.exists()) {
                    setSettings(sanitizeSettings(docSnap.data()));
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const updateSetting = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextValue => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
    return ctx;
};
