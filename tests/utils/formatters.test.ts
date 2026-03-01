import { describe, it, expect } from 'vitest';
import { formatPlaytime, formatNotes, formatTime, formatDuration } from '../../src/utils/formatters';

describe('formatPlaytime', () => {
    it('returns 0h0m for 0ms', () => {
        expect(formatPlaytime(0)).toEqual({ hours: 0, minutes: 0 });
    });

    it('converts ms to hours and minutes', () => {
        const twoHoursThirtyMin = (2 * 60 + 30) * 60 * 1000;
        expect(formatPlaytime(twoHoursThirtyMin)).toEqual({ hours: 2, minutes: 30 });
    });

    it('handles partial hours correctly', () => {
        const ninetyMin = 90 * 60 * 1000;
        expect(formatPlaytime(ninetyMin)).toEqual({ hours: 1, minutes: 30 });
    });
});

describe('formatNotes', () => {
    it('returns "0" for 0', () => {
        expect(formatNotes(0)).toBe('0');
    });

    it('returns raw number below 1000', () => {
        expect(formatNotes(999)).toBe('999');
    });

    it('formats thousands with K suffix', () => {
        expect(formatNotes(1200)).toBe('1.2K');
    });

    it('formats millions with M suffix', () => {
        expect(formatNotes(3_400_000)).toBe('3.4M');
    });

    it('handles exact thousands', () => {
        expect(formatNotes(1000)).toBe('1.0K');
    });
});

describe('formatTime', () => {
    it('returns 0:00 for 0 seconds', () => {
        expect(formatTime(0)).toBe('0:00');
    });

    it('formats seconds with zero padding', () => {
        expect(formatTime(5)).toBe('0:05');
    });

    it('formats minutes and seconds', () => {
        expect(formatTime(125)).toBe('2:05');
    });

    it('handles exact minutes', () => {
        expect(formatTime(60)).toBe('1:00');
    });
});

describe('formatDuration', () => {
    it('returns "0s" for 0ms', () => {
        expect(formatDuration(0)).toBe('0s');
    });

    it('formats seconds only for short durations', () => {
        expect(formatDuration(45_000)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
        expect(formatDuration(125_000)).toBe('2m 5s');
    });

    it('drops seconds when exact minute', () => {
        expect(formatDuration(120_000)).toBe('2m 0s');
    });
});
