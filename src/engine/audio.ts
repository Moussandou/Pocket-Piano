import * as Tone from 'tone';
// @ts-ignore
import * as lamejs from 'lamejs-fixed';

class AudioEngine {
    private sampler: Tone.Sampler | null = null;
    private reverb: Tone.Reverb | null = null;
    private delay: Tone.FeedbackDelay | null = null;
    private initPromise: Promise<void> | null = null;
    private isLoaded: boolean = false;
    private transposeOffset: number = 0;
    private sustainMultiplier: number = 1;
    private volumeDb: number = 0;

    // Recording components
    private recorder: Tone.Recorder | null = null;
    private isRecordingAudio: boolean = false;

    constructor() { }

    public init(): Promise<void> {
        if (this.isLoaded) return Promise.resolve();
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                await Tone.start(); // Required by browsers

                // Setup effects
                this.reverb = new Tone.Reverb({
                    decay: 2.5,
                    wet: 0.3
                }).toDestination();

                this.delay = new Tone.FeedbackDelay({
                    delayTime: "8n",
                    feedback: 0.2,
                    wet: 0
                }).connect(this.reverb);

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
                    onload: () => {
                        this.isLoaded = true;
                        if (this.sampler) {
                            this.sampler.volume.value = this.volumeDb;
                        }
                        console.log("Piano samples loaded");
                        resolve();
                    },
                    onerror: (err) => {
                        console.error("Failed to load sampler", err);
                        reject(err);
                    }
                }).connect(this.delay);

                // Setup recorder
                if (!this.recorder) {
                    this.recorder = new Tone.Recorder();
                    Tone.Destination.connect(this.recorder);
                }

            } catch (error) {
                console.error("Failed to initialize audio engine", error);
                reject(error);
            }
        });

        return this.initPromise;
    }

    public async playNote(note: string, velocity: number = 0.8) {
        if (!this.isLoaded) {
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

    public setReverb(wet: number) {
        if (this.reverb) {
            this.reverb.wet.value = wet;
        }
    }

    public setDelay(wet: number) {
        if (this.delay) {
            this.delay.wet.value = wet;
        }
    }

    public setFeedback(feedback: number) {
        if (this.delay) {
            this.delay.feedback.value = feedback;
        }
    }

    public getReadyStatus() {
        return this.isLoaded;
    }

    public async startRecording() {
        if (!this.recorder) return;
        try {
            await Tone.start();
            this.recorder.start();
            this.isRecordingAudio = true;
        } catch (e) {
            console.error("Could not start recording", e);
        }
    }

    public async stopRecording(): Promise<Blob | null> {
        if (!this.recorder || !this.isRecordingAudio) {
            return null;
        }
        this.isRecordingAudio = false;

        try {
            const webmBlob = await this.recorder.stop();
            if (webmBlob.size === 0) {
                console.error("Recording blob is empty");
                return null;
            }

            // Decode the webm/mp4 blob to extract raw audio data
            const arrayBuffer = await webmBlob.arrayBuffer();
            if (arrayBuffer.byteLength === 0) {
                console.error("Recording arrayBuffer is empty");
                return null;
            }

            const NativeAudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new NativeAudioContext();

            const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) => {
                const promise = audioCtx.decodeAudioData(arrayBuffer, resolve, reject);
                if (promise) {
                    promise.catch(reject);
                }
            });

            return this.encodeBufferToMP3(audioBuffer);
        } catch (e) {
            console.error("MP3 encoding failed", e);
            return null;
        }
    }

    private encodeBufferToMP3(audioBuffer: AudioBuffer): Blob {
        const kbps = 128;
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
        const mp3Data: Int8Array[] = [];

        const left = audioBuffer.getChannelData(0);
        const right = numChannels > 1 ? audioBuffer.getChannelData(1) : null;

        const sampleBlockSize = 1152;

        const floatToInt16 = (samples: Float32Array) => {
            const l = samples.length;
            const buf = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                let s = Math.max(-1, Math.min(1, samples[i]));
                buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            return buf;
        };

        const left16 = floatToInt16(left);
        const right16 = right ? floatToInt16(right) : null;

        for (let i = 0; i < left16.length; i += sampleBlockSize) {
            const leftChunk = left16.subarray(i, i + sampleBlockSize);
            let mp3buf;

            if (numChannels === 1) {
                mp3buf = mp3encoder.encodeBuffer(leftChunk);
            } else {
                const rightChunk = right16!.subarray(i, i + sampleBlockSize);
                mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            }

            if (mp3buf.length > 0) {
                mp3Data.push(new Int8Array(mp3buf));
            }
        }

        const flushBuf = mp3encoder.flush();
        if (flushBuf.length > 0) {
            mp3Data.push(new Int8Array(flushBuf));
        }

        return new Blob(mp3Data as any[], { type: 'audio/mp3' });
    }
}

export const audioEngine = new AudioEngine();
