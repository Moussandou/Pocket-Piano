import { useState, useCallback, useEffect, useRef } from 'react';
import { audioEngine } from '../engine/audio';
import type { Recording, RecordedNote } from '../domain/models';

/**
 * In-app playback of a saved recording (note-event scheduling).
 */
export const usePlayback = () => {
    const [playingId, setPlayingId] = useState<string | null>(null);
    const playbackTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

    const stopPlayback = useCallback(() => {
        playbackTimeouts.current.forEach(clearTimeout);
        playbackTimeouts.current = [];
        setPlayingId(null);
    }, []);

    // Clean up pending timeouts on unmount
    useEffect(() => stopPlayback, [stopPlayback]);

    const playRecording = useCallback(async (recording: Recording) => {
        if (playingId === recording.id) {
            stopPlayback();
            return;
        }

        stopPlayback();

        if (!audioEngine.getReadyStatus()) {
            await audioEngine.init();
        }

        setPlayingId(recording.id || null);

        recording.notes.forEach((note: RecordedNote) => {
            const tAttack = setTimeout(() => {
                audioEngine.playNote(note.note, note.velocity);
            }, note.time);
            playbackTimeouts.current.push(tAttack);

            const releaseDuration = note.duration || 200;
            const tRelease = setTimeout(() => {
                audioEngine.releaseNote(note.note);
            }, note.time + releaseDuration);
            playbackTimeouts.current.push(tRelease);
        });

        const totalDuration = recording.duration || (
            recording.notes.length > 0
                ? recording.notes[recording.notes.length - 1].time + (recording.notes[recording.notes.length - 1].duration || 200)
                : 0
        );

        const tEnd = setTimeout(() => setPlayingId(null), totalDuration + 100);
        playbackTimeouts.current.push(tEnd);
    }, [playingId, stopPlayback]);

    return { playingId, playRecording, stopPlayback };
};
