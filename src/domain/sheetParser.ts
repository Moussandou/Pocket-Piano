/**
 * Parses Virtual Piano letter-notation into structured tokens.
 *
 * Notation rules:
 * - [asdf]     → chord (all keys simultaneous)
 * - [a s d f]  → fast sequence
 * - asdf       → sequential notes (quick)
 * - a s d f    → sequential notes with short pauses
 * - |          → short pause
 * - | (extra spaces) → longer pauses
 * - paragraph break  → extended pause
 */

export type SheetToken =
    | { type: 'note'; key: string }
    | { type: 'chord'; keys: string[] }
    | { type: 'pause'; duration: 'short' | 'medium' | 'long' | 'extended' }

export function parseSheet(raw: string): SheetToken[] {
    const tokens: SheetToken[] = [];
    const paragraphs = raw.split(/\n\s*\n/);

    for (let pi = 0; pi < paragraphs.length; pi++) {
        if (pi > 0) {
            tokens.push({ type: 'pause', duration: 'extended' });
        }

        const lines = paragraphs[pi].split('\n');
        for (const line of lines) {
            parseLine(line, tokens);
        }
    }

    return tokens;
}

function parseLine(line: string, tokens: SheetToken[]): void {
    let i = 0;

    while (i < line.length) {
        const ch = line[i];

        if (ch === '[') {
            // Bracket group: chord or fast sequence
            const closeIdx = line.indexOf(']', i);
            if (closeIdx === -1) {
                // Malformed: treat rest as individual notes
                i++;
                continue;
            }

            const inner = line.slice(i + 1, closeIdx);
            const hasSpaces = inner.includes(' ');
            const keys = hasSpaces
                ? inner.split(/\s+/).filter(Boolean)
                : inner.split('');

            if (keys.length > 0) {
                if (!hasSpaces) {
                    // [asdf] → chord (simultaneous)
                    tokens.push({ type: 'chord', keys });
                } else {
                    // [a s d f] → fast sequence (individual notes, no pauses)
                    for (const k of keys) {
                        tokens.push({ type: 'note', key: k });
                    }
                }
            }

            i = closeIdx + 1;
        } else if (ch === '|') {
            // Pause: count surrounding spaces for duration
            let pipeCount = 0;
            let spaceCount = 0;
            const startIdx = i;

            // Count consecutive pipes and spaces
            while (i < line.length && (line[i] === '|' || line[i] === ' ')) {
                if (line[i] === '|') pipeCount++;
                if (line[i] === ' ') spaceCount++;
                i++;
            }

            // Spaces before the first pipe also contribute
            let leadingSpaces = 0;
            for (let b = startIdx - 1; b >= 0 && line[b] === ' '; b--) {
                leadingSpaces++;
            }

            const totalWeight = pipeCount + spaceCount + leadingSpaces;

            if (totalWeight >= 4) {
                tokens.push({ type: 'pause', duration: 'long' });
            } else if (totalWeight >= 2) {
                tokens.push({ type: 'pause', duration: 'medium' });
            } else {
                tokens.push({ type: 'pause', duration: 'short' });
            }
        } else if (ch === ' ') {
            // Space between notes = short pause (only if adjacent to note chars)
            const prevToken = tokens[tokens.length - 1];
            if (prevToken && prevToken.type === 'note') {
                // Look ahead: if next non-space char is a note, insert pause
                let j = i;
                while (j < line.length && line[j] === ' ') j++;
                if (j < line.length && line[j] !== '|' && line[j] !== '[') {
                    tokens.push({ type: 'pause', duration: 'short' });
                }
            }
            i++;
        } else {
            // Regular note character
            tokens.push({ type: 'note', key: ch });
            i++;
        }
    }
}

/**
 * Returns a display-friendly label for a token.
 */
export function tokenLabel(token: SheetToken): string {
    switch (token.type) {
        case 'note':
            return token.key;
        case 'chord':
            return `[${token.keys.join('')}]`;
        case 'pause':
            return '·';
    }
}
