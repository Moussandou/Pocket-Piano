import { useState, useCallback, useEffect } from 'react';
import { metronomeEngine } from '../engine/metronome';
import { useSettings } from './useSettings';

export const useMetronome = () => {
    const { settings, updateSetting } = useSettings();
    const [isActive, setIsActive] = useState(false);

    // Sync volume when settings change
    useEffect(() => {
        metronomeEngine.setVolume(settings.metronomeVolume);
    }, [settings.metronomeVolume]);

    // Update BPM in engine when settings change (if running)
    useEffect(() => {
        if (isActive) {
            metronomeEngine.setBpm(settings.metronomeBpm);
        }
    }, [settings.metronomeBpm, isActive]);

    const toggle = useCallback(async () => {
        if (isActive) {
            metronomeEngine.stop();
            setIsActive(false);
        } else {
            await metronomeEngine.start(settings.metronomeBpm);
            setIsActive(true);
        }
    }, [isActive, settings.metronomeBpm]);

    const setBpm = useCallback((bpm: number) => {
        const clampedBpm = Math.max(30, Math.min(300, bpm));
        updateSetting('metronomeBpm', clampedBpm);
    }, [updateSetting]);

    return {
        isActive,
        toggle,
        bpm: settings.metronomeBpm,
        setBpm
    };
};
