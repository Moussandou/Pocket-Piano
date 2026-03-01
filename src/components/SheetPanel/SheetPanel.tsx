import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { sheetRepository } from '../../infra/repositories/sheetRepository';
import { tokenLabel, type SheetToken } from '../../domain/sheetParser';
import type { TokenResult, SheetFollowStats } from '../../hooks/useSheetFollow';
import type { Sheet } from '../../domain/models';
import './SheetPanel.css';

interface SheetPanelProps {
    tokens: SheetToken[];
    cursor: number;
    startCursor: number;
    results: TokenResult[];
    isActive: boolean;
    isComplete: boolean;
    stats: SheetFollowStats;
    sheetText: string;
    onLoadSheet: (text: string) => void;
    onStart: () => void;
    onStop: () => void;
    onRestart: () => void;
    onSetStartPosition: (index: number) => void;
    onReset: () => void;
    visible: boolean;
    onClose: () => void;
    savedSheets: Sheet[];
}

export const SheetPanel: React.FC<SheetPanelProps> = ({
    tokens,
    cursor,
    startCursor,
    results,
    isActive,
    isComplete,
    stats,
    sheetText,
    onLoadSheet,
    onStart,
    onStop,
    onRestart,
    onSetStartPosition,
    onReset,
    visible,
    onClose,
    savedSheets,
}) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [editMode, setEditMode] = useState(!sheetText);
    const [inputText, setInputText] = useState(sheetText);
    const [saveName, setSaveName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);
    const [showSheetPicker, setShowSheetPicker] = useState(false);
    const [lastResult, setLastResult] = useState<{ index: number; result: TokenResult } | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Sync input text when sheetText changes externally
    useEffect(() => {
        setInputText(sheetText);
        if (sheetText) setEditMode(false);
    }, [sheetText]);

    // Auto-scroll to active token
    useEffect(() => {
        if (!trackRef.current || !isActive) return;
        const activeEl = trackRef.current.querySelector('.sheet-token.active');
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [cursor, isActive]);

    // Track last result for animation
    useEffect(() => {
        if (cursor > 0 && results[cursor - 1] !== 'pending') {
            setLastResult({ index: cursor - 1, result: results[cursor - 1] });
            const timer = setTimeout(() => setLastResult(null), 400);
            return () => clearTimeout(timer);
        }
    }, [cursor, results]);

    const handleLoadClick = () => {
        if (inputText.trim()) {
            onLoadSheet(inputText.trim());
            setEditMode(false);
        }
    };

    const handleSave = async () => {
        if (!user || !saveName.trim() || !sheetText) return;
        await sheetRepository.add({
            userId: user.uid,
            name: saveName.trim(),
            content: sheetText,
            timestamp: Date.now(),
        });
        setSaveName('');
        setShowSaveInput(false);
    };

    const handlePickSheet = (sheet: Sheet) => {
        onLoadSheet(sheet.content);
        setShowSheetPicker(false);
    };

    const progress = tokens.length > 0
        ? Math.round((results.filter(r => r !== 'pending').length / tokens.length) * 100)
        : 0;

    if (!visible) return null;

    return (
        <div className="sheet-panel slide-in">
            <div className="sheet-panel-header">
                <div className="sheet-panel-title">
                    <span className="material-symbols-outlined">music_note</span>
                    <span>{t('sheet.title', 'Partition')}</span>
                </div>
                <div className="sheet-panel-actions">
                    {!editMode && sheetText && (
                        <>
                            <button
                                className="sheet-btn-icon"
                                onClick={() => setShowSheetPicker(!showSheetPicker)}
                                title={t('sheet.loadSaved', 'Charger une partition')}
                            >
                                <span className="material-symbols-outlined">folder_open</span>
                            </button>
                            <button
                                className="sheet-btn-icon"
                                onClick={() => { setShowSaveInput(!showSaveInput); }}
                                title={t('sheet.save', 'Sauvegarder')}
                            >
                                <span className="material-symbols-outlined">save</span>
                            </button>
                            <button
                                className="sheet-btn-icon"
                                onClick={() => { setEditMode(true); onStop(); }}
                                title={t('sheet.edit', 'Modifier')}
                            >
                                <span className="material-symbols-outlined">edit</span>
                            </button>
                        </>
                    )}
                    <button className="sheet-btn-icon" onClick={onClose} title={t('common.close', 'Fermer')}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            {/* Save bar */}
            {showSaveInput && (
                <div className="sheet-save-bar">
                    <input
                        className="sheet-save-input"
                        type="text"
                        placeholder={t('sheet.sheetName', 'Nom de la partition...')}
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                        autoFocus
                    />
                    <button
                        className="sheet-btn-sm"
                        onClick={handleSave}
                        disabled={!saveName.trim() || !user}
                    >
                        {t('sheet.saveBtn', 'Sauvegarder')}
                    </button>
                </div>
            )}

            {/* Sheet picker dropdown */}
            {showSheetPicker && (
                <div className="sheet-picker-dropdown">
                    {savedSheets.length === 0 ? (
                        <div className="sheet-picker-empty">{t('sheet.noSavedSheets', 'Aucune partition sauvegardée')}</div>
                    ) : (
                        savedSheets.map(s => (
                            <button key={s.id} className="sheet-picker-item" onClick={() => handlePickSheet(s)}>
                                <span className="material-symbols-outlined">description</span>
                                <span>{s.name}</span>
                            </button>
                        ))
                    )}
                </div>
            )}

            {editMode ? (
                <div className="sheet-edit-area">
                    <textarea
                        className="sheet-textarea"
                        placeholder={t('sheet.placeholder', 'Collez votre partition ici...\nEx: asdf [gh] j|k l')}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        rows={4}
                    />
                    <div className="sheet-edit-footer">
                        <button
                            className="sheet-btn-sm"
                            onClick={() => setShowSheetPicker(!showSheetPicker)}
                        >
                            <span className="material-symbols-outlined">folder_open</span>
                            {t('sheet.loadSaved', 'Charger')}
                        </button>
                        <button
                            className="sheet-btn-primary"
                            onClick={handleLoadClick}
                            disabled={!inputText.trim()}
                        >
                            <span className="material-symbols-outlined">done</span>
                            {t('sheet.load', 'Charger la partition')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="sheet-follow-area">
                    {/* Token track */}
                    <div className="sheet-token-track" ref={trackRef}>
                        {tokens.map((token, i) => (
                            <SheetTokenElement
                                key={i}
                                token={token}
                                index={i}
                                result={results[i]}
                                isCurrent={i === cursor}
                                isStartMarker={i === startCursor}
                                animResult={lastResult?.index === i ? lastResult.result : null}
                                onClick={() => {
                                    if (!isActive) onSetStartPosition(i);
                                }}
                            />
                        ))}
                    </div>

                    {/* Controls bar */}
                    <div className="sheet-controls">
                        <div className="sheet-controls-left">
                            {!isActive ? (
                                <button className="sheet-btn-primary" onClick={onStart}>
                                    <span className="material-symbols-outlined">play_arrow</span>
                                    {t('sheet.start', 'Jouer')}
                                </button>
                            ) : (
                                <button className="sheet-btn-sm sheet-btn-stop" onClick={onStop}>
                                    <span className="material-symbols-outlined">stop</span>
                                    {t('sheet.stop', 'Stop')}
                                </button>
                            )}

                            <button className="sheet-btn-sm" onClick={onRestart} title={t('sheet.restart', 'Recommencer')}>
                                <span className="material-symbols-outlined">replay</span>
                            </button>

                            <button className="sheet-btn-sm" onClick={() => { onReset(); setEditMode(true); }} title={t('sheet.newSheet', 'Nouvelle partition')}>
                                <span className="material-symbols-outlined">note_add</span>
                            </button>
                        </div>

                        <div className="sheet-controls-right">
                            <div className="sheet-stats">
                                <span className="sheet-stat correct">{stats.correct}</span>
                                <span className="sheet-stat-sep">/</span>
                                <span className="sheet-stat wrong">{stats.wrong}</span>
                                <span className="sheet-stat-sep">/</span>
                                <span className="sheet-stat total">{stats.total}</span>
                            </div>
                            <div className="sheet-progress-bar">
                                <div className="sheet-progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Results screen */}
                    {isComplete && (
                        <SheetResults stats={stats} onRestart={onRestart} />
                    )}
                </div>
            )}
        </div>
    );
};

/* Individual token element */
interface SheetTokenElementProps {
    token: SheetToken;
    index: number;
    result: TokenResult;
    isCurrent: boolean;
    isStartMarker: boolean;
    animResult: TokenResult | null;
    onClick: () => void;
}

const SheetTokenElement: React.FC<SheetTokenElementProps> = ({
    token,
    index,
    result,
    isCurrent,
    isStartMarker,
    animResult,
    onClick,
}) => {
    const isPause = token.type === 'pause';
    const classes = [
        'sheet-token',
        isPause ? 'pause' : '',
        isPause ? `pause-${token.duration}` : '',
        isCurrent ? 'active' : '',
        result === 'correct' ? 'correct' : '',
        result === 'wrong' ? 'wrong' : '',
        isStartMarker ? 'start-marker' : '',
        animResult === 'correct' ? 'anim-correct' : '',
        animResult === 'wrong' ? 'anim-wrong' : '',
    ].filter(Boolean).join(' ');

    return (
        <button className={classes} onClick={onClick} data-index={index}>
            <span className="sheet-token-label">{tokenLabel(token)}</span>
            {isStartMarker && <span className="start-indicator" />}
        </button>
    );
};

/* Results screen */
interface SheetResultsProps {
    stats: SheetFollowStats;
    onRestart: () => void;
}

function getVerdict(rating: number): { label: string; icon: string } {
    if (rating >= 900) return { label: 'Parfait !', icon: 'military_tech' };
    if (rating >= 750) return { label: 'Excellent', icon: 'stars' };
    if (rating >= 600) return { label: 'Bien joue', icon: 'thumb_up' };
    if (rating >= 400) return { label: 'Presque, continue', icon: 'trending_up' };
    return { label: 'Continue de pratiquer', icon: 'fitness_center' };
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
}

const SheetResults: React.FC<SheetResultsProps> = ({ stats, onRestart }) => {
    const verdict = getVerdict(stats.rating);

    return (
        <div className="sheet-results">
            <div className="sheet-results-verdict">
                <span className="material-symbols-outlined sheet-results-verdict-icon">{verdict.icon}</span>
                <span className="sheet-results-verdict-label">{verdict.label}</span>
            </div>

            <div className="sheet-results-rating">
                <span className="sheet-results-rating-label">Score</span>
                <span className="sheet-results-rating-value">{stats.rating}</span>
            </div>

            <div className="sheet-results-grid">
                <div className="sheet-results-metric">
                    <span className="sheet-results-metric-label">Precision</span>
                    <span className="sheet-results-metric-value">{stats.accuracy}%</span>
                </div>
                <div className="sheet-results-metric">
                    <span className="sheet-results-metric-label">Rythme</span>
                    <span className="sheet-results-metric-value">{stats.rhythm}%</span>
                </div>
                <div className="sheet-results-metric">
                    <span className="sheet-results-metric-label">Difficulte</span>
                    <span className="sheet-results-metric-value sheet-results-stars">
                        {'★'.repeat(stats.difficulty)}{'☆'.repeat(5 - stats.difficulty)}
                    </span>
                </div>
                <div className="sheet-results-metric">
                    <span className="sheet-results-metric-label">Temps</span>
                    <span className="sheet-results-metric-value">{formatDuration(stats.durationMs)}</span>
                </div>
            </div>

            <div className="sheet-results-detail">
                {stats.correct}/{stats.total} notes correctes
            </div>

            <button className="sheet-btn-primary sheet-results-replay" onClick={onRestart}>
                <span className="material-symbols-outlined">replay</span>
                Rejouer
            </button>
        </div>
    );
};
