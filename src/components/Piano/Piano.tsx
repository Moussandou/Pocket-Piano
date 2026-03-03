
import React, { useEffect, useMemo, useRef, useCallback } from 'react';
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
    active?: boolean;
    startOctave?: number;
    endOctave?: number;
}

export const Piano: React.FC<PianoProps> = ({
    onNotePlayed,
    onNoteReleased,
    active = true,
    startOctave = 2,
    endOctave = 6
}) => {
    // ... existing code ...
    const activeKeysRef = useRef<Set<string>>(new Set());
    const [, forceRender] = React.useState(0);
    const triggerRender = useCallback(() => forceRender(n => n + 1), []);

    // Track which note each physical key is currently playing.
    const codeToNote = useRef<Map<string, string>>(new Map());

    // Keep latest callbacks in refs to avoid recreating keyboard handlers.
    const onNotePlayedRef = useRef(onNotePlayed);
    onNotePlayedRef.current = onNotePlayed;
    const onNoteReleasedRef = useRef(onNoteReleased);
    onNoteReleasedRef.current = onNoteReleased;

    // Release all notes helper
    const releaseAll = useCallback(() => {
        activeKeysRef.current.forEach(note => {
            audioEngine.releaseNote(note);
            onNoteReleasedRef.current?.(note);
        });
        activeKeysRef.current.clear();
        codeToNote.current.clear();
        triggerRender();
    }, [triggerRender]);

    const notes = useMemo(() => {
        const arr = [];
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        for (let octave = startOctave; octave <= endOctave; octave++) {
            for (let i = 0; i < 12; i++) {
                arr.push(`${noteNames[i]}${octave}`);
            }
        }
        // Add C of the next octave if we are at the end
        if (endOctave < 8) {
            arr.push(`C${endOctave + 1}`);
        }
        return arr;
    }, [startOctave, endOctave]);

    const pressNote = useCallback((note: string) => {
        if (activeKeysRef.current.has(note)) return;
        activeKeysRef.current.add(note);
        triggerRender();
        audioEngine.playNote(note);
        onNotePlayedRef.current?.(note);
    }, [triggerRender]);

    const releaseNote = useCallback((note: string) => {
        if (!activeKeysRef.current.has(note)) return;
        activeKeysRef.current.delete(note);
        triggerRender();
        audioEngine.releaseNote(note);
        onNoteReleasedRef.current?.(note);
    }, [triggerRender]);

    useEffect(() => {
        if (!active) {
            releaseAll();
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const note = resolveNoteFromEvent(e);
            if (note) {
                codeToNote.current.set(e.code, note);
                pressNote(note);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const note = codeToNote.current.get(e.code);
            if (note) {
                codeToNote.current.delete(e.code);
                releaseNote(note);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [active, pressNote, releaseNote, releaseAll]);

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
                    active={activeKeysRef.current.has(note)}
                    onPress={pressNote}
                    onRelease={releaseNote}
                />
            ))}
        </div>
    );
};
