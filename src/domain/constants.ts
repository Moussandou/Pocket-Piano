
export const PIANO_CONFIG = {
  startNote: 'C2',
  endNote: 'C7',
  octaves: 5,
};

/**
 * Letter-based map: maps the character produced by a key press to a note.
 * Works identically on AZERTY, QWERTY, or any layout:
 * pressing the key labeled 'a' always triggers the note labeled 'a'.
 *
 * Uppercase = sharp variant (triggered by Shift+letter).
 */
const LETTER_MAP: Record<string, string> = {
  // Top row
  'q': 'F3', 'Q': 'F#3',
  'w': 'G3', 'W': 'G#3',
  'e': 'A3', 'E': 'A#3',
  'r': 'B3',
  't': 'C4', 'T': 'C#4',
  'y': 'D4', 'Y': 'D#4',
  'u': 'E4',
  'i': 'F4', 'I': 'F#4',
  'o': 'G4', 'O': 'G#4',
  'p': 'A4', 'P': 'A#4',

  // Home row
  'a': 'B4',
  's': 'C5', 'S': 'C#5',
  'd': 'D5', 'D': 'D#5',
  'f': 'E5',
  'g': 'F5', 'G': 'F#5',
  'h': 'G5', 'H': 'G#5',
  'j': 'A5', 'J': 'A#5',
  'k': 'B5',
  'l': 'C6', 'L': 'C#6',

  // Bottom row
  'z': 'D6', 'Z': 'D#6',
  'x': 'E6',
  'c': 'F6', 'C': 'F#6',
  'v': 'G6', 'V': 'G#6',
  'b': 'A6', 'B': 'A#6',
  'n': 'B6',
  'm': 'C7',
};

/**
 * Digit map: uses event.code (physical position) so digits work
 * on AZERTY without needing Shift.
 */
interface DigitMapping {
  note: string;
  shiftNote?: string;
}

const DIGIT_MAP: Record<string, DigitMapping> = {
  'Digit1': { note: 'C2', shiftNote: 'C#2' },
  'Digit2': { note: 'D2', shiftNote: 'D#2' },
  'Digit3': { note: 'E2' },
  'Digit4': { note: 'F2', shiftNote: 'F#2' },
  'Digit5': { note: 'G2', shiftNote: 'G#2' },
  'Digit6': { note: 'A2', shiftNote: 'A#2' },
  'Digit7': { note: 'B2' },
  'Digit8': { note: 'C3', shiftNote: 'C#3' },
  'Digit9': { note: 'D3', shiftNote: 'D#3' },
  'Digit0': { note: 'E3' },
};

/**
 * Resolve the note for a keyboard event.
 * - Digits: resolved by physical key (event.code) — works on AZERTY without Shift.
 * - Letters: resolved by character (event.key) — 'a' always maps to 'a' on any layout.
 */
export function resolveNoteFromEvent(e: KeyboardEvent): string | null {
  // Digits: use physical code
  if (e.code.startsWith('Digit')) {
    const mapping = DIGIT_MAP[e.code];
    if (!mapping) return null;
    return (e.shiftKey && mapping.shiftNote) ? mapping.shiftNote : mapping.note;
  }

  // Letters: use the character produced
  return LETTER_MAP[e.key] ?? null;
}

/**
 * Reverse lookup: find the display label for a note.
 * Returns lowercase letter/digit for base notes, uppercase for sharps.
 */
export function getLabelForNote(note: string): string | undefined {
  // Check digits
  for (const [, mapping] of Object.entries(DIGIT_MAP)) {
    if (mapping.note === note) {
      const digit = Object.entries(DIGIT_MAP).find(([, m]) => m === mapping)?.[0];
      return digit?.replace('Digit', '');
    }
    if (mapping.shiftNote === note) {
      const digit = Object.entries(DIGIT_MAP).find(([, m]) => m === mapping)?.[0];
      return digit?.replace('Digit', '');
    }
  }

  // Check letters
  for (const [key, n] of Object.entries(LETTER_MAP)) {
    if (n === note) return key;
  }
  return undefined;
}

/**
 * Full KEYBOARD_MAP (character → note) for sheet follow and other lookups.
 */
export const KEYBOARD_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = { ...LETTER_MAP };
  for (const [code, mapping] of Object.entries(DIGIT_MAP)) {
    const digit = code.replace('Digit', '');
    map[digit] = mapping.note;
    if (mapping.shiftNote) {
      map[digit] = mapping.note;
    }
  }
  return map;
})();

export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
