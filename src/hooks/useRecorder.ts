
import { useState, useCallback, useRef } from 'react';
import type { Recording, RecordedNote } from '../domain/models';
import { audioEngine } from '../engine/audio';
import { db, auth } from '../infra/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const useRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const currentNotes = useRef<RecordedNote[]>([]);
    const activeNotes = useRef<Map<string, { startTime: number; index: number }>>(new Map());
    const startTime = useRef<number>(0);
    const currentAudioBlob = useRef<Blob | null>(null);

    const startRecording = useCallback(async () => {
        if (!audioEngine.getReadyStatus()) {
            await audioEngine.init();
        }
        audioEngine.startRecording();
        setIsRecording(true);
        currentNotes.current = [];
        activeNotes.current.clear();
        startTime.current = Date.now();
    }, []);

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        // Clean up any notes still pressed
        const now = Date.now() - startTime.current;
        activeNotes.current.forEach((data) => {
            if (currentNotes.current[data.index]) {
                currentNotes.current[data.index].duration = now - (currentNotes.current[data.index].time);
            }
        });
        activeNotes.current.clear();
        currentAudioBlob.current = await audioEngine.stopRecording();
    }, []);

    const discardRecording = useCallback(() => {
        currentNotes.current = [];
        activeNotes.current.clear();
        currentAudioBlob.current = null;
        audioEngine.stopRecording(); // ensure it stops capturing
        setIsRecording(false);
    }, []);

    const saveRecording = useCallback(async (name: string) => {
        if (currentNotes.current.length === 0) return;

        const newRecording: Recording = {
            uuid: crypto.randomUUID(),
            name,
            timestamp: Date.now(),
            notes: [...currentNotes.current],
            duration: currentNotes.current.length > 0
                ? (currentNotes.current[currentNotes.current.length - 1].time + (currentNotes.current[currentNotes.current.length - 1].duration || 0))
                : 0
        };

        setRecordings(prev => [newRecording, ...prev]);

        // Cloud save if user is logged in
        if (auth.currentUser) {
            try {
                await addDoc(collection(db, 'recordings'), {
                    userId: auth.currentUser.uid,
                    name,
                    notes: newRecording.notes,
                    timestamp: serverTimestamp(),
                    duration: newRecording.duration
                });
                console.log("Recording saved to cloud");
            } catch (error) {
                console.error("Cloud save failed", error);
            }
        }

        // Always download the audio file for the user
        if (currentAudioBlob.current) {
            const url = URL.createObjectURL(currentAudioBlob.current);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'enregistrement'}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            currentAudioBlob.current = null;
        }

        currentNotes.current = []; // Clear buffer after saving
    }, []);

    const recordNote = useCallback((note: string, velocity: number = 0.8, type: 'DOWN' | 'UP' = 'DOWN') => {
        if (!isRecording) return;

        const now = Date.now() - startTime.current;

        if (type === 'DOWN') {
            const noteIndex = currentNotes.current.length;
            currentNotes.current.push({
                note,
                velocity,
                time: now,
                duration: 0
            });
            activeNotes.current.set(note, { startTime: now, index: noteIndex });
        } else {
            const data = activeNotes.current.get(note);
            if (data !== undefined) {
                const duration = now - data.startTime;
                if (currentNotes.current[data.index]) {
                    currentNotes.current[data.index].duration = duration;
                }
                activeNotes.current.delete(note);
            }
        }
    }, [isRecording]);

    const playRecording = useCallback((recording: Recording) => {
        recording.notes.forEach(note => {
            setTimeout(() => {
                audioEngine.playNote(note.note, note.velocity);
                if (note.duration) {
                    setTimeout(() => audioEngine.releaseNote(note.note), note.duration);
                } else {
                    setTimeout(() => audioEngine.releaseNote(note.note), 200);
                }
            }, note.time);
        });
    }, []);

    return {
        isRecording,
        recordings,
        startRecording,
        stopRecording,
        saveRecording,
        discardRecording,
        recordNote,
        playRecording,
    };
};
