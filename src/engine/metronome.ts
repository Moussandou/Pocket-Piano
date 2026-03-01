import * as Tone from 'tone';

class MetronomeEngine {
    private mainSynth: Tone.MembraneSynth | null = null;
    private accentSynth: Tone.MembraneSynth | null = null;
    private isInitialized: boolean = false;
    private repeatEventId: number | null = null;

    constructor() { }

    private async init() {
        if (this.isInitialized) return;

        await Tone.start();

        this.mainSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.1 }
        }).toDestination();

        this.accentSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 8,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.1 }
        }).toDestination();

        this.isInitialized = true;
    }

    public async start(bpm: number) {
        await this.init();

        Tone.getTransport().bpm.value = bpm;

        // Schedule the repeat event
        // 4/4 time: 1 accent, 3 ticks
        this.repeatEventId = Tone.getTransport().scheduleRepeat((time) => {
            const position = Tone.getTransport().position.toString().split(':');
            const beat = parseInt(position[1]);

            if (beat === 0) {
                this.accentSynth?.triggerAttackRelease("C4", "32n", time);
            } else {
                this.mainSynth?.triggerAttackRelease("C2", "32n", time);
            }
        }, "4n");

        Tone.getTransport().start();
    }

    public stop() {
        Tone.getTransport().stop();
        if (this.repeatEventId !== null) {
            Tone.getTransport().clear(this.repeatEventId);
            this.repeatEventId = null;
        }
    }

    public setBpm(bpm: number) {
        Tone.getTransport().bpm.value = bpm;
    }

    public setVolume(db: number) {
        for (const s of [this.mainSynth, this.accentSynth]) {
            if (s) s.volume.value = db;
        }
    }

    public getIsRunning(): boolean {
        return Tone.getTransport().state === 'started';
    }
}

export const metronomeEngine = new MetronomeEngine();
