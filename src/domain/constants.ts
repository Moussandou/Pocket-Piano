
export const PIANO_CONFIG = {
  startNote: 'C2',
  endNote: 'C7',
  octaves: 5,
};

export const KEYBOARD_MAP: Record<string, string> = {
  // Octave 2
  '1': 'C2',
  '!': 'C#2',
  '2': 'D2',
  '@': 'D#2',
  '3': 'E2',
  '4': 'F2',
  '$': 'F#2',
  '5': 'G2',
  '%': 'G#2',
  '6': 'A2',
  '^': 'A#2',
  '7': 'B2',

  // Octave 3
  '8': 'C3',
  '*': 'C#3',
  '9': 'D3',
  '(': 'D#3',
  '0': 'E3',
  
  // High Octaves (Row 2: QWERTY)
  'q': 'F3',
  'Q': 'F#3',
  'w': 'G3',
  'W': 'G#3',
  'e': 'A3',
  'E': 'A#3',
  'r': 'B3',
  't': 'C4',
  'T': 'C#4',
  'y': 'D4',
  'Y': 'D#4',
  'u': 'E4',
  'i': 'F4',
  'I': 'F#4',
  'o': 'G4',
  'O': 'G#4',
  'p': 'A4',
  'P': 'A#4',
  
  // Low Octaves (Row 3: ASDF)
  'a': 'B4',
  's': 'C5',
  'S': 'C#5',
  'd': 'D5',
  'D': 'D#5',
  'f': 'E5',
  'g': 'F5',
  'G': 'F#5',
  'h': 'G5',
  'H': 'G#5',
  'j': 'A5',
  'J': 'A#5',
  'k': 'B5',
  'l': 'C6',
  'L': 'C#6',
  
  // Bottom Row (Row 4: ZXCV)
  'z': 'D6',
  'Z': 'D#6',
  'x': 'E6',
  'c': 'F6',
  'C': 'F#6',
  'v': 'G6',
  'V': 'G#6',
  'b': 'A6',
  'B': 'A#6',
  'n': 'B6',
  'm': 'C7',
};

export const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
export const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];
