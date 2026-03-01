
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { resolveNoteFromEvent, getLabelForNote } from '../../domain/constants';
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

    // Track which note each physical key is currently playing.
    // Prevents stuck notes when Shift is released before the key.
    const codeToNote = useRef<Map<string, string>>(new Map());

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
        const note = resolveNoteFromEvent(e);
        if (note) {
            codeToNote.current.set(e.code, note);
            onPress(note);
        }
    }, [onPress]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        // Release the note stored at keydown, not the one resolved now.
        // This avoids stuck notes when Shift state changes mid-press.
        const note = codeToNote.current.get(e.code);
        if (note) {
            codeToNote.current.delete(e.code);
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

    const getKeyLabel = (note: string) => {
        return getLabelForNote(note);
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
