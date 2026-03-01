
export const PIANO_CONFIG = {
  startNote: 'C2',
  endNote: 'C7',
  octaves: 5,
};

/**
 * Maps physical key codes (KeyboardEvent.code) to musical notes.
 * Using event.code avoids Shift conflicts on AZERTY/QWERTZ layouts:
 * digits are always accessible without affecting simultaneous letter presses.
 *
 * Entries with shiftKey=true produce the sharp variant of the same physical key.
 */
interface KeyMapping {
  note: string;
  shiftNote?: string;
}

export const KEYCODE_MAP: Record<string, KeyMapping> = {
  // Number row — Octave 2 & 3
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

  // QWERTY row — Octave 3 & 4
  'KeyQ': { note: 'F3', shiftNote: 'F#3' },
  'KeyW': { note: 'G3', shiftNote: 'G#3' },
  'KeyE': { note: 'A3', shiftNote: 'A#3' },
  'KeyR': { note: 'B3' },
  'KeyT': { note: 'C4', shiftNote: 'C#4' },
  'KeyY': { note: 'D4', shiftNote: 'D#4' },
  'KeyU': { note: 'E4' },
  'KeyI': { note: 'F4', shiftNote: 'F#4' },
  'KeyO': { note: 'G4', shiftNote: 'G#4' },
  'KeyP': { note: 'A4', shiftNote: 'A#4' },

  // Home row — Octave 4 & 5
  'KeyA': { note: 'B4' },
  'KeyS': { note: 'C5', shiftNote: 'C#5' },
  'KeyD': { note: 'D5', shiftNote: 'D#5' },
  'KeyF': { note: 'E5' },
  'KeyG': { note: 'F5', shiftNote: 'F#5' },
  'KeyH': { note: 'G5', shiftNote: 'G#5' },
  'KeyJ': { note: 'A5', shiftNote: 'A#5' },
  'KeyK': { note: 'B5' },
  'KeyL': { note: 'C6', shiftNote: 'C#6' },

  // Bottom row — Octave 6 & 7
  'KeyZ': { note: 'D6', shiftNote: 'D#6' },
  'KeyX': { note: 'E6' },
  'KeyC': { note: 'F6', shiftNote: 'F#6' },
  'KeyV': { note: 'G6', shiftNote: 'G#6' },
  'KeyB': { note: 'A6', shiftNote: 'A#6' },
  'KeyN': { note: 'B6' },
  'KeyM': { note: 'C7' },
};

/**
 * Resolve the note for a given KeyboardEvent using physical key position.
 * Shift selects the sharp variant when available.
 */
export function resolveNoteFromEvent(e: KeyboardEvent): string | null {
  const mapping = KEYCODE_MAP[e.code];
  if (!mapping) return null;
  return (e.shiftKey && mapping.shiftNote) ? mapping.shiftNote : mapping.note;
}

/**
 * Reverse lookup: find the display label (key character) for a note.
 * Returns lowercase letter / digit for base notes, uppercase for sharps.
 */
export function getLabelForNote(note: string): string | undefined {
  for (const [code, mapping] of Object.entries(KEYCODE_MAP)) {
    if (mapping.note === note || mapping.shiftNote === note) {
      const base = code.replace('Digit', '').replace('Key', '').toLowerCase();
      const isSharp = mapping.shiftNote === note;
      return isSharp ? base.toUpperCase() : base;
    }
  }
  return undefined;
}

/**
 * Legacy KEYBOARD_MAP (character-based) kept for backward compatibility.
 * Used by sheet follow validation and anywhere that receives a character key.
 */
export const KEYBOARD_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const [code, mapping] of Object.entries(KEYCODE_MAP)) {
    const base = code.replace('Digit', '').replace('Key', '').toLowerCase();
    map[base] = mapping.note;
    if (mapping.shiftNote) {
      map[base.toUpperCase()] = mapping.shiftNote;
    }
  }
  return map;
})();

export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
