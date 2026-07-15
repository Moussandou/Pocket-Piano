import { useState, useCallback, useRef } from 'react';
import type { Recording, RecordedNote } from '../domain/models';
import { audioEngine } from '../engine/audio';
import { db, auth } from '../infra/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const useRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    const audioBlobRef = useRef<Blob | null>(null);
    const currentNotes = useRef<RecordedNote[]>([]);
    const activeNotes = useRef<Map<string, { startTime: number; index: number }>>(new Map());
    const startTime = useRef<number>(0);

    const startRecording = useCallback(async () => {
        if (!audioEngine.getReadyStatus()) {
            await audioEngine.init();
        }
        audioEngine.startRecording();
        setIsRecording(true);
        audioBlobRef.current = null;
        setHasAudio(false);
        currentNotes.current = [];
        activeNotes.current.clear();
        startTime.current = Date.now();
    }, []);

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        // Close out any notes still pressed
        const now = Date.now() - startTime.current;
        activeNotes.current.forEach((data) => {
            if (currentNotes.current[data.index]) {
                currentNotes.current[data.index].duration = now - currentNotes.current[data.index].time;
            }
        });
        activeNotes.current.clear();
        audioBlobRef.current = await audioEngine.stopRecording();
        setHasAudio(!!audioBlobRef.current);
    }, []);

    const discardRecording = useCallback(() => {
        currentNotes.current = [];
        activeNotes.current.clear();
        audioBlobRef.current = null;
        setHasAudio(false);
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

        if (auth.currentUser) {
            try {
                await addDoc(collection(db, 'recordings'), {
                    userId: auth.currentUser.uid,
                    name,
                    notes: newRecording.notes,
                    timestamp: serverTimestamp(),
                    duration: newRecording.duration
                });
            } catch (error) {
                console.error('Cloud save failed', error);
            }
        }

        currentNotes.current = [];
    }, []);

    const exportAudio = useCallback((name: string) => {
        const blob = audioBlobRef.current;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'recording'}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    return {
        isRecording,
        startRecording,
        stopRecording,
        saveRecording,
        discardRecording,
        recordNote,
        exportAudio,
        hasAudio,
    };
};
