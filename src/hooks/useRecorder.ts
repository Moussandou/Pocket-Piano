
import { useState, useCallback, useRef } from 'react';
import type { Recording, RecordedNote } from '../domain/models';
import { audioEngine } from '../engine/audio';
import { db, auth } from '../infra/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const useRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const currentNotes = useRef<RecordedNote[]>([]);
    const startTime = useRef<number>(0);

    const startRecording = useCallback(() => {
        setIsRecording(true);
        currentNotes.current = [];
        startTime.current = Date.now();
    }, []);

    const stopRecording = useCallback(async (name: string = "Mon Morceau") => {
        setIsRecording(false);
        if (currentNotes.current.length === 0) return;

        const newRecording: Recording = {
            uuid: crypto.randomUUID(),
            name,
            timestamp: Date.now(),
            notes: [...currentNotes.current],
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
                    duration: currentNotes.current[currentNotes.current.length - 1].time
                });
                console.log("Recording saved to cloud");
            } catch (error) {
                console.error("Cloud save failed", error);
            }
        }
    }, []);

    const recordNote = useCallback((note: string, velocity: number = 0.8) => {
        if (!isRecording) return;
        currentNotes.current.push({
            note,
            velocity,
            time: Date.now() - startTime.current,
        });
    }, [isRecording]);

    const playRecording = useCallback((recording: Recording) => {
        recording.notes.forEach(note => {
            setTimeout(() => {
                audioEngine.playNote(note.note, note.velocity);
                // On simule un release après 200ms si pas de durée définie
                setTimeout(() => audioEngine.releaseNote(note.note), 200);
            }, note.time);
        });
    }, []);

    return {
        isRecording,
        recordings,
        startRecording,
        stopRecording,
        recordNote,
        playRecording,
    };
};
