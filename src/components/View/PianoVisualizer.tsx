import React, { useEffect, useState } from 'react';

interface PianoVisualizerProps {
    activeNotes: Set<string>;
    lastVelocity: number;
}

const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ activeNotes, lastVelocity }) => {
    const [bars, setBars] = useState<number[]>(new Array(40).fill(0));

    useEffect(() => {
        // Generate some "random-ish" heights for non-active bars to match the aesthetic
        // and make active bars taller based on velocity or just note presence
        const newBars = bars.map((height, i) => {
            if (activeNotes.size > 0 && i % 3 === 0) {
                return Math.min(100, Math.max(20, lastVelocity * 100));
            }
            return Math.max(0, height - 5); // decay
        });
        setBars(newBars);
    }, [activeNotes, lastVelocity]);

    return (
        <div className="display-area">
            <div className="grid-overlay" />

            <div className="velocity-display">
                <span className="velocity-label">Velocity</span>
                <span className="velocity-value">{Math.round(lastVelocity * 127) || 0}</span>
            </div>

            <div className="visualizer-container">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className={`viz-bar ${height > 0 ? 'active' : ''}`}
                        style={{
                            height: `${10 + height}%`,
                            opacity: height > 0 ? 1 : 0.3
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default PianoVisualizer;
