import CountUp from 'react-countup'
import { getInterpolatedData } from '../data/economicData'
import { InflationChart, GDPChart, ExportChart } from './EconChart'

function StatCard({ label, value, unit, color, decimals = 1 }) {
    return (
        <div className="glass-panel p-3 mb-2">
            <div className="font-mono text-[10px] text-cyan-600 uppercase tracking-widest mb-1">{label}</div>
            <div className="flex items-end gap-1">
                <span className="stat-number" style={{ color }}>
                    <CountUp
                        end={value}
                        duration={1.2}
                        decimals={decimals}
                        separator=","
                        preserveValue
                    />
                </span>
                <span className="font-mono text-xs text-cyan-500 mb-1">{unit}</span>
            </div>
        </div>
    )
}

export default function HUD({ year, resolvedCount }) {
    const data = getInterpolatedData(year)
    const inflationColor = data.inflation > 100 ? '#ff2200' : data.inflation > 20 ? '#ff8800' : data.inflation > 10 ? '#ffcc00' : '#00ff88'
    const gdpColor = data.gdpGrowth < 0 ? '#ff4444' : '#00f5ff'
    const xpPoints = resolvedCount * 100

    return (
        <>
            {/* ── LEFT PANEL ─────────────────────────────────────────── */}
            <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-56 z-10 flex flex-col gap-2"
                style={{ animation: 'slideInLeft 0.6s ease-out' }}
            >
                {/* Context panel */}
                <div className="glass-panel p-3">
                    <div className="font-orbitron text-[10px] text-cyan-400 tracking-widest uppercase mb-1">
                        📅 Thời kỳ
                    </div>
                    <div className="font-orbitron text-sm font-bold text-yellow-400 leading-tight">
                        {data.headline}
                    </div>
                    <div className="font-mono text-[9px] text-cyan-600 mt-2 leading-relaxed">
                        {data.description.substring(0, 100)}...
                    </div>
                </div>

                {/* Inflation */}
                <StatCard
                    label="🔥 Lạm Phát"
                    value={Math.abs(data.inflation)}
                    unit="%/năm"
                    color={inflationColor}
                    decimals={1}
                />

                {/* GDP */}
                <StatCard
                    label="📈 Tăng Trưởng GDP"
                    value={data.gdpGrowth}
                    unit="%"
                    color={gdpColor}
                    decimals={1}
                />

                {/* Inflation chart */}
                <div className="glass-panel p-2">
                    <div className="font-mono text-[9px] text-cyan-600 mb-1 uppercase">Biểu đồ Lạm Phát</div>
                    <div style={{ height: 80 }}>
                        <InflationChart year={year} />
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────────────────────── */}
            <div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-56 z-10 flex flex-col gap-2"
                style={{ animation: 'slideInRight 0.6s ease-out' }}
            >
                {/* XP Score */}
                <div className="glass-panel p-3 text-center">
                    <div className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest">⚡ Điểm Đổi Mới</div>
                    <div className="font-orbitron text-3xl font-black neon-gold mt-1">
                        <CountUp end={xpPoints} duration={1} preserveValue />
                    </div>
                    <div className="font-mono text-[9px] text-cyan-700 mt-1">
                        {resolvedCount}/3 điểm nghẽn đã giải quyết
                    </div>
                    <div className="flex gap-1.5 justify-center mt-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-sm transition-all duration-500 ${i < resolvedCount
                                        ? 'bg-yellow-400 shadow-[0_0_8px_#ffd700]'
                                        : 'bg-cyan-900'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Export */}
                <StatCard
                    label="🚢 Kim Ngạch XK"
                    value={data.exportBillion}
                    unit="tỉ USD"
                    color="#00ff88"
                    decimals={1}
                />

                {/* FDI */}
                <StatCard
                    label="🏭 Vốn FDI"
                    value={data.fdi}
                    unit="tỉ USD"
                    color="#00aaff"
                    decimals={1}
                />

                {/* Export chart */}
                <div className="glass-panel p-2">
                    <div className="font-mono text-[9px] text-cyan-600 mb-1 uppercase">Xuất Khẩu & GDP</div>
                    <div style={{ height: 80 }}>
                        <GDPChart year={year} />
                    </div>
                </div>
            </div>

            {/* ── TOP BAR ─────────────────────────────────────────────── */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 text-center">
                <div className="font-orbitron text-[11px] text-cyan-500 tracking-[0.4em] uppercase">
                    Khu vực 3 · Mùa Xuân Đổi Mới · Đại Hội VI–XI
                </div>
                <div className="font-orbitron text-lg font-black neon-cyan tracking-widest">
                    KHỐI LẬP PHƯƠNG ĐỔI MỚI
                </div>
            </div>

            {/* ── POVERTY indicator ──────────────────────────────────── */}
            <div className="absolute top-16 right-3 z-10">
                <div className="glass-panel px-3 py-2 text-right">
                    <div className="font-mono text-[9px] text-cyan-600">Tỷ lệ nghèo</div>
                    <div className="font-mono text-sm font-bold" style={{ color: data.povertyRate > 40 ? '#ff4444' : '#00ff88' }}>
                        <CountUp end={data.povertyRate} duration={1.2} decimals={0} preserveValue />%
                    </div>
                </div>
            </div>
        </>
    )
}
