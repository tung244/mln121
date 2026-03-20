import React, { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

function formatTime(secs) {
    if (!secs || isNaN(secs)) return '00:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export default function MapAudioPlayer({ src, title = "Thuyết minh Map" }) {
    const [isStarted, setIsStarted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const isDragging = useRef(false);
    const dragStartLocation = useRef({ x: 0, y: 0 });
    const dragStartOffset = useRef({ x: 0, y: 0 });

    const {
        isPlaying, duration, currentTime, volume, playbackRate,
        togglePlay, seek, setVolume, setPlaybackRate
    } = useAudioPlayer(src);

    // Reset UI khi đổi map (source audio đổi)
    useEffect(() => {
        setIsStarted(false);
        setIsCollapsed(false);
        setOffset({ x: 0, y: 0 });
    }, [src]);

    const handleStart = () => {
        setIsStarted(true);
        setOffset({ x: 0, y: 0 });
        if (!isPlaying) togglePlay(); // tự động Play (có Fade-in trong hook)
    };

    const handleClose = () => {
        if (isPlaying) togglePlay(); // fade out to pause
        setIsStarted(false);
        setOffset({ x: 0, y: 0 });
        setIsCollapsed(false);
    };

    // Drag handlers
    const handleMouseDown = (e) => {
        // Prevent dragging when clicking buttons inside the header
        if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) {
            return;
        }
        isDragging.current = true;
        dragStartLocation.current = { x: e.clientX, y: e.clientY };
        dragStartOffset.current = { ...offset };
        document.body.style.userSelect = 'none'; // Prevent highlighting text while dragging
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const dx = e.clientX - dragStartLocation.current.x;
            const dy = e.clientY - dragStartLocation.current.y;
            setOffset({
                x: dragStartOffset.current.x + dx,
                y: dragStartOffset.current.y + dy
            });
        };
        const handleMouseUp = () => {
            isDragging.current = false;
            document.body.style.userSelect = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (!src) return null;

    if (!isStarted) {
        return (
            <div className="absolute bottom-6 right-6 z-50">
                <button
                    onClick={handleStart}
                    className="flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-base font-bold transition-all hover:scale-105 border-2 border-cyan-400 bg-black/60 text-cyan-200 shadow-[0_0_20px_rgba(0,255,255,0.4)] backdrop-blur-md hover:bg-cyan-900/60"
                >
                    <span className="text-2xl leading-none text-cyan-400 animate-pulse">▶</span> Nghe thuyết minh
                </button>
            </div>
        );
    }

    return (
        <div 
            className="absolute bottom-6 right-6 z-50 bg-black/80 backdrop-blur-xl border border-cyan-500/50 rounded-xl shadow-[0_0_20px_rgba(0,255,255,0.2)] overflow-hidden transition-colors duration-300 animate-fade-in-up flex flex-col"
            style={{ 
                transform: `translate(${offset.x}px, ${offset.y}px)`, 
                width: isCollapsed ? '240px' : '320px'
            }}
        >
            {/* Header phần player mini (Draggable area) */}
            <div 
                className="flex items-center justify-between p-3 bg-cyan-950/50 border-b border-cyan-500/30 cursor-move hover:bg-cyan-900/50 transition-colors"
                onMouseDown={handleMouseDown}
                title="Kéo thả để di chuyển"
            >
                <div className="flex items-center gap-2 pointer-events-none">
                    <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-cyan-400 shadow-[0_0_8px_#00ffff] animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-cyan-200 font-mono font-bold text-[10px] truncate max-w-[130px] uppercase tracking-wider select-none">{title}</span>
                </div>
                
                {/* Header Controls */}
                <div className="flex items-center gap-2">
                    {/* Play/Pause nhỏ khi thu gọn */}
                    {isCollapsed && (
                        <button
                            onClick={togglePlay}
                            className="w-6 h-6 flex items-center justify-center text-cyan-300 hover:text-white transition-colors"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                    )}
                    {/* Minimize Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="text-cyan-400 font-mono font-bold text-lg hover:text-white transition-colors px-1 leading-none"
                        title={isCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                        {isCollapsed ? '□' : '−'}
                    </button>
                    {/* Close / Stop */}
                    <button
                        onClick={handleClose}
                        className="text-red-400 font-mono font-bold hover:text-red-300 transition-colors px-1 ml-1"
                        title="Đóng / Dừng"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Body - Controls and Bars (Hidden when collapsed) */}
            <div 
                className="flex flex-col gap-3 transition-all duration-300 ease-in-out origin-top"
                style={{ 
                    maxHeight: isCollapsed ? '0px' : '200px', 
                    padding: isCollapsed ? '0px' : '16px',
                    opacity: isCollapsed ? 0 : 1,
                    visibility: isCollapsed ? 'hidden' : 'visible'
                }}
            >
                {/* Speed control */}
                <div className="flex justify-end">
                    <select
                        value={playbackRate}
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="bg-black/50 text-cyan-300 font-mono text-[10px] rounded px-1.5 py-1 outline-none border border-cyan-700 cursor-pointer hover:border-cyan-400 transition-colors"
                    >
                        <option value="0.75">0.75x Speed</option>
                        <option value="1">1.00x Speed</option>
                        <option value="1.25">1.25x Speed</option>
                        <option value="1.5">1.50x Speed</option>
                    </select>
                </div>

                {/* Thanh Progress */}
                <div className="flex flex-col gap-1">
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[10px] text-cyan-500 font-mono mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Các Control: Play/Pause và Volume */}
                <div className="flex items-center justify-between mt-2">
                    {/* Play/Pause lớn */}
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center bg-cyan-500/10 border border-cyan-400 text-cyan-300 rounded-full hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_15px_#00ffff] transition-all hover:scale-105"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2 w-32 group">
                        <svg className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-1 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                    </div>
                </div>
            </div>
            {/* Custom css animation style inline */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in-up {
                    0% { margin-bottom: -20px; opacity: 0; }
                    100% { margin-bottom: 0px; opacity: 1; }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}} />
        </div>
    );
}
