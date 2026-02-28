import * as Tone from 'tone';
// @ts-ignore
import * as lamejs from 'lamejs';

class AudioEngine {
    private sampler: Tone.Sampler | null = null;
    private isLoaded: boolean = false;
    private isInitializing: boolean = false;
    private transposeOffset: number = 0;
    private sustainMultiplier: number = 1;
    private volumeDb: number = 0;

    // Recording components
    private recordingNode: ScriptProcessorNode | null = null;
    private isRecordingAudio: boolean = false;
    private leftChannel: Float32Array[] = [];
    private rightChannel: Float32Array[] = [];
    private sampleRate: number = 44100;

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

            // The recording node will be set up when starting recording


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
        const context = Tone.getContext().rawContext as AudioContext;
        this.sampleRate = context.sampleRate;
        this.leftChannel = [];
        this.rightChannel = [];
        this.isRecordingAudio = true;

        if (!this.recordingNode) {
            this.recordingNode = context.createScriptProcessor(4096, 2, 2);
            this.recordingNode.onaudioprocess = (e) => {
                if (!this.isRecordingAudio) return;

                // Copy data to our buffers
                this.leftChannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
                this.rightChannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
            };

            // Connect the Master output to the recording node
            Tone.Destination.connect(this.recordingNode);
            // ScriptProcessorNode MUST be connected to an output to work
            this.recordingNode.connect(context.destination);
        }
    }

    public stopRecording(): Promise<Blob | null> {
        return new Promise((resolve) => {
            if (!this.isRecordingAudio) {
                resolve(null);
                return;
            }
            this.isRecordingAudio = false;

            // Process MP3 in a short timeout to unblock the UI thread briefly
            setTimeout(() => {
                const blob = this.encodeToMP3();
                this.leftChannel = [];
                this.rightChannel = [];
                resolve(blob);
            }, 10);
        });
    }

    private encodeToMP3(): Blob {
        try {
            const kbps = 128;
            const encoder = new lamejs.Mp3Encoder(2, this.sampleRate, kbps);
            const mp3Data: Int8Array[] = [];

            const totalLength = this.leftChannel.reduce((acc, val) => acc + val.length, 0);
            const leftBuffer = new Float32Array(totalLength);
            const rightBuffer = new Float32Array(totalLength);

            let offset = 0;
            for (let i = 0; i < this.leftChannel.length; i++) {
                leftBuffer.set(this.leftChannel[i], offset);
                rightBuffer.set(this.rightChannel[i], offset);
                offset += this.leftChannel[i].length;
            }

            const convertBuffer = (buffer: Float32Array) => {
                const l = buffer.length;
                const buf = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    let s = Math.max(-1, Math.min(1, buffer[i]));
                    buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                return buf;
            };

            const leftInt16 = convertBuffer(leftBuffer);
            const rightInt16 = convertBuffer(rightBuffer);

            const sampleBlockSize = 1152;
            for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
                const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
                const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);

                const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
                if (mp3buf.length > 0) {
                    mp3Data.push(new Int8Array(mp3buf));
                }
            }

            const encodeBuffer = encoder.flush();
            if (encodeBuffer.length > 0) {
                mp3Data.push(new Int8Array(encodeBuffer));
            }

            return new Blob(mp3Data as any[], { type: 'audio/mp3' });
        } catch (e) {
            console.error("MP3 encoding failed", e);
            return new Blob([], { type: 'audio/mp3' });
        }
    }
}

export const audioEngine = new AudioEngine();
