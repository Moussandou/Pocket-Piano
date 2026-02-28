
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { KEYBOARD_MAP } from '../../domain/constants';
import { audioEngine } from '../../engine/audio';

interface KeyProps {
    note: string;
    isBlack: boolean;
    label?: string;
    active: boolean;
    onPress: (note: string) => void;
    onRelease: (note: string) => void;
}

const PianoKey: React.FC<KeyProps> = ({ note, isBlack, label, active, onPress, onRelease }) => {
    return (
        <div
            className={`key ${isBlack ? 'black' : 'white'} ${active ? 'active' : ''}`}
            onMouseDown={() => onPress(note)}
            onMouseUp={() => onRelease(note)}
            onMouseLeave={() => active && onRelease(note)}
            onTouchStart={(e) => { e.preventDefault(); onPress(note); }}
            onTouchEnd={(e) => { e.preventDefault(); onRelease(note); }}
        >
            <span className="key-label">{label || note}</span>
        </div>
    );
};

interface PianoProps {
    onNotePlayed?: (note: string) => void;
    onNoteReleased?: (note: string) => void;
}


export const Piano: React.FC<PianoProps> = ({ onNotePlayed, onNoteReleased }) => {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

    // Génération des touches de C2 à C7
    const notes = useMemo(() => {
        const arr = [];
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        for (let octave = 2; octave <= 6; octave++) {
            for (let i = 0; i < 12; i++) {
                arr.push(`${noteNames[i]}${octave}`);
            }
        }
        arr.push('C7');
        return arr;
    }, []);

    const onPress = useCallback((note: string) => {
        if (!activeKeys.has(note)) {
            setActiveKeys(prev => new Set(prev).add(note));
            audioEngine.playNote(note);
            onNotePlayed?.(note);
        }
    }, [activeKeys, onNotePlayed]);

    const onRelease = useCallback((note: string) => {
        if (activeKeys.has(note)) {
            setActiveKeys(prev => {
                const next = new Set(prev);
                next.delete(note);
                return next;
            });
            audioEngine.releaseNote(note);
            onNoteReleased?.(note);
        }
    }, [activeKeys, onNoteReleased]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.repeat) return;
        const note = KEYBOARD_MAP[e.key];
        if (note) {
            onPress(note);
        }
    }, [onPress]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        const note = KEYBOARD_MAP[e.key];
        if (note) {
            onRelease(note);
        }
    }, [onRelease]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    // Trouver le label du clavier pour une note donnée
    const getKeyLabel = (note: string) => {
        const found = Object.entries(KEYBOARD_MAP).find((entry) => entry[1] === note);
        return found ? found[0] : undefined;
    };

    return (
        <div className="piano-container">
            {notes.map(note => (
                <PianoKey
                    key={note}
                    note={note}
                    isBlack={note.includes('#')}
                    label={getKeyLabel(note)}
                    active={activeKeys.has(note)}
                    onPress={onPress}
                    onRelease={onRelease}
                />
            ))}
        </div>
    );
};
