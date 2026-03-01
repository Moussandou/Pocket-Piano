import { useState, useEffect, useCallback, useRef } from 'react';

interface ComboState {
    score: number;
    multiplier: number;
    progress: number;
}

interface UseComboSystemReturn {
    comboScore: number;
    multiplier: number;
    comboProgress: number;
    processNoteHit: () => void;
    resetCombo: () => void;
    maxSessionMultiplier: number;
}

/**
 * Encapsulates the combo/score system logic:
 * - progress bar depletion over time
 * - tiered multiplier (x1 → x2 → x4 → x8)
 * - inactivity reset after 30s
 */
export function useComboSystem(): UseComboSystemReturn {
    const [combo, setCombo] = useState<ComboState>({ score: 0, multiplier: 1, progress: 0 });
    const lastActionTime = useRef(Date.now());
    const maxMultiplier = useRef(1);

    // Depletion interval
    useEffect(() => {
        const interval = setInterval(() => {
            setCombo(prev => {
                let nextProgress = Math.max(0, prev.progress - 2.5);

                // Reset multiplier + score when progress hits 0
                if (nextProgress <= 0 && (prev.multiplier > 1 || prev.score > 0)) {
                    return { score: 0, multiplier: 1, progress: 0 };
                }

                // Inactivity reset after 30s
                if (Date.now() - lastActionTime.current > 30000 && prev.score > 0) {
                    return { score: 0, multiplier: 1, progress: 0 };
                }

                return { ...prev, progress: nextProgress };
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const processNoteHit = useCallback(() => {
        lastActionTime.current = Date.now();

        setCombo(prev => {
            const newProgress = Math.min(100, prev.progress + 15);
            const newScore = prev.score + (10 * prev.multiplier);

            let newMultiplier = prev.multiplier;
            if (newScore > 5000) newMultiplier = 8;
            else if (newScore > 2000) newMultiplier = 4;
            else if (newScore > 500) newMultiplier = 2;

            if (newMultiplier > maxMultiplier.current) {
                maxMultiplier.current = newMultiplier;
            }

            return { score: newScore, multiplier: newMultiplier, progress: newProgress };
        });
    }, []);

    const resetCombo = useCallback(() => {
        setCombo({ score: 0, multiplier: 1, progress: 0 });
        maxMultiplier.current = 1;
    }, []);

    return {
        comboScore: combo.score,
        multiplier: combo.multiplier,
        comboProgress: combo.progress,
        processNoteHit,
        resetCombo,
        maxSessionMultiplier: maxMultiplier.current,
    };
}
