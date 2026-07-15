import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'pocket-piano-onboarded';

interface Step {
    target: string;
    textKey: string;
    placement: 'above' | 'below';
}

const STEPS: Step[] = [
    { target: 'piano', textKey: 'onboarding.keyboardHint', placement: 'above' },
    { target: 'record', textKey: 'onboarding.recordHint', placement: 'below' },
    { target: 'sheet', textKey: 'onboarding.sheetHint', placement: 'below' },
];

interface OnboardingProps {
    /** Increment to replay the tour (Help button). 0 = first-run detection only. */
    run: number;
}

export const Onboarding: React.FC<OnboardingProps> = ({ run }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState<number>(-1);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // First-run detection
    useEffect(() => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            setStep(0);
        }
    }, []);

    // Manual replay via the Help button
    useEffect(() => {
        if (run > 0) setStep(0);
    }, [run]);

    // Position the card next to its target
    useLayoutEffect(() => {
        if (step < 0 || step >= STEPS.length) return;

        const place = () => {
            const { target, placement } = STEPS[step];
            const el = document.querySelector(`[data-onboarding="${target}"]`);
            if (!el) {
                setPos(null);
                return;
            }
            const rect = el.getBoundingClientRect();
            const cardWidth = cardRef.current?.offsetWidth ?? 300;
            const cardHeight = cardRef.current?.offsetHeight ?? 120;
            const left = Math.min(
                Math.max(12, rect.left + rect.width / 2 - cardWidth / 2),
                window.innerWidth - cardWidth - 12
            );
            const top = placement === 'above'
                ? rect.top - cardHeight - 14
                : rect.bottom + 14;
            
            // Robust clamping to keep the card fully within the visible viewport boundaries
            const minTop = 64; // below the topbar
            const maxTop = window.innerHeight - cardHeight - 12;
            const clampedTop = Math.max(minTop, Math.min(maxTop, top));

            setPos({ top: clampedTop, left });
        };

        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [step]);

    if (step < 0 || step >= STEPS.length) return null;

    const finish = () => {
        localStorage.setItem(STORAGE_KEY, '1');
        setStep(-1);
    };

    const next = () => {
        if (step + 1 >= STEPS.length) {
            finish();
        } else {
            setStep(step + 1);
        }
    };

    const isLast = step === STEPS.length - 1;
    const placement = STEPS[step].placement;

    return (
        <div
            ref={cardRef}
            className={`onboarding-card ${placement}`}
            style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
        >
            <p>{t(STEPS[step].textKey)}</p>
            <div className="onboarding-footer">
                <div className="onboarding-dots">
                    {STEPS.map((_, i) => (
                        <span key={i} className={i === step ? 'active' : ''} />
                    ))}
                </div>
                <div className="onboarding-actions">
                    <button className="onboarding-skip" onClick={finish}>{t('onboarding.skip')}</button>
                    <button className="onboarding-next" onClick={next}>
                        {isLast ? t('onboarding.done') : t('onboarding.next')}
                    </button>
                </div>
            </div>
        </div>
    );
};
