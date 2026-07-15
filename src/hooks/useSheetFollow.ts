import { useState, useCallback, useRef, useMemo } from 'react';
import { parseSheet, type SheetToken } from '../domain/sheetParser';

export type TokenResult = 'correct' | 'wrong' | 'pending';

export interface SheetFollowStats {
    correct: number;
    wrong: number;
    total: number;
    accuracy: number;
    /** Duration in ms from first note to completion */
    durationMs: number;
}

export interface SheetFollowState {
    sheetText: string;
    tokens: SheetToken[];
    cursor: number;
    startCursor: number;
    results: TokenResult[];
    isActive: boolean;
    isComplete: boolean;
    stats: SheetFollowStats;
}

export function useSheetFollow() {
    const [sheetText, setSheetText] = useState('');
    const [tokens, setTokens] = useState<SheetToken[]>([]);
    const [cursor, setCursor] = useState(0);
    const [startCursor, setStartCursorState] = useState(0);
    const [results, setResults] = useState<TokenResult[]>([]);
    const [isActive, setIsActive] = useState(false);

    const chordBuffer = useRef<Set<string>>(new Set());

    // Timing data for rhythm scoring
    const startTimeRef = useRef<number>(0);
    const noteTimestamps = useRef<number[]>([]);

    const noteTokens = useMemo(
        () => tokens.filter(t => t.type === 'note' || t.type === 'chord'),
        [tokens]
    );

    const isComplete = isActive && cursor >= tokens.length;

    const stats: SheetFollowStats = useMemo(() => {
        // Only count results for playable tokens (note/chord), not pauses
        let correct = 0;
        let wrong = 0;
        for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i];
            if (t.type === 'note' || t.type === 'chord') {
                if (results[i] === 'correct') correct++;
                if (results[i] === 'wrong') wrong++;
            }
        }
        const playable = noteTokens.length;
        const total = correct + wrong;
        const accuracy = playable > 0 ? Math.min(100, Math.round((correct / playable) * 100)) : 0;

        const durationMs = noteTimestamps.current.length > 0
            ? noteTimestamps.current[noteTimestamps.current.length - 1] - startTimeRef.current
            : 0;

        return { correct, wrong, total, accuracy, durationMs };
    }, [results, tokens, noteTokens]);

    const loadSheet = useCallback((text: string) => {
        const parsed = parseSheet(text);
        setSheetText(text);
        setTokens(parsed);
        setCursor(0);
        setStartCursorState(0);
        setResults(new Array(parsed.length).fill('pending'));
        setIsActive(false);
        chordBuffer.current.clear();
        noteTimestamps.current = [];
        startTimeRef.current = 0;
    }, []);

    const start = useCallback(() => {
        if (tokens.length === 0) return;
        const startResults = results.map((r, i) => i >= startCursor ? 'pending' as TokenResult : r);
        let idx = startCursor;
        while (idx < tokens.length && tokens[idx].type === 'pause') {
            startResults[idx] = 'correct';
            idx++;
        }
        setCursor(idx);
        setResults(startResults);
        setIsActive(true);
        chordBuffer.current.clear();
        noteTimestamps.current = [];
        startTimeRef.current = Date.now();
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
        noteTimestamps.current = [];
        startTimeRef.current = Date.now();
    }, [startCursor, tokens, results]);

    const setStartPosition = useCallback((index: number) => {
        if (index >= 0 && index < tokens.length) {
            setStartCursorState(index);
        }
    }, [tokens.length]);

    const advancePastPauses = useCallback((fromIndex: number, resultsCopy: TokenResult[]) => {
        let idx = fromIndex;
        while (idx < tokens.length && tokens[idx].type === 'pause') {
            resultsCopy[idx] = 'correct';
            idx++;
        }
        return idx;
    }, [tokens]);

    const validateKey = useCallback((key: string): TokenResult => {
        if (!isActive || cursor >= tokens.length) return 'pending';

        const token = tokens[cursor];

        if (token.type === 'note') {
            const isCorrect = token.key.toLowerCase() === key.toLowerCase();
            const result: TokenResult = isCorrect ? 'correct' : 'wrong';

            noteTimestamps.current.push(Date.now());

            setResults(prev => {
                const next = [...prev];
                next[cursor] = result;
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

                const allPressed = expectedKeys.every(k => chordBuffer.current.has(k));
                if (allPressed) {
                    noteTimestamps.current.push(Date.now());

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

            noteTimestamps.current.push(Date.now());

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
        noteTimestamps.current = [];
        startTimeRef.current = 0;
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
