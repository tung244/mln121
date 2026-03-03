import { useEffect, useRef } from 'react'

export default function ToastNotif({ toasts }) {
    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} {...t} />
            ))}
        </div>
    )
}

function ToastItem({ message, type = 'xp', icon = '⚡' }) {
    return (
        <div
            className="px-6 py-3 rounded-2xl font-orbitron text-sm font-bold tracking-widest flex items-center gap-3"
            style={{
                animation: 'toastIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                background:
                    type === 'xp'
                        ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,10,0,0.9))'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,20,10,0.9))',
                border: type === 'xp' ? '1px solid #ffd700' : '1px solid #00ff88',
                boxShadow:
                    type === 'xp'
                        ? '0 0 30px rgba(255,215,0,0.4), 0 8px 32px rgba(0,0,0,0.6)'
                        : '0 0 30px rgba(0,255,136,0.4), 0 8px 32px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(16px)',
            }}
        >
            <span className="text-2xl">{icon}</span>
            <span style={{ color: type === 'xp' ? '#ffd700' : '#00ff88' }}>{message}</span>
        </div>
    )
}
