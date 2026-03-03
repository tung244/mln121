import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Math helpers ────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// Smooth opacity blend given era range [start, peak, end]
function eraOpacity(era, start, peak, end) {
    if (era <= start || era >= end) return 0
    if (era <= peak) return clamp((era - start) / (peak - start), 0, 1)
    return clamp((end - era) / (end - peak), 0, 1)
}

// ── Shared materials helpers ────────────────────────────────────────
const mat = (color, opts = {}) => (
    <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} {...opts} />
)
const emissiveMat = (color, emissive, intensity = 1) => (
    <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} roughness={0.4} />
)
const glassMat = (color) => (
    <meshPhysicalMaterial
        color={color} metalness={0.8} roughness={0.05}
        transmission={0.35} transparent opacity={0.85}
        emissive={color} emissiveIntensity={0.15}
    />
)

// ── Starfield ────────────────────────────────────────────────────────
function Stars() {
    const pos = useMemo(() => {
        const a = new Float32Array(700 * 3)
        for (let i = 0; i < 700; i++) {
            a[i * 3] = (Math.random() - .5) * 100
            a[i * 3 + 1] = (Math.random() - .5) * 80
            a[i * 3 + 2] = (Math.random() - .5) * 100
        }
        return a
    }, [])
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[pos, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.07} color="#88ccff" transparent opacity={0.6} />
        </points>
    )
}

// ── Ground Road ──────────────────────────────────────────────────────
function Road({ era }) {
    const roadColor = era < 1 ? '#2a2a1a' : era < 2 ? '#333333' : '#222222'
    const hasMarkings = era > 0.8
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                <planeGeometry args={[28, 28]} />
                {mat(roadColor, { roughness: 0.95 })}
            </mesh>
            {/* Road lane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
                <planeGeometry args={[3.5, 28]} />
                {mat(era < 1 ? '#2a1a00' : '#1a1a1a', { roughness: 0.9 })}
            </mesh>
            {/* Road markings */}
            {hasMarkings && [-4, -2, 0, 2, 4].map((z, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, z * 2]}>
                    <planeGeometry args={[0.1, 1.2]} />
                    <meshStandardMaterial color="#ffff66" transparent opacity={clamp((era - 0.8) * 3, 0, 1)} />
                </mesh>
            ))}
            {/* Sidewalk */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3.2, -1.48, 0]}>
                <planeGeometry args={[1.5, 28]} />
                {mat('#3a3a38')}
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.2, -1.48, 0]}>
                <planeGeometry args={[1.5, 28]} />
                {mat('#3a3a38')}
            </mesh>
        </group>
    )
}

// ── Sky gradient via background ──────────────────────────────────────
function DynamicBackground({ era }) {
    const skyColor = useMemo(() => {
        if (era < 0.5) return '#000810'
        if (era < 1.5) return '#020c16'
        if (era < 2.5) return '#030e1a'
        if (era < 3.5) return '#04101e'
        return '#051220'
    }, [Math.floor(era * 2)])
    return <color attach="background" args={[skyColor]} />
}

// ── Trees ───────────────────────────────────────────────────────────
function Tree({ pos, size = 1, opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[0, -0.4 * size, 0]} castShadow>
                <cylinderGeometry args={[0.06 * size, 0.1 * size, 0.8 * size, 6]} />
                <meshStandardMaterial color="#5c3a1e" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.2 * size, 0]} castShadow>
                <coneGeometry args={[0.4 * size, 0.8 * size, 7]} />
                <meshStandardMaterial color="#2d5a27" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.6 * size, 0]} castShadow>
                <coneGeometry args={[0.28 * size, 0.6 * size, 7]} />
                <meshStandardMaterial color="#3a7a30" transparent opacity={opacity} />
            </mesh>
        </group>
    )
}

// ── Street lamp ─────────────────────────────────────────────────────
function StreetLamp({ pos, era, opacity = 1 }) {
    const on = era > 1
    return (
        <group position={pos}>
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.06, 2.4, 6]} />
                <meshStandardMaterial color="#888888" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0.3, 1.1, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
                <meshStandardMaterial color="#777" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0.55, 1.1, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial
                    color={on ? '#ffffcc' : '#555'}
                    emissive={on ? '#ffffaa' : '#000'}
                    emissiveIntensity={on ? 2 : 0}
                    transparent opacity={opacity} />
            </mesh>
            {on && <pointLight position={[0.55, 1.1, 0]} intensity={0.4 * opacity} color="#ffffaa" distance={4} />}
        </group>
    )
}

// ── Simple person figure ─────────────────────────────────────────────
function Person({ pos, color = '#cc8844', scale = 1, opacity = 1 }) {
    return (
        <group position={pos} scale={scale}>
            <mesh position={[0, 0.05, 0]} castShadow>
                <capsuleGeometry args={[0.08, 0.25, 4, 8]} />
                <meshStandardMaterial color={color} transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.4, 0]} castShadow>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color="#f5c2a0" transparent opacity={opacity} />
            </mesh>
        </group>
    )
}

// ── Bicycle ──────────────────────────────────────────────────────────
function Bicycle({ pos, opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[-0.25, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.18, 0.025, 6, 16]} />
                <meshStandardMaterial color="#444" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0.25, -0.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.18, 0.025, 6, 16]} />
                <meshStandardMaterial color="#444" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, -0.82, 0]} rotation={[0, 0, Math.PI / 8]}>
                <boxGeometry args={[0.56, 0.04, 0.04]} />
                <meshStandardMaterial color="#555" transparent opacity={opacity} />
            </mesh>
            {/* Rider */}
            <Person pos={[0, -0.5, 0]} color="#884422" scale={0.7} opacity={opacity} />
        </group>
    )
}

// ── Motorbike ────────────────────────────────────────────────────────
function Motorbike({ pos, color = '#cc3300', opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[-0.3, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.2, 0.04, 6, 16]} />
                <meshStandardMaterial color="#222" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0.3, -0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.2, 0.04, 6, 16]} />
                <meshStandardMaterial color="#222" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, -0.72, 0]}>
                <boxGeometry args={[0.7, 0.15, 0.28]} />
                <meshStandardMaterial color={color} transparent opacity={opacity} />
            </mesh>
            <Person pos={[0, -0.35, 0]} color="#994400" scale={0.75} opacity={opacity} />
        </group>
    )
}

// ── Car ────────────────────────────────────────────────────────────
function Car({ pos, color = '#2244aa', opacity = 1, modern = false }) {
    return (
        <group position={pos}>
            {/* Wheels */}
            {[[-0.5, -1], [0.5, -1], [-0.5, 0.7], [0.5, 0.7]].map(([x, z], i) => (
                <mesh key={i} position={[x, -0.75, z]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.22, 0.07, 6, 16]} />
                    <meshStandardMaterial color="#111" transparent opacity={opacity} />
                </mesh>
            ))}
            {/* Body */}
            <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[1.1, 0.32, 1.8]} />
                <meshStandardMaterial color={color} metalness={modern ? 0.7 : 0.3} roughness={modern ? 0.2 : 0.7} transparent opacity={opacity} />
            </mesh>
            {/* Cabin */}
            <mesh position={[0, -0.25, -0.1]}>
                <boxGeometry args={[0.95, 0.3, 1.1]} />
                <meshStandardMaterial color={modern ? '#88ccff' : '#aaaaaa'} metalness={0.5} roughness={0.1} transparent opacity={opacity * 0.7} />
            </mesh>
            {modern && (
                <mesh position={[0.55, -0.6, 0]}>
                    <boxGeometry args={[0.04, 0.06, 0.4]} />
                    <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} transparent opacity={opacity} />
                </mesh>
            )}
        </group>
    )
}

// ── Market Stall (1986 mậu dịch) ────────────────────────────────────
function MarketStall({ pos, opacity = 1 }) {
    return (
        <group position={pos}>
            {/* Counter */}
            <mesh position={[0, -0.6, 0]}>
                <boxGeometry args={[1.5, 0.6, 0.6]} />
                {mat('#6a5020', { transparent: true, opacity })}
            </mesh>
            {/* Awning */}
            <mesh position={[0, -0.1, 0.15]}>
                <boxGeometry args={[1.7, 0.06, 0.9]} />
                {mat('#882222', { transparent: true, opacity })}
            </mesh>
            {/* Post */}
            {[-0.7, 0.7].map((x, i) => (
                <mesh key={i} position={[x, -0.3, -0.25]}>
                    <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
                    {mat('#555', { transparent: true, opacity })}
                </mesh>
            ))}
            {/* Goods boxes */}
            {[-0.4, 0, 0.4].map((x, i) => (
                <mesh key={i} position={[x, -0.22, 0]}>
                    <boxGeometry args={[0.25, 0.18, 0.25]} />
                    {mat(['#8a6030', '#7a4820', '#5a3010'][i], { transparent: true, opacity })}
                </mesh>
            ))}
            <Person pos={[0.1, 0.05, 0.5]} color="#885533" scale={0.85} opacity={opacity} />
        </group>
    )
}

// ── Modern shop / Coffee ─────────────────────────────────────────────
function CafeShop({ pos, opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[0, -0.35, 0]}>
                <boxGeometry args={[1.8, 1.5, 1.2]} />
                {mat('#eeeeee', { transparent: true, opacity })}
            </mesh>
            {/* Glass front */}
            <mesh position={[0, -0.35, 0.61]}>
                <boxGeometry args={[1.6, 1.3, 0.04]} />
                <meshPhysicalMaterial color="#88deff" transmission={0.6} transparent opacity={opacity * 0.7} metalness={0.4} />
            </mesh>
            {/* Sign */}
            <mesh position={[0, 0.5, 0.5]}>
                <boxGeometry args={[1.2, 0.28, 0.06]} />
                {mat('#ff4488', { transparent: true, opacity })}
            </mesh>
            <Person pos={[-0.3, -0.35, 0.8]} color="#774433" scale={0.85} opacity={opacity} />
            <Person pos={[0.4, -0.35, 0.8]} color="#446688" scale={0.85} opacity={opacity} />
        </group>
    )
}

// ── Solar panel ──────────────────────────────────────────────────────
function SolarPanel({ pos, opacity = 1 }) {
    return (
        <group position={pos} rotation={[-0.3, 0, 0]}>
            {[[-0.35, 0], [0.35, 0]].map(([x, z], i) => (
                <mesh key={i} position={[x, 0, z]}>
                    <boxGeometry args={[0.6, 0.04, 0.9]} />
                    <meshStandardMaterial color="#1a2a6c" metalness={0.8} roughness={0.1} transparent opacity={opacity} />
                </mesh>
            ))}
            <mesh position={[0, -0.1, 0]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[1.5, 0.04, 0.1]} />
                {mat('#888', { transparent: true, opacity })}
            </mesh>
        </group>
    )
}

// ── EV Charging station ──────────────────────────────────────────────
function EVCharger({ pos, opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[0, -0.25, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.2]} />
                {mat('#eeeeee', { transparent: true, opacity })}
            </mesh>
            <mesh position={[0, 0.4, 0.11]}>
                <boxGeometry args={[0.22, 0.4, 0.04]} />
                <meshStandardMaterial color="#00ff88" emissive="#00cc66" emissiveIntensity={1.5} transparent opacity={opacity} />
            </mesh>
            {/* Cable */}
            <mesh position={[0.2, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
                <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
                {mat('#333', { transparent: true, opacity })}
            </mesh>
        </group>
    )
}

// ── Metro elevated track ─────────────────────────────────────────────
function MetroTrack({ opacity = 1 }) {
    return (
        <group>
            {/* Columns */}
            {[-4, -1, 2, 5].map((x, i) => (
                <mesh key={i} position={[x, 0, -3]}>
                    <boxGeometry args={[0.2, 3, 0.2]} />
                    {mat('#aaaaaa', { transparent: true, opacity })}
                </mesh>
            ))}
            {/* Beam */}
            <mesh position={[0.5, 1.4, -3]}>
                <boxGeometry args={[10, 0.18, 0.6]} />
                {mat('#bbbbbb', { transparent: true, opacity })}
            </mesh>
            {/* Rails */}
            {[-0.15, 0.15].map((z, i) => (
                <mesh key={i} position={[0.5, 1.52, -3 + z]}>
                    <boxGeometry args={[10, 0.04, 0.06]} />
                    <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} transparent opacity={opacity} />
                </mesh>
            ))}
            {/* Train car */}
            <MetroTrain opacity={opacity} />
        </group>
    )
}

function MetroTrain({ opacity }) {
    const ref = useRef()
    useFrame((_, dt) => {
        if (!ref.current) return
        ref.current.position.x += dt * 1.5
        if (ref.current.position.x > 7) ref.current.position.x = -6
    })
    return (
        <group ref={ref} position={[-6, 1.58, -3]}>
            {/* Body */}
            <mesh>
                <boxGeometry args={[2.8, 0.55, 0.48]} />
                <meshStandardMaterial color="#2255aa" metalness={0.7} roughness={0.2} transparent opacity={opacity} />
            </mesh>
            {/* Windows strip */}
            <mesh position={[0, 0.1, 0.25]}>
                <boxGeometry args={[2.5, 0.22, 0.04]} />
                <meshStandardMaterial color="#cceeff" metalness={0.5} roughness={0.1} transparent opacity={opacity * 0.8} />
            </mesh>
            {/* Front light */}
            <mesh position={[1.41, 0, 0]}>
                <boxGeometry args={[0.04, 0.12, 0.24]} />
                <meshStandardMaterial color="#ffffaa" emissive="#ffff88" emissiveIntensity={3} transparent opacity={opacity} />
            </mesh>
        </group>
    )
}

// ── WiFi / 4G Tower ──────────────────────────────────────────────────
function TowerCell({ pos, opacity = 1 }) {
    return (
        <group position={pos}>
            <mesh position={[0, 0, 0]} castShadow>
                <cylinderGeometry args={[0.04, 0.06, 3, 6]} />
                {mat('#888', { transparent: true, opacity })}
            </mesh>
            {[0.8, 1.4, 2.0].map((y, i) => (
                <group key={i} position={[0, y, 0]}>
                    {[-0.3, 0, 0.3].map((x, j) => (
                        <mesh key={j} position={[x, 0, 0]}>
                            <boxGeometry args={[0.06, 0.25, 0.06]} />
                            {mat('#aaa', { transparent: true, opacity })}
                        </mesh>
                    ))}
                </group>
            ))}
            <mesh position={[0, 1.5, 0]}>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={2} transparent opacity={opacity} />
            </mesh>
        </group>
    )
}

// ── Smoke particles ──────────────────────────────────────────────────
function SmokePuff({ opacity }) {
    const ref = useRef()
    const count = 60
    const pos = useMemo(() => {
        const a = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            a[i * 3] = (Math.random() - .5) * 5; a[i * 3 + 1] = Math.random() * 3 + 1.5; a[i * 3 + 2] = (Math.random() - .5) * 4
        }
        return a
    }, [])
    useFrame((_, dt) => {
        if (!ref.current) return
        const p = ref.current.geometry.attributes.position
        for (let i = 0; i < count; i++) {
            p.array[i * 3 + 1] += dt * 0.35
            if (p.array[i * 3 + 1] > 5.5) p.array[i * 3 + 1] = 1.5
        }
        p.needsUpdate = true
        ref.current.material.opacity = opacity * 0.6
    })
    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[pos, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.18} color="#222222" transparent opacity={opacity * 0.6} />
        </points>
    )
}

// ─────────────────────────────────────────────────────────────────────
// ERA SCENE PACKAGES
// era range: 0 (1986) → 4 (2026), epochs at 1,2,3,4
// ─────────────────────────────────────────────────────────────────────

// ERA 0 — 1986: bao cấp, khói, xe đạp, mậu dịch ─────────────────────
function Era1986({ era }) {
    const op = clamp(1 - era * 1.2, 0, 1)
    if (op < 0.01) return null
    return (
        <group>
            {/* Old brick factory */}
            <mesh position={[-1.2, -0.3, 0]} castShadow>
                <boxGeometry args={[2.2, 2.6, 1.6]} />
                {mat('#4a3a2a', { transparent: true, opacity: op })}
            </mesh>
            {/* Chimneys */}
            {[[-1.8, 1.4, 0], [-.5, 1.6, .3], [-.5, 1.7, -.3]].map(([x, y, z], i) => (
                <mesh key={i} position={[x, y, z]} castShadow>
                    <cylinderGeometry args={[0.13, 0.18, 2.4, 8]} />
                    {mat('#2a2020', { transparent: true, opacity: op })}
                </mesh>
            ))}
            <SmokePuff opacity={op} />
            {/* Row of poor houses */}
            {[3.5, 5.0, 6.5].map((x, i) => (
                <group key={i} position={[x, -0.5, -1]}>
                    <mesh><boxGeometry args={[1.2, 2, 1]} />{mat('#5a4a30', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, 1.1, 0]}><coneGeometry args={[0.8, 0.7, 4]} />{mat('#882222', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, .1, .51]}><boxGeometry args={[0.3, 0.5, 0.04]} />{mat('#333', { transparent: true, opacity: op })}</mesh>
                </group>
            ))}
            {/* Barrier gate */}
            {[-3, -2, -1, 0, 1, 2].map((x, i) => (
                <mesh key={i} position={[x + 2, -1.0, 2.5]} castShadow>
                    <cylinderGeometry args={[0.05, 0.05, 1.0, 6]} />
                    {mat('#cc2200', { transparent: true, opacity: op })}
                </mesh>
            ))}
            <mesh position={[2, -0.5, 2.5]}>
                <boxGeometry args={[4.2, 0.07, 0.07]} />
                <meshStandardMaterial color="#ff3300" emissive="#440000" transparent opacity={op} />
            </mesh>
            {/* Market stalls */}
            <MarketStall pos={[3, -0.5, 2]} opacity={op} />
            <MarketStall pos={[5, -0.5, 2]} opacity={op} />
            {/* Bicycles */}
            <Bicycle pos={[-3.5, -1.1, 0.5]} opacity={op} />
            <Bicycle pos={[-3.5, -1.1, -1.5]} opacity={op} />
            {/* People */}
            {[[-2.5, -0.9, 1], [1, -0.9, 2.5], [0, -0.9, -1]].map(([x, y, z], i) => (
                <Person key={i} pos={[x, y, z]} color={['#885533', '#664422', '#774422'][i]} opacity={op} />
            ))}
            {/* Dim street lamp (unlit) */}
            <StreetLamp pos={[-3.5, -1.5, 0]} era={0} opacity={op} />
            <StreetLamp pos={[1.5, -1.5, 0]} era={0} opacity={op} />
            {/* Dirt path texture overlay */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
                <planeGeometry args={[3.5, 18]} />
                {mat('#2a1800', { transparent: true, opacity: op * 0.6 })}
            </mesh>
        </group>
    )
}

// ERA 1 — 1996: xe máy xuất hiện, chợ sầm uất, đường trải nhựa ──────
function Era1996({ era }) {
    const op = eraOpacity(era, 0.3, 1.0, 2.2)
    if (op < 0.01) return null
    return (
        <group>
            {/* Shophouses */}
            {[3.0, 4.8, 6.6].map((x, i) => (
                <group key={i} position={[x, -0.2, -1.5]}>
                    <mesh><boxGeometry args={[1.4, 2.8, 1.1]} />{mat(['#d4b896', '#c9b080', '#e0c8a0'][i], { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, 1.5, 0]} rotation={[-0.05, 0, 0]}><boxGeometry args={[1.5, 0.15, 1.3]} />{mat('#884422', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0.15, .1, .56]}><boxGeometry args={[0.4, 0.7, 0.04]} />{mat('#333', { transparent: true, opacity: op })}</mesh>
                </group>
            ))}
            {/* Motorbikes */}
            <Motorbike pos={[-2, -1.1, 0.5]} color="#cc3300" opacity={op} />
            <Motorbike pos={[0.5, -1.1, 0.5]} color="#2244aa" opacity={op} />
            <Motorbike pos={[-1, -1.1, -1.5]} color="#116622" opacity={op} />
            {/* Small factory still running but cleaner */}
            <mesh position={[-2, -0.5, 0]} castShadow>
                <boxGeometry args={[2, 2, 1.4]} />
                {mat('#5a4a35', { transparent: true, opacity: op })}
            </mesh>
            <mesh position={[-2.6, 0.8, 0]}>
                <cylinderGeometry args={[0.12, 0.16, 2, 8]} />
                {mat('#333', { transparent: true, opacity: op * 0.5 })}
            </mesh>
            {/* People shopping */}
            {[[-3, -0.9, 1.5], [2.5, -0.9, 1.5], [5, -0.9, 1.5], [4, -0.9, 0]].map(([x, y, z], i) => (
                <Person key={i} pos={[x, y, z]} color={['#997755', '#cc9966', '#884422', '#553311'][i]} opacity={op} />
            ))}
            {/* Street lamps */}
            <StreetLamp pos={[-3.8, -1.5, 1]} era={1.5} opacity={op} />
            <StreetLamp pos={[3.8, -1.5, 1]} era={1.5} opacity={op} />
            {/* Trees */}
            <Tree pos={[-4, -1.5, -2]} opacity={op} />
            <Tree pos={[4.5, -1.5, -2]} opacity={op} />
        </group>
    )
}

// ERA 2 — 2006: tòa nhà kính, ô tô, WTO ─────────────────────────────
function Era2006({ era }) {
    const op = eraOpacity(era, 1.2, 2.0, 3.2)
    if (op < 0.01) return null
    return (
        <group>
            {/* Medium-rise office buildings */}
            <mesh position={[-1.5, 0.6, -1]} castShadow>
                <boxGeometry args={[2, 4, 1.2]} />
                <meshPhysicalMaterial color="#99bbdd" metalness={0.6} roughness={0.1} transparent opacity={op} emissive="#002244" emissiveIntensity={0.2} />
            </mesh>
            <mesh position={[2.5, 0.3, -1]} castShadow>
                <boxGeometry args={[1.8, 3.2, 1.2]} />
                <meshPhysicalMaterial color="#aaccee" metalness={0.6} roughness={0.1} transparent opacity={op} emissive="#002255" emissiveIntensity={0.2} />
            </mesh>
            {/* Supermarket / mall */}
            <mesh position={[5, -.1, -1]} castShadow>
                <boxGeometry args={[3, 2, 1.5]} />
                {mat('#e8e8e8', { transparent: true, opacity: op })}
            </mesh>
            <mesh position={[5, .8, -0.25]}>
                <boxGeometry args={[2.8, 0.25, 0.05]} />
                <meshStandardMaterial color="#2255aa" emissive="#1133aa" emissiveIntensity={0.8} transparent opacity={op} />
            </mesh>
            {/* Cars */}
            <Car pos={[-2.5, -1.1, 0.5]} color="#cc4422" opacity={op} />
            <Car pos={[1, -1.1, 0.5]} color="#2255aa" opacity={op} />
            <Car pos={[3.5, -1.1, -0.5]} color="#228844" opacity={op} />
            {/* Keep some motorbikes */}
            <Motorbike pos={[-1, -1.1, -1.5]} color="#994422" opacity={op * 0.7} />
            <Motorbike pos={[0.5, -1.1, -1.5]} color="#1133aa" opacity={op * 0.7} />
            {/* Trees - more green */}
            {[-4.5, -3.8, 4.0, 5.5].map((x, i) => (
                <Tree key={i} pos={[x, -1.5, -2]} size={1.1} opacity={op} />
            ))}
            {/* Street lamps */}
            {[-4, -2, 2, 4].map((x, i) => (
                <StreetLamp key={i} pos={[x, -1.5, 1.5]} era={2.2} opacity={op} />
            ))}
            {/* People with modern clothes */}
            {[[-3, -0.9, 1], [-1, -0.9, 1.8], [4.5, -0.9, 1.5], [6, -0.9, 0]].map(([x, y, z], i) => (
                <Person key={i} pos={[x, y, z]} color={['#3355aa', '#aa5533', '#446699', '#885522'][i]} opacity={op} />
            ))}
            {/* Harbor crane */}
            <mesh position={[-5.5, 0.5, 0.5]}>
                <boxGeometry args={[0.15, 3, 0.15]} />
                {mat('#ff8800', { transparent: true, opacity: op })}
            </mesh>
            <mesh position={[-5.1, 2, 0.5]}>
                <boxGeometry args={[1, 0.12, 0.12]} />
                {mat('#ff8800', { transparent: true, opacity: op })}
            </mesh>
        </group>
    )
}

// ERA 3 — 2016: kỷ nguyên số, smartphone, grab, coffee, 4G ──────────
function Era2016({ era }) {
    const op = eraOpacity(era, 2.2, 3.0, 3.8)
    if (op < 0.01) return null
    return (
        <group>
            {/* Tall glass tower */}
            <mesh position={[0, 1.5, -1.5]} castShadow>
                <boxGeometry args={[2.2, 5.5, 1.4]} />
                <meshPhysicalMaterial color="#aaddff" metalness={0.85} roughness={0.05} transparent opacity={op} emissive="#004488" emissiveIntensity={0.3} />
            </mesh>
            {/* Antenna blink */}
            <mesh position={[0, 4.4, -1.5]}>
                <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
                <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} transparent opacity={op} />
            </mesh>
            {/* Neon sign on tower */}
            <mesh position={[0, 3, -0.81]}>
                <boxGeometry args={[1.8, 0.3, 0.04]} />
                <meshStandardMaterial color="#ff4488" emissive="#ff2266" emissiveIntensity={2} transparent opacity={op} />
            </mesh>
            {/* Cafe shops */}
            <CafeShop pos={[4, -0.5, 0]} opacity={op} />
            <CafeShop pos={[-4.5, -0.5, -0.5]} opacity={op} />
            {/* Cars - more modern */}
            <Car pos={[-2.5, -1.1, 0.5]} color="#eeeeee" opacity={op} modern />
            <Car pos={[2, -1.1, 0.5]} color="#222222" opacity={op} modern />
            {/* Grab delivery bikes with riders */}
            <Motorbike pos={[0.5, -1.1, -1.5]} color="#00cc44" opacity={op} />
            <Motorbike pos={[-1, -1.1, 1.5]} color="#00aa33" opacity={op} />
            {/* 4G tower */}
            <TowerCell pos={[-6, -1.5, -2]} opacity={op} />
            {/* Many trees */}
            {[-5, -3.5, 3, 5, 6.5].map((x, i) => (
                <Tree key={i} pos={[x, -1.5, -2.5]} size={1.2} opacity={op} />
            ))}
            {/* People with phones */}
            {[[-3.5, -0.9, 1.5], [-2, -0.9, 1.8], [3, -0.9, 1.5], [5.5, -0.9, 1], [1, -0.9, 2], [-1, -0.9, 2]].map(([x, y, z], i) => (
                <group key={i}>
                    <Person pos={[x, y, z]} color={['#3355aa', '#885522', '#446699', '#aa3366', '#224488', '#665533'][i]} opacity={op} />
                    {/* Phone in hand */}
                    <mesh position={[x + 0.12, y + 0.15, z + 0.1]}>
                        <boxGeometry args={[0.05, 0.09, 0.01]} />
                        <meshStandardMaterial color="#111" emissive="#334455" emissiveIntensity={0.5} transparent opacity={op} />
                    </mesh>
                </group>
            ))}
            {/* Park bench + greenery */}
            <mesh position={[-5.5, -1.3, 0.5]}>
                <boxGeometry args={[0.8, 0.1, 0.3]} />
                {mat('#885533', { transparent: true, opacity: op })}
            </mesh>
        </group>
    )
}

// ERA 4 — 2026: xe điện, metro, pin mặt trời, thành phố xanh ────────
function Era2026({ era }) {
    const op = clamp((era - 3.2) * 1.2, 0, 1)
    if (op < 0.01) return null
    return (
        <group>
            {/* Supertall glass twin towers */}
            <mesh position={[-1.8, 2.5, -2]} castShadow>
                <boxGeometry args={[1.8, 7, 1.3]} />
                <meshPhysicalMaterial color="#bbddff" metalness={0.9} roughness={0.04} transparent opacity={op} emissive="#003366" emissiveIntensity={0.25} />
            </mesh>
            <mesh position={[1.8, 2.0, -2]} castShadow>
                <boxGeometry args={[1.8, 6, 1.3]} />
                <meshPhysicalMaterial color="#cce8ff" metalness={0.9} roughness={0.04} transparent opacity={op} emissive="#002255" emissiveIntensity={0.25} />
            </mesh>
            {/* Sky bridge between towers */}
            <mesh position={[0, 3.5, -2]}>
                <boxGeometry args={[1.8, 0.2, 0.8]} />
                <meshPhysicalMaterial color="#aaddff" metalness={0.8} roughness={0.08} transparent opacity={op * 0.8} />
            </mesh>
            {/* Neon accents on towers */}
            {[-1.8, 1.8].map((x, i) => (
                <mesh key={i} position={[x, 2.5, -1.35]}>
                    <boxGeometry args={[0.05, 7, 0.05]} />
                    <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.5} transparent opacity={op} />
                </mesh>
            ))}
            {/* Solar farm on rooftops */}
            <SolarPanel pos={[4.5, 0.5, -1.5]} opacity={op} />
            <SolarPanel pos={[4.5, 0.5, -0.5]} opacity={op} />
            {/* Metro elevated track */}
            <MetroTrack opacity={op} />
            {/* VinFast EVs */}
            <Car pos={[-3, -1.1, 0.5]} color="#00ff88" opacity={op} modern />
            <Car pos={[0.5, -1.1, 0.5]} color="#ffffff" opacity={op} modern />
            <Car pos={[3.5, -1.1, -0.5]} color="#0044ff" opacity={op} modern />
            {/* EV chargers */}
            <EVCharger pos={[-5, -1.4, 1]} opacity={op} />
            <EVCharger pos={[-5.5, -1.4, 1]} opacity={op} />
            {/* Dense tree-lined boulevard */}
            {[-5, -4, -3, 3, 4, 5, 6].map((x, i) => (
                <Tree key={i} pos={[x, -1.5, -3]} size={1.4} opacity={op} />
            ))}
            {/* Vertical garden on building face */}
            <mesh position={[4.5, 0, -1.5]}>
                <boxGeometry args={[0.08, 3, 1.6]} />
                <meshStandardMaterial color="#2a7a20" transparent opacity={op * 0.8} />
            </mesh>
            {/* 5G / smart city tower */}
            <TowerCell pos={[7, -1.5, -1]} opacity={op} />
            {/* Smart traffic light */}
            <mesh position={[3.8, -1.5, 1.8]}>
                <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
                {mat('#aaa', { transparent: true, opacity: op })}
            </mesh>
            <mesh position={[3.8, -0.15, 1.8]}>
                <boxGeometry args={[0.15, 0.5, 0.15]} />
                {mat('#222', { transparent: true, opacity: op })}
            </mesh>
            <mesh position={[3.8, -0.05, 1.95]}>
                <sphereGeometry args={[0.065, 8, 8]} />
                <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={2} transparent opacity={op} />
            </mesh>
            {/* People - diverse, modern */}
            {[[-3.5, -0.9, 1.5], [-2, -0.9, 1.8], [4.5, -0.9, 1.5], [6, -0.9, 0.5], [1.5, -0.9, 2], [-.5, -0.9, 2], [2.5, -0.9, 1.5]].map(([x, y, z], i) => (
                <Person key={i} pos={[x, y, z]} color={['#3355aa', '#995522', '#446699', '#aa3366', '#224488', '#008866', '#553388'][i]} opacity={op} />
            ))}
            {/* Neon ring plaza at base */}
            <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.05, 8, 80]} />
                <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={2} transparent opacity={op} />
            </mesh>
            {/* Park / fountain */}
            <mesh position={[-5.5, -1.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.8, 16]} />
                <meshStandardMaterial color="#1a5530" transparent opacity={op} />
            </mesh>
            <mesh position={[-5.5, -1.45, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 0.1, 12]} />
                <meshStandardMaterial color="#88ccff" emissive="#4488ff" emissiveIntensity={0.5} transparent opacity={op} />
            </mesh>
        </group>
    )
}

// ── Red Dot (gamification) ─────────────────────────────────────────
function RedDot3D({ position, onClick, resolved }) {
    const ref = useRef()
    const ring = useRef()
    useFrame((state, dt) => {
        if (!ref.current || resolved) return
        ref.current.rotation.y += dt * 1.8
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.18)
        if (ring.current) {
            const t = (Math.sin(state.clock.elapsedTime * 2.5) + 1) / 2
            ring.current.material.opacity = lerp(0.15, 0.7, t)
            ring.current.scale.setScalar(lerp(1, 2.2, t))
        }
    })
    if (resolved) return null
    return (
        <group position={position}>
            <mesh ref={ref} onClick={onClick}>
                <sphereGeometry args={[0.13, 12, 12]} />
                <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={2.5} />
            </mesh>
            <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.28, 0.025, 6, 30]} />
                <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1} transparent opacity={0.4} />
            </mesh>
        </group>
    )
}

// ── Cyber ground grid ──────────────────────────────────────────────
function CyberGrid({ era }) {
    const t = clamp(era / 4, 0, 1)
    const color = new THREE.Color().lerpColors(new THREE.Color('#1a1400'), new THREE.Color('#001133'), t)
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
            <planeGeometry args={[35, 35, 20, 20]} />
            <meshStandardMaterial color={color} wireframe transparent opacity={0.08} emissive={color} emissiveIntensity={0.4} />
        </mesh>
    )
}

// ── Main Scene Content ─────────────────────────────────────────────
function SceneContent({ year, resolvedDots, onDotClick }) {
    const era = clamp((year - 1986) / (2026 - 1986) * 4, 0, 4)

    const dotPositions = [[-1.8, 1.8, 0.3], [2.1, 0.5, 1.0], [0.3, -0.2, 2.2]]
    const showDots = year <= 1995

    // Dynamic lighting by era
    const ambientInt = lerp(0.2, 0.5, clamp(era / 4, 0, 1))
    const sunColor = era < 1 ? '#ff8840' : era < 3 ? '#ffffff' : '#cceeff'
    const glowColor = era < 1 ? '#ff4400' : era < 2 ? '#ffcc44' : '#00f5ff'
    const glowInt = era < 0.5 ? 0 : clamp((era - 0.5) * 0.6, 0, 2)

    return (
        <>
            <DynamicBackground era={era} />
            <fog attach="fog" args={[era < 1 ? '#000810' : '#000810', 18, 45]} />

            <ambientLight intensity={ambientInt} color="#001133" />
            <directionalLight position={[6, 10, 4]} intensity={0.9} color={sunColor} castShadow />
            <pointLight position={[-5, 4, -4]} intensity={0.6} color="#ff6600" />
            <pointLight position={[5, 5, 4]} intensity={glowInt} color={glowColor} />
            <pointLight position={[0, 3, 3]} intensity={glowInt * 0.8} color="#00f5ff" />

            <Stars />
            <Road era={era} />
            <CyberGrid era={era} />

            {/* All era scenes — opacity blended by era value */}
            <Era1986 era={era} />
            <Era1996 era={era} />
            <Era2006 era={era} />
            <Era2016 era={era} />
            <Era2026 era={era} />

            {/* Red Dots for gamification */}
            {showDots && dotPositions.map((pos, i) => (
                <RedDot3D key={i} position={pos} onClick={() => onDotClick(i)} resolved={resolvedDots.includes(i)} />
            ))}

            <OrbitControls
                makeDefault enableDamping dampingFactor={0.05}
                minDistance={4} maxDistance={22}
                maxPolarAngle={Math.PI * 0.48}
            />
        </>
    )
}

// ── Exported Canvas ────────────────────────────────────────────────
export default function Scene3D({ year, resolvedDots, onDotClick }) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 4, 10], fov: 55 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 1.5]}
        >
            <SceneContent year={year} resolvedDots={resolvedDots} onDotClick={onDotClick} />
        </Canvas>
    )
}
