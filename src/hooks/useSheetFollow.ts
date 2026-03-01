import { useState, useCallback, useRef, useMemo } from 'react';
import { parseSheet, type SheetToken } from '../domain/sheetParser';

export type TokenResult = 'correct' | 'wrong' | 'pending';

export interface SheetFollowState {
    sheetText: string;
    tokens: SheetToken[];
    cursor: number;
    startCursor: number;
    results: TokenResult[];
    isActive: boolean;
    isComplete: boolean;
    stats: { correct: number; wrong: number; total: number };
}

export function useSheetFollow() {
    const [sheetText, setSheetText] = useState('');
    const [tokens, setTokens] = useState<SheetToken[]>([]);
    const [cursor, setCursor] = useState(0);
    const [startCursor, setStartCursorState] = useState(0);
    const [results, setResults] = useState<TokenResult[]>([]);
    const [isActive, setIsActive] = useState(false);

    // Track which chord keys have been pressed for the current chord token
    const chordBuffer = useRef<Set<string>>(new Set());

    const noteTokens = useMemo(
        () => tokens.filter(t => t.type === 'note' || t.type === 'chord'),
        [tokens]
    );

    const isComplete = isActive && cursor >= tokens.length;

    const stats = useMemo(() => {
        const correct = results.filter(r => r === 'correct').length;
        const wrong = results.filter(r => r === 'wrong').length;
        return { correct, wrong, total: correct + wrong };
    }, [results]);

    const loadSheet = useCallback((text: string) => {
        const parsed = parseSheet(text);
        setSheetText(text);
        setTokens(parsed);
        setCursor(0);
        setStartCursorState(0);
        setResults(new Array(parsed.length).fill('pending'));
        setIsActive(false);
        chordBuffer.current.clear();
    }, []);

    const start = useCallback(() => {
        if (tokens.length === 0) return;
        const startResults = results.map((r, i) => i >= startCursor ? 'pending' as TokenResult : r);
        // Skip any pauses at the start position
        let idx = startCursor;
        while (idx < tokens.length && tokens[idx].type === 'pause') {
            startResults[idx] = 'correct';
            idx++;
        }
        setCursor(idx);
        setResults(startResults);
        setIsActive(true);
        chordBuffer.current.clear();
    }, [tokens, startCursor, results]);

    const stop = useCallback(() => {
        setIsActive(false);
        chordBuffer.current.clear();
    }, []);

    const restart = useCallback(() => {
        const freshResults = results.map((r, i) =>
            i >= startCursor ? 'pending' as TokenResult : r
        );
        let idx = startCursor;
        while (idx < tokens.length && tokens[idx].type === 'pause') {
            freshResults[idx] = 'correct';
            idx++;
        }
        setCursor(idx);
        setResults(freshResults);
        setIsActive(true);
        chordBuffer.current.clear();
    }, [startCursor, tokens, results]);

    const setStartPosition = useCallback((index: number) => {
        if (index >= 0 && index < tokens.length) {
            setStartCursorState(index);
        }
    }, [tokens.length]);

    /**
     * Advances cursor past pause tokens since they don't require key input.
     */
    const advancePastPauses = useCallback((fromIndex: number, resultsCopy: TokenResult[]) => {
        let idx = fromIndex;
        while (idx < tokens.length && tokens[idx].type === 'pause') {
            resultsCopy[idx] = 'correct';
            idx++;
        }
        return idx;
    }, [tokens]);

    /**
     * Validates a key press against the current token.
     * Returns 'correct', 'wrong', or 'pending' (for chords waiting for more keys).
     */
    const validateKey = useCallback((key: string): TokenResult => {
        if (!isActive || cursor >= tokens.length) return 'pending';

        const token = tokens[cursor];

        if (token.type === 'note') {
            const isCorrect = token.key.toLowerCase() === key.toLowerCase();
            const result: TokenResult = isCorrect ? 'correct' : 'wrong';

            setResults(prev => {
                const next = [...prev];
                next[cursor] = result;
                // Auto-skip subsequent pauses
                const newCursor = advancePastPauses(cursor + 1, next);
                setCursor(newCursor);
                return next;
            });

            chordBuffer.current.clear();
            return result;
        }

        if (token.type === 'chord') {
            const expectedKeys = token.keys.map(k => k.toLowerCase());
            const pressedKey = key.toLowerCase();

            if (expectedKeys.includes(pressedKey)) {
                chordBuffer.current.add(pressedKey);

                // Check if all chord keys have been pressed
                const allPressed = expectedKeys.every(k => chordBuffer.current.has(k));
                if (allPressed) {
                    setResults(prev => {
                        const next = [...prev];
                        next[cursor] = 'correct';
                        const newCursor = advancePastPauses(cursor + 1, next);
                        setCursor(newCursor);
                        return next;
                    });
                    chordBuffer.current.clear();
                    return 'correct';
                }
                return 'pending';
            }

            // Wrong key for this chord
            setResults(prev => {
                const next = [...prev];
                next[cursor] = 'wrong';
                const newCursor = advancePastPauses(cursor + 1, next);
                setCursor(newCursor);
                return next;
            });
            chordBuffer.current.clear();
            return 'wrong';
        }

        // Pause token: skip automatically
        setResults(prev => {
            const next = [...prev];
            const newCursor = advancePastPauses(cursor, next);
            setCursor(newCursor);
            return next;
        });
        return 'pending';
    }, [isActive, cursor, tokens, advancePastPauses]);

    const reset = useCallback(() => {
        setSheetText('');
        setTokens([]);
        setCursor(0);
        setStartCursorState(0);
        setResults([]);
        setIsActive(false);
        chordBuffer.current.clear();
    }, []);

    return {
        sheetText,
        tokens,
        cursor,
        startCursor,
        results,
        isActive,
        isComplete,
        stats,
        noteTokens,
        loadSheet,
        start,
        stop,
        restart,
        setStartPosition,
        validateKey,
        reset,
    };
}
