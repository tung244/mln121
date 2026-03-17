import { CONGRESSES } from '../data/economicData'

export default function TimelineSlider({ year, onChange }) {
    const min = 1986
    const max = 2026
    const progress = ((year - min) / (max - min)) * 100

    return (
        <div className="glass-panel px-6 py-4 w-full animate-neon-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-orbitron text-xs text-cyan-400 tracking-widest uppercase">
                        Đường lối Đổi Mới · 40 Năm Lịch Sử
                    </span>
                </div>
                <div className="font-orbitron text-2xl font-black neon-gold tracking-widest">
                    {Math.floor(year)}
                </div>
            </div>

            {/* Slider */}
            <input
                type="range"
                min={min}
                max={max}
                step="0.1"
                value={year}
                onChange={(e) => onChange(Number(e.target.value))}
                className="timeline-slider w-full"
                style={{ '--progress': `${progress}%` }}
            />

            {/* Congress markers */}
            <div className="relative mt-3">
                <div className="flex">
                    {CONGRESSES.map((c, idx) => {
                        const pct = ((c.year - min) / (max - min)) * 100
                        const isActive = year >= c.year && (
                            idx === CONGRESSES.length - 1 ? true : year < CONGRESSES[idx + 1].year
                        )
                        return (
                            <div
                                key={c.year}
                                className="absolute flex flex-col items-center cursor-pointer group -translate-x-1/2"
                                style={{ left: `${pct}%` }}
                                onClick={() => onChange(c.year)}
                            >
                                <div
                                    className={`w-2 h-2 rounded-full mb-1 transition-all duration-300 ${isActive ? 'bg-yellow-400 shadow-[0_0_8px_#ffd700] scale-125' : 'bg-cyan-800 group-hover:bg-cyan-500'
                                        }`}
                                />
                                <div className={`font-orbitron text-center transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'text-cyan-700 group-hover:text-cyan-400'}`}>
                                    <div className="text-[8px] leading-tight hidden sm:block">ĐH {c.label}</div>
                                    <div className="text-[7px] opacity-70 hidden md:block">{c.year}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div style={{ height: 28 }} />
            </div>

            {/* Instruction */}
            <div className="mt-1 text-center font-mono text-[10px] text-cyan-700 tracking-widest">
                ← KÉO ĐỂ DU HÀNH THỜI GIAN 1986 → 2026 →
            </div>
        </div>
    )
}
