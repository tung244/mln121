import { useState, useCallback, useEffect, useRef } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Scene3D from './components/Scene3D'
import TimelineSlider from './components/TimelineSlider'
import HUD from './components/HUD'
import ToastNotif from './components/ToastNotif'
import AIChatbox from './components/AIChatbox'

// ── Sound via Web Audio API ───────────────────────────────────────────────────
function playTing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch (_) { }
}

function playSlide(t) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const freq = 200 + t * 600
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.05, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch (_) { }
}

// ── API Key Modal ─────────────────────────────────────────────────────────────
function ApiKeyModal({ onSave, onClose }) {
  const [key, setKey] = useState('')
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="glass-panel p-6 w-96" style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="font-orbitron text-base font-bold neon-cyan mb-2">🔑 Gemini API Key</div>
        <p className="font-mono text-xs text-cyan-600 mb-4 leading-relaxed">
          Nhập API Key từ{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 underline">
            Google AI Studio
          </a>{' '}
          để kích hoạt trợ lý AI.
        </p>
        <input
          autoFocus
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && key && onSave(key)}
          placeholder="AIza..."
          className="w-full bg-transparent border border-cyan-700 rounded-xl px-4 py-2 font-mono text-sm text-cyan-200 outline-none focus:border-cyan-400 mb-4 transition-colors"
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-mono text-xs text-cyan-600 border border-cyan-900 hover:border-cyan-700 transition-colors"
          >
            Bỏ qua
          </button>
          <button
            onClick={() => key && onSave(key)}
            className="px-5 py-2 rounded-xl font-orbitron text-xs font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #006688, #003355)',
              border: '1px solid var(--neon-cyan)',
              boxShadow: '0 0 15px rgba(0,245,255,0.3)',
              color: '#00f5ff',
            }}
          >
            Kích Hoạt AI ⚡
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spark effect on dot resolve ───────────────────────────────────────────────
function SparkContainer({ sparks }) {
  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      {sparks.map((s) => (
        <div
          key={s.id}
          className="spark"
          style={{
            left: s.x,
            top: s.y,
            '--dx': `${s.dx}px`,
            '--dy': `${s.dy}px`,
          }}
        />
      ))}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [year, setYear] = useState(1986)
  const [resolvedDots, setResolvedDots] = useState([])
  const [toasts, setToasts] = useState([])
  const [sparks, setSparks] = useState([])
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_key') || '')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const lastSlideRef = useRef(0)

  const addToast = useCallback((message, type = 'xp', icon = '⚡', duration = 2500) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, icon }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const fireSparks = useCallback((count = 12) => {
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2
    const newSparks = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const dist = 60 + Math.random() * 80
      return {
        id: Date.now() + i,
        x: cx,
        y: cy,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
      }
    })
    setSparks((prev) => [...prev, ...newSparks])
    setTimeout(() => setSparks((prev) => prev.filter((s) => !newSparks.find((n) => n.id === s.id))), 700)
  }, [])

  const handleDotClick = useCallback(
    (index) => {
      if (resolvedDots.includes(index)) return
      playTing()
      fireSparks(16)
      setResolvedDots((prev) => [...prev, index])

      const DOT_MESSAGES = [
        { msg: '+100 Điểm Đổi Mới! — Xóa bỏ cơ chế bao cấp', icon: '🔓' },
        { msg: '+100 Điểm Đổi Mới! — Mở cửa thị trường', icon: '🌐' },
        { msg: '+100 Điểm Đổi Mới! — Giải phóng sức sản xuất', icon: '⚙️' },
      ]
      const { msg, icon } = DOT_MESSAGES[index] || { msg: '+100 Điểm Đổi Mới!', icon: '⚡' }
      addToast(msg, 'xp', icon)

      if (resolvedDots.length + 1 >= 3) {
        setTimeout(() => addToast('🎉 Cơ chế cũ đã bị phá vỡ! Chào mừng Đổi Mới!', 'success', '🌟', 4000), 800)
      }
    },
    [resolvedDots, addToast, fireSparks]
  )

  const handleYearChange = useCallback(
    (newYear) => {
      setYear(newYear)
      const now = Date.now()
      if (now - lastSlideRef.current > 80) {
        const t = (newYear - 1986) / (2011 - 1986)
        playSlide(t)
        lastSlideRef.current = now
      }
    },
    []
  )

  const saveApiKey = useCallback((key) => {
    setApiKey(key)
    localStorage.setItem('gemini_key', key)
    setShowKeyModal(false)
    addToast('AI đã được kích hoạt! 🤖', 'success', '✅')
  }, [addToast])

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {loaded && (
        <div className="fixed inset-0 overflow-hidden cyber-grid" style={{ background: 'radial-gradient(ellipse at 50% 40%, #020c1f 0%, #000 100%)' }}>
          {/* 3D Scene — full background */}
          <div className="absolute inset-0 z-0">
            <Scene3D year={year} resolvedDots={resolvedDots} onDotClick={handleDotClick} />
          </div>

          {/* HUD layer */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <HUD year={year} resolvedCount={resolvedDots.length} />
            </div>
          </div>

          {/* Bottom Timeline */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[55%] min-w-[500px] max-w-[800px]"
            style={{ animation: 'slideUp 0.6s ease-out' }}
          >
            <TimelineSlider year={year} onChange={handleYearChange} />
          </div>

          {/* Toasts */}
          <ToastNotif toasts={toasts} />

          {/* Sparks */}
          <SparkContainer sparks={sparks} />

          {/* AI Chatbox */}
          <AIChatbox
            apiKey={apiKey}
            onRequestKey={() => setShowKeyModal(true)}
          />

          {/* API key button (top right corner) */}
          {!apiKey && (
            <button
              onClick={() => setShowKeyModal(true)}
              className="fixed top-4 right-4 z-20 px-3 py-1.5 rounded-lg font-mono text-[10px] transition-all hover:scale-105"
              style={{
                background: 'rgba(0,20,40,0.8)',
                border: '1px solid rgba(0,245,255,0.3)',
                color: '#00f5ff',
                backdropFilter: 'blur(8px)',
              }}
            >
              🔑 Kích hoạt AI
            </button>
          )}
          {apiKey && (
            <button
              onClick={() => { setApiKey(''); localStorage.removeItem('gemini_key') }}
              className="fixed top-4 right-4 z-20 px-3 py-1.5 rounded-lg font-mono text-[10px] opacity-40 hover:opacity-80 transition-opacity"
              style={{
                background: 'rgba(0,20,40,0.8)',
                border: '1px solid rgba(0,245,255,0.2)',
                color: '#00f5ff',
                backdropFilter: 'blur(8px)',
              }}
            >
              ✓ AI active
            </button>
          )}

          {/* Hint for 1986 dots */}
          {year <= 1995 && resolvedDots.length < 3 && (
            <div
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 font-mono text-[10px] text-red-400 animate-pulse"
              style={{ textShadow: '0 0 10px #ff0000' }}
            >
              ⚠ Click vào các điểm đỏ nhấp nháy để giải quyết điểm nghẽn kinh tế!
            </div>
          )}
        </div>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <ApiKeyModal onSave={saveApiKey} onClose={() => setShowKeyModal(false)} />
      )}
    </>
  )
}
