import { describe, it, expect } from 'vitest';
import { xpForLevel, levelFromXp, levelProgress, XP_PER_NOTE, XP_SESSION_BONUS } from '../../src/domain/leveling';

describe('leveling', () => {
    describe('xpForLevel', () => {
        it('returns 0 for level 1', () => {
            expect(xpForLevel(1)).toBe(0);
        });

        it('returns BASE_XP for level 2', () => {
            expect(xpForLevel(2)).toBe(100);
        });

        it('increases exponentially', () => {
            const l3 = xpForLevel(3);
            const l4 = xpForLevel(4);
            expect(l3).toBeGreaterThan(xpForLevel(2));
            expect(l4).toBeGreaterThan(l3);
        });
    });

    describe('levelFromXp', () => {
        it('returns level 1 for 0 XP', () => {
            expect(levelFromXp(0)).toBe(1);
        });

        it('returns level 2 after reaching 100 XP', () => {
            expect(levelFromXp(100)).toBe(2);
        });

        it('stays level 1 with 99 XP', () => {
            expect(levelFromXp(99)).toBe(1);
        });

        it('advances to higher levels', () => {
            expect(levelFromXp(10000)).toBeGreaterThan(5);
        });
    });

    describe('levelProgress', () => {
        it('returns 0 at level start', () => {
            expect(levelProgress(0)).toBe(0);
        });

        it('returns value between 0 and 1 mid-level', () => {
            const p = levelProgress(50);
            expect(p).toBeGreaterThanOrEqual(0);
            expect(p).toBeLessThanOrEqual(1);
        });

        it('returns 0 at exact level boundary', () => {
            const p = levelProgress(100);
            expect(p).toBe(0);
        });
    });

    describe('constants', () => {
        it('has XP_PER_NOTE = 1', () => {
            expect(XP_PER_NOTE).toBe(1);
        });

        it('has XP_SESSION_BONUS = 25', () => {
            expect(XP_SESSION_BONUS).toBe(25);
        });
    });
});
