import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
    isLoaded: boolean;
}

interface PixelParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number; // 0 to 1
    size: number;
}

const hexToRgba = (hex: string, alpha: number) => {
    if (!hex || !hex.startsWith('#')) {
        return `rgba(13, 89, 242, ${alpha})`;
    }
    const r = parseInt(hex.slice(1, 3), 16) || 13;
    const g = parseInt(hex.slice(3, 5), 16) || 89;
    const b = parseInt(hex.slice(5, 7), 16) || 242;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const Visualizer: React.FC<VisualizerProps> = ({ isLoaded }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const particlesRef = useRef<PixelParticle[]>([]);
    
    // Cache key positions (left, width) by note name to prevent DOM layout thrashing (reflows) in the frame loop
    const keyLayouts = useRef<Map<string, { left: number; width: number }>>(new Map());

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        // Function to cache key locations. Only runs on mount and resize!
        const cacheLayouts = () => {
            const newLayouts = new Map<string, { left: number; width: number }>();
            const keyEls = document.querySelectorAll('.piano-container .key');
            const canvasRect = canvas.getBoundingClientRect();
            if (canvasRect.width === 0) return;

            keyEls.forEach(keyEl => {
                const note = keyEl.getAttribute('data-note');
                if (note) {
                    const rect = keyEl.getBoundingClientRect();
                    newLayouts.set(note, {
                        left: (rect.left - canvasRect.left) / canvasRect.width,
                        width: rect.width / canvasRect.width
                    });
                }
            });
            keyLayouts.current = newLayouts;
        };

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (width && height) {
                    const targetHeight = 60; 
                    const aspectRatio = width / height;
                    canvas.width = Math.round(targetHeight * aspectRatio);
                    canvas.height = targetHeight;
                    
                    const newCtx = canvas.getContext('2d');
                    if (newCtx) newCtx.imageSmoothingEnabled = false;

                    // Recalculate and cache key positions relative to the new canvas size
                    // Wait a tiny moment for layout to settle, then cache
                    setTimeout(cacheLayouts, 50);
                }
            }
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        // Starry background data
        const stars: Array<{ x: number; y: number; brightness: number }> = [];
        for (let i = 0; i < 15; i++) {
            stars.push({
                x: Math.random(),
                y: Math.random() * 0.7,
                brightness: Math.random()
            });
        }

        let frame = 0;

        const draw = () => {
            frame++;
            const w = canvas.width;
            const h = canvas.height;

            if (w === 0 || h === 0) {
                animationRef.current = requestAnimationFrame(draw);
                return;
            }

            const isDarkMode = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0d59f2';

            // Background
            ctx.fillStyle = isDarkMode ? '#0a0c10' : '#fcfbf8';
            ctx.fillRect(0, 0, w, h);

            // Starry sky
            stars.forEach(s => {
                s.brightness += (Math.random() - 0.5) * 0.12;
                s.brightness = Math.min(1, Math.max(0.1, s.brightness));
                ctx.fillStyle = hexToRgba(accentColor, s.brightness * (isDarkMode ? 0.5 : 0.25));
                ctx.fillRect(Math.floor(s.x * w), Math.floor(s.y * h), 1, 1);
            });

            // Find active keys in DOM. We read class list which does NOT trigger reflow/layout thrashing
            const activeKeyEls = document.querySelectorAll('.piano-container .key.active');
            const hasActiveKeys = activeKeyEls.length > 0;

            // 1. Draw glowing background beams and spawn particles for active keys (using pre-cached layouts)
            if (hasActiveKeys) {
                activeKeyEls.forEach(keyEl => {
                    const note = keyEl.getAttribute('data-note');
                    if (note) {
                        const layout = keyLayouts.current.get(note);
                        if (layout) {
                            const bx = Math.floor(layout.left * w);
                            const bWidth = Math.max(2, Math.round(layout.width * w));

                            // Glowing background beams
                            ctx.fillStyle = hexToRgba(accentColor, isDarkMode ? 0.10 : 0.05);
                            ctx.fillRect(bx, 0, bWidth, h);

                            // Retro vertical dashes inside the beam
                            ctx.fillStyle = hexToRgba(accentColor, isDarkMode ? 0.25 : 0.12);
                            const beamYOffset = (frame * 1.5) % 10;
                            for (let y = h; y > 0; y -= 10) {
                                ctx.fillRect(bx, Math.round(y - beamYOffset), bWidth, 1);
                            }

                            // Spawn floating particles
                            if (Math.random() > 0.45) {
                                particlesRef.current.push({
                                    x: bx + Math.random() * bWidth,
                                    y: h - 4,
                                    vx: (Math.random() - 0.5) * 0.8,
                                    vy: -Math.random() * 1.3 - 0.5,
                                    color: accentColor,
                                    life: 1.0,
                                    size: Math.random() > 0.6 ? 2 : 1
                                });
                            }
                        }
                    }
                });
            }

            // 2. Draw 3 layered sine waves (morphing/pulling towards active keys using cached layouts)
            for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
                ctx.beginPath();
                const frequency = 0.05 + waveIdx * 0.03; 
                const baseAmplitude = 5 + waveIdx * 3;
                const speed = 0.05 + waveIdx * 0.02;

                ctx.strokeStyle = hexToRgba(accentColor, isDarkMode 
                    ? (0.35 - waveIdx * 0.08) 
                    : (0.22 - waveIdx * 0.05)
                );
                ctx.lineWidth = Math.max(1, 3 - waveIdx);

                for (let x = 0; x < w; x += 2) {
                    let y = h * 0.55 + Math.sin(x * frequency + frame * speed) * baseAmplitude;

                    // Morphing: distort wave Y position towards active keys (Gaussian pluck using cached positions)
                    if (hasActiveKeys) {
                        activeKeyEls.forEach(keyEl => {
                            const note = keyEl.getAttribute('data-note');
                            if (note) {
                                const layout = keyLayouts.current.get(note);
                                if (layout) {
                                    const cx = (layout.left + layout.width / 2) * w;
                                    const kw = layout.width * w;

                                    const dx = x - cx;
                                    const sigma = kw * 0.8;
                                    const influence = Math.exp(-(dx * dx) / (2 * sigma * sigma));
                                    
                                    // Pull the wave upwards at the active key's X coordinate
                                    const pullAmount = influence * (h * 0.45 + waveIdx * 5);
                                    y -= pullAmount;
                                }
                            }
                        });
                    }

                    if (x === 0) ctx.moveTo(x, Math.round(y));
                    else ctx.lineTo(x, Math.round(y));
                }
                ctx.stroke();
            }

            // 3. Draw and update particles
            const activeParticles = particlesRef.current.filter(p => p.life > 0);
            activeParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.025; 

                if (p.life > 0) {
                    ctx.fillStyle = hexToRgba(p.color, p.life);
                    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
                }
            });
            particlesRef.current = activeParticles;

            // Bottom floor line
            ctx.fillStyle = hexToRgba(accentColor, 0.12);
            ctx.fillRect(0, h - 2, w, 1);

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            resizeObserver.disconnect();
        };
    }, [isLoaded]);

    return (
        <div className="visualizer-container">
            <canvas ref={canvasRef} className="visualizer-canvas" />
        </div>
    );
};
