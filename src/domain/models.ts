
export interface RecordedNote {
    note: string;
    time: number;
    duration?: number;
    velocity: number;
}

export interface Recording {
    uuid: string;
    name: string;
    timestamp: number;
    notes: RecordedNote[];
}
