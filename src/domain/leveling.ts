/**
 * XP / Level progression system.
 *
 * Each level requires progressively more XP.
 * XP sources: notes played (1 XP each), combo multiplied score, session completion bonus.
 */

const BASE_XP = 100;
const GROWTH_FACTOR = 1.4;

/** XP needed to reach a given level (cumulative). */
export function xpForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(BASE_XP * Math.pow(GROWTH_FACTOR, level - 2));
}

/** Determine current level from total XP. */
export function levelFromXp(totalXp: number): number {
    let level = 1;
    let cumulative = 0;
    while (true) {
        const needed = xpForLevel(level + 1);
        if (cumulative + needed > totalXp) break;
        cumulative += needed;
        level++;
    }
    return level;
}

/** Progress within current level as 0..1. */
export function levelProgress(totalXp: number): number {
    const level = levelFromXp(totalXp);
    let cumulative = 0;
    for (let i = 2; i <= level; i++) {
        cumulative += xpForLevel(i);
    }
    const remaining = totalXp - cumulative;
    const needed = xpForLevel(level + 1);
    if (needed === 0) return 1;
    return Math.min(1, remaining / needed);
}

/** XP earned per note (base, before combo). */
export const XP_PER_NOTE = 1;

/** XP bonus for completing a session. */
export const XP_SESSION_BONUS = 25;
