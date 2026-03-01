import { Timestamp } from 'firebase/firestore';

export interface RecordedNote {
    note: string;
    time: number;
    duration?: number;
    velocity: number;
}

export interface Recording {
    id?: string;
    userId?: string;
    uuid: string;
    name: string;
    timestamp: number | Timestamp;
    notes: RecordedNote[];
    duration?: number;
    favorite?: boolean;
}

export interface Sheet {
    id?: string;
    userId?: string;
    name: string;
    content: string;
    timestamp: number | Timestamp;
    favorite?: boolean;
}

export interface UserStats {
    totalNotes: number;
    totalPlaytime: number;
    totalSessions: number;
    totalVelocity: number;
    noteCountForVelocity: number;
    lastUpdated: Timestamp;
    currentStreak: number;
    bestStreak: number;
    lastPlayDate: string;
    xp: number;
    level: number;
}
