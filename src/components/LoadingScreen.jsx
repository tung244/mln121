import { useEffect, useState } from 'react'

const LOADING_LINES = [
    '> KHỞI TẠO HỆ THỐNG...',
    '> LOADING ECONOMIC DATABASE...',
    '> CALIBRATING 3D RENDERER...',
    '> CONNECTING AI MODULE...',
    '> TIMELINE: 1986 → 2011',
    '> SẴN SÀNG.',
]

export default function LoadingScreen({ onComplete }) {
    const [lineIndex, setLineIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [done, setDone] = useState(false)

    useEffect(() => {
        const total = LOADING_LINES.length
        let i = 0
        const iv = setInterval(() => {
            i++
            setLineIndex(i)
            setProgress(Math.round((i / total) * 100))
            if (i >= total) {
                clearInterval(iv)
                setTimeout(() => {
                    setDone(true)
                    setTimeout(onComplete, 600)
                }, 400)
            }
        }, 220)
        return () => clearInterval(iv)
    }, [onComplete])

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center cyber-grid transition-opacity duration-700 ${done ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            style={{ background: 'radial-gradient(ellipse at center, #020c1f 0%, #000 100%)' }}
        >
            {/* Logo / Title */}
            <div className="text-center mb-12 animate-float">
                <div className="font-orbitron text-[10px] tracking-[0.6em] text-cyan-400 opacity-60 mb-3 uppercase">
                    FPT University · MLN121 · 14 Khoảnh Khắc Mùa Xuân
                </div>
                <h1 className="font-orbitron text-4xl md:text-5xl font-black neon-cyan mb-2">
                    KHỐI LẬP PHƯƠNG ĐỔI MỚI
                </h1>
                <p className="font-mono text-sm text-cyan-300 opacity-70 tracking-widest">
                    THE INNOVATION CUBE · ĐẢNG XI - GIAI ĐOẠN 1986→2011
                </p>
            </div>

            {/* Spinning hex */}
            <div className="relative w-24 h-24 mb-10">
                <div
                    className="absolute inset-0 rounded-full border-2 border-cyan-500 opacity-30 animate-spin-slow"
                    style={{ borderTopColor: 'var(--neon-cyan)' }}
                />
                <div
                    className="absolute inset-3 rounded-full border border-cyan-300 opacity-20"
                    style={{ animation: 'spin-slow 10s linear infinite reverse' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-orbitron text-2xl neon-cyan">VI</span>
                </div>
            </div>

            {/* Terminal lines */}
            <div className="w-[380px] glass-panel p-5 mb-8 font-mono text-xs space-y-1.5 scanline-overlay">
                {LOADING_LINES.slice(0, lineIndex).map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-cyan-200">{line}</span>
                    </div>
                ))}
                {lineIndex < LOADING_LINES.length && (
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-3 bg-cyan-400 animate-pulse" />
                        <span className="text-cyan-400">{LOADING_LINES[lineIndex]}</span>
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="w-[380px]">
                <div className="flex justify-between font-mono text-xs text-cyan-500 mb-2">
                    <span>SYSTEM BOOT</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-cyan-900/40 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #00f5ff, #0080ff)',
                            boxShadow: '0 0 15px rgba(0,245,255,0.8)',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
