
import * as Tone from 'tone';

class AudioEngine {
    private sampler: Tone.Sampler | null = null;
    private isLoaded: boolean = false;
    private isInitializing: boolean = false;
    private transposeOffset: number = 0;
    private sustainMultiplier: number = 1;
    private volumeDb: number = 0;

    // Recording components
    private dest: MediaStreamAudioDestinationNode | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];

    constructor() { }

    public async init() {
        if (this.sampler || this.isInitializing) return;
        this.isInitializing = true;

        try {
            await Tone.start(); // Required by browsers

            this.sampler = new Tone.Sampler({
                urls: {
                    A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
                    A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
                    A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
                    A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
                    A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
                    A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
                    A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
                    A7: "A7.mp3", C8: "C8.mp3"
                },
                release: 1,
                baseUrl: "https://tonejs.github.io/audio/salamander/",
            }).toDestination();

            await Tone.loaded();
            this.isLoaded = true;
            if (this.sampler) {
                this.sampler.volume.value = this.volumeDb;
            }

            // Set up recording destination
            const context = Tone.getContext().rawContext as AudioContext;
            this.dest = context.createMediaStreamDestination();
            Tone.Destination.connect(this.dest);

            console.log("Piano samples loaded");
        } catch (error) {
            console.error("Failed to initialize audio engine", error);
        } finally {
            this.isInitializing = false;
        }
    }

    public async playNote(note: string, velocity: number = 0.8) {
        if (!this.isLoaded && !this.isInitializing) {
            await this.init();
        }
        if (!this.sampler) return;

        const transposedNote = Tone.Frequency(note).transpose(this.transposeOffset).toNote();
        this.sampler.triggerAttack(transposedNote, Tone.now(), velocity);
    }

    public releaseNote(note: string) {
        if (!this.isLoaded || !this.sampler) return;
        const transposedNote = Tone.Frequency(note).transpose(this.transposeOffset).toNote();
        // Sustain multiplier affects the release time directly
        const releaseTime = 0.5 * this.sustainMultiplier;
        this.sampler.triggerRelease(transposedNote, Tone.now() + releaseTime);
    }

    public setTranspose(offset: number) {
        this.transposeOffset = offset;
    }

    public setSustain(multiplier: number) {
        this.sustainMultiplier = Math.max(0.1, multiplier);
    }

    public setVolume(db: number) {
        this.volumeDb = db;
        if (this.sampler) {
            this.sampler.volume.value = db;
        }
    }

    public getReadyStatus() {
        return this.isLoaded;
    }

    public startRecording() {
        if (!this.dest) return;
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(this.dest.stream);
        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.audioChunks.push(e.data);
            }
        };
        this.mediaRecorder.start();
    }

    public stopRecording(): Promise<Blob | null> {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                resolve(null);
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];
                resolve(blob);
            };

            this.mediaRecorder.stop();
        });
    }
}

export const audioEngine = new AudioEngine();
