
import * as Tone from 'tone';

class AudioEngine {
    private sampler: Tone.Sampler | null = null;
    private isLoaded: boolean = false;
    private transposeOffset: number = 0;
    private sustainMultiplier: number = 1;

    constructor() {
        // Initialisation différée pour respecter les politiques d'autostart des navigateurs
    }

    public async init() {
        if (this.sampler) return;

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
        console.log("Piano samples loaded");
    }

    public playNote(note: string, velocity: number = 0.8) {
        if (!this.isLoaded || !this.sampler) return;
        const transposedNote = Tone.Frequency(note).transpose(this.transposeOffset).toNote();
        this.sampler.triggerAttack(transposedNote, Tone.now(), velocity);
    }

    public releaseNote(note: string) {
        if (!this.isLoaded || !this.sampler) return;
        const transposedNote = Tone.Frequency(note).transpose(this.transposeOffset).toNote();
        // Sustain multiplier affects the release time
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
        if (this.sampler) {
            this.sampler.volume.value = db;
        }
    }

    public getReadyStatus() {
        return this.isLoaded;
    }
}

export const audioEngine = new AudioEngine();
