import { useState, useRef, useEffect } from 'react'

const SYSTEM_PROMPT = `Bạn là GS. Đổi Mới — chuyên gia hàng đầu về Kinh tế Chính trị Mác-Lênin và Lịch sử Đảng Cộng sản Việt Nam. Bạn đang tham gia talkshow "14 Khoảnh khắc mùa xuân" tại Đại học FPT Hà Nội.

NHIỆM VỤ:
- Trả lời câu hỏi về kinh tế thị trường định hướng xã hội chủ nghĩa, đường lối Đổi Mới (1986), các kỳ Đại hội từ VI đến XI.
- Giải thích cơ chế bao cấp, tại sao cần Đổi Mới 1986, các thành tựu kinh tế-xã hội của từng thời kỳ.
- Trả lời ngắn gọn, súc tích (tối đa 150 từ), học thuật nhưng dễ hiểu.
- Dùng số liệu thực tế như lạm phát 774% (1986), GDP tăng 9.3% (1996), WTO (2007).
- Không bịa đặt kiến thức lịch sử. Nếu không chắc, hãy nói rõ.
- Thỉnh thoảng dùng emoji phù hợp để dễ đọc.
- Luôn kết thúc bằng 1 câu gợi mở suy nghĩ.

PHONG CÁCH: Tự tin, khoa học, truyền cảm hứng, mang tinh thần Đổi Mới.`

export default function AIChatbox({ apiKey, onRequestKey }) {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: '🎓 Xin chào! Tôi là **GS. Đổi Mới** — chuyên gia về Kinh tế Chính trị Mác-Lênin. Hãy hỏi tôi về đường lối Đổi Mới, kinh tế thị trường định hướng XHCN, hoặc bất kỳ điều gì về giai đoạn 1986–2011! 🇻🇳',
        },
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)
    const bottomRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            setHasUnread(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [messages, isOpen])

    const sendMessage = async () => {
        const text = input.trim()
        if (!text) return

        if (!apiKey) {
            onRequestKey()
            return
        }

        const userMsg = { role: 'user', text }
        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            const history = messages.map((m) => ({
                role: m.role,
                parts: [{ text: m.text }],
            }))

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                        contents: [
                            ...history,
                            { role: 'user', parts: [{ text }] },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 400,
                        },
                    }),
                }
            )

            const json = await res.json()
            const reply =
                json?.candidates?.[0]?.content?.parts?.[0]?.text ||
                '⚠️ Không nhận được phản hồi. Vui lòng thử lại.'

            setMessages((prev) => [...prev, { role: 'model', text: reply }])
            if (!isOpen) setHasUnread(true)
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'model', text: `⚠️ Lỗi kết nối API: ${err.message}` },
            ])
        } finally {
            setIsTyping(false)
        }
    }

    const handleKey = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const SUGGESTIONS = [
        'Tại sao Việt Nam cần Đổi Mới 1986?',
        'Kinh tế thị trường XHCN là gì?',
        'Thành tựu của Đại hội IX?',
    ]

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen((o) => !o)}
                className="fixed bottom-28 right-4 z-[100] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{
                    background: 'linear-gradient(135deg, #003366, #001133)',
                    border: '2px solid var(--neon-cyan)',
                    boxShadow: '0 0 20px rgba(0,245,255,0.5)',
                }}
                title="Trợ lý AI"
            >
                <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
                {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold">1</span>
                )}
            </button>

            {/* Chat panel */}
            <div
                className={`fixed bottom-28 right-20 z-[99] w-80 flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                style={{ height: 420 }}
            >
                <div className="glass-panel flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-cyan-900/50 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-base">🎓</div>
                        <div>
                            <div className="font-orbitron text-xs font-bold text-cyan-300">GS. ĐỔI MỚI</div>
                            <div className="font-mono text-[9px] text-cyan-600">Chuyên gia KTCT Mác-Lênin</div>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="font-mono text-[9px] text-green-400">ONLINE</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className="max-w-[85%] rounded-2xl px-3 py-2 font-inter text-xs leading-relaxed"
                                    style={{
                                        background:
                                            m.role === 'user'
                                                ? 'linear-gradient(135deg, #003399, #001166)'
                                                : 'rgba(0,30,60,0.8)',
                                        border: m.role === 'user' ? '1px solid rgba(0,100,255,0.4)' : '1px solid rgba(0,245,255,0.15)',
                                        color: m.role === 'user' ? '#aaccff' : '#cceeff',
                                    }}
                                >
                                    {/* Render **bold** text */}
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: m.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00f5ff">$1</strong>')
                                                .replace(/\n/g, '<br/>'),
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div
                                    className="rounded-2xl px-4 py-3 flex items-center gap-1"
                                    style={{
                                        background: 'rgba(0,30,60,0.8)',
                                        border: '1px solid rgba(0,245,255,0.15)',
                                    }}
                                >
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="typing-dot" />
                                    <span className="font-mono text-[9px] text-cyan-500 ml-1">AI đang phân tích...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && (
                        <div className="px-3 pb-2 flex flex-wrap gap-1">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                                    className="text-[9px] font-mono px-2 py-1 rounded-lg transition-all hover:opacity-100 opacity-70"
                                    style={{ background: 'rgba(0,100,150,0.3)', border: '1px solid rgba(0,245,255,0.2)', color: '#88ccff' }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 pb-3 pt-1 border-t border-cyan-900/30 flex gap-2">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={apiKey ? 'Gõ câu hỏi...' : '🔑 Cần API key Gemini'}
                            className="flex-1 bg-transparent border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-cyan-200 font-mono outline-none focus:border-cyan-500 transition-colors placeholder:text-cyan-800"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isTyping || !input.trim()}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
                            style={{
                                background: 'linear-gradient(135deg, #006688, #003355)',
                                border: '1px solid var(--neon-cyan)',
                                boxShadow: '0 0 10px rgba(0,245,255,0.3)',
                            }}
                        >
                            <span className="text-sm">➤</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
