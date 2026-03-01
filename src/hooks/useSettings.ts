
import { useState, useEffect } from 'react';
import { db, auth } from '../infra/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export interface UserSettings {
    pianoColor: string;
    volume: number;
    sustain: number;
    transpose: number;
    historyDisplayMode: 'notes' | 'keys';
    reverb: number; // 0 to 1
    delay: number; // 0 to 1
    feedback: number; // 0 to 1
}

const DEFAULT_SETTINGS: UserSettings = {
    pianoColor: '#4a9eff',
    volume: -6,
    sustain: 0,
    transpose: 0,
    historyDisplayMode: 'keys',
    reverb: 0.3,
    delay: 0,
    feedback: 0,
};

export const useSettings = () => {
    const [settings, setSettings] = useState<UserSettings>(() => {
        const saved = localStorage.getItem('piano_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('piano_settings', JSON.stringify(settings));
        document.documentElement.style.setProperty('--accent-color', settings.pianoColor);

        // Sync to Firestore if logged in
        if (auth.currentUser) {
            setDoc(doc(db, 'userSettings', auth.currentUser.uid), settings, { merge: true });
        }
    }, [settings]);

    // Load from Firestore on mount/auth change
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, 'userSettings', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as UserSettings);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const exportSettings = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "pocket_piano_settings.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importSettings = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                setSettings(json);
            } catch (err) {
                console.error("Failed to import settings", err);
            }
        };
        reader.readAsText(file);
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return { settings, updateSetting, resetSettings, exportSettings, importSettings };
};
