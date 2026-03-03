import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// ── Math helpers ────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

const colorLerp = (c1, c2, t) => {
    const c = new THREE.Color(c1).lerp(new THREE.Color(c2), t)
    return '#' + c.getHexString()
}

// Smooth opacity blend given era range [start, peak, end]
function eraOpacity(era, start, peak, end) {
    if (era <= start || era >= end) return 0
    if (era <= peak) return clamp((era - start) / (peak - start), 0, 1)
    return clamp((end - era) / (end - peak), 0, 1)
}

// ── Random Utils ────────────────────────────────────────────────────
const randomRange = (min, max) => Math.random() * (max - min) + min
// Stable seed for useMemo so positions don't jump on hot reload (using Math.random is fine inside useMemo with empty deps)

// ── Shared materials helpers ────────────────────────────────────────
const mat = (color, opts = {}) => (
    <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} {...opts} />
)

// ── Generic Shapes ──────────────────────────────────────────────────
function Box({ pos, size, color, ...props }) {
    return <mesh position={pos} castShadow receiveShadow {...props}><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>
}

// ── Ground & Infrastructure ──────────────────────────────────────────
function Road({ era }) {
    const roadBase = era < 1 ? '#a1887f' : era < 2 ? '#9e9e9e' : era < 3 ? '#bdbdbd' : '#eeeeee'
    const laneColor = era < 1 ? '#8d6e63' : era < 2 ? '#616161' : era < 3 ? '#757575' : '#e0e0e0'
    const sidewalk = era < 1 ? '#795548' : era < 3 ? '#9e9e9e' : '#fff'

    const hasMarkings = era > 0.8
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                <planeGeometry args={[60, 40]} />
                <meshStandardMaterial color={roadBase} roughness={0.8} />
            </mesh>
            {/* Road lane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]} receiveShadow>
                <planeGeometry args={[5, 40]} />
                <meshStandardMaterial color={laneColor} roughness={0.7} />
            </mesh>
            {/* Road markings */}
            {hasMarkings && Array.from({ length: 15 }).map((_, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, -14 + i * 2]} receiveShadow>
                    <planeGeometry args={[0.15, 1.2]} />
                    <meshStandardMaterial color="#ffffff" transparent opacity={clamp((era - 0.8) * 3, 0, 1)} />
                </mesh>
            ))}
            {/* Sidewalk */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, -1.48, 0]} receiveShadow>
                <planeGeometry args={[3, 40]} />
                <meshStandardMaterial color={sidewalk} roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, -1.48, 0]} receiveShadow>
                <planeGeometry args={[3, 40]} />
                <meshStandardMaterial color={sidewalk} roughness={0.9} />
            </mesh>
        </group>
    )
}

function PowerPoles({ opacity }) {
    const poles = useMemo(() => Array.from({ length: 8 }), [])
    return (
        <group>
            {poles.map((_, i) => {
                const z = -15 + i * 4.5
                return (
                    <group key={i} position={[-2.8, -1.5, z]}>
                        <mesh castShadow><cylinderGeometry args={[0.08, 0.1, 4.5, 8]} /><meshStandardMaterial color="#795548" transparent opacity={opacity} /></mesh>
                        <mesh position={[0, 2, 0]}><boxGeometry args={[0.8, 0.1, 0.1]} /><meshStandardMaterial color="#555" transparent opacity={opacity} /></mesh>
                        <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.02, 0.02, 4.5, 4]} /><meshStandardMaterial color="#222" transparent opacity={opacity * 0.5} /></mesh>
                        <mesh position={[0.3, 2, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.01, 0.01, 4.5, 4]} /><meshStandardMaterial color="#222" transparent opacity={opacity * 0.5} /></mesh>
                        <mesh position={[-0.3, 2, 0]} rotation={[0, Math.PI / 2, 0]}><cylinderGeometry args={[0.01, 0.01, 4.5, 4]} /><meshStandardMaterial color="#222" transparent opacity={opacity * 0.5} /></mesh>
                    </group>
                )
            })}
        </group>
    )
}

// ── Trees & Nature ──────────────────────────────────────────────────
function TreeForest({ type = 'green', count = 20, zRange = [-10, 10], xRange = [[-12, -6], [6, 12]], opacity = 1 }) {
    const trees = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const isLeft = Math.random() > 0.5;
            const x = isLeft ? randomRange(xRange[0][0], xRange[0][1]) : randomRange(xRange[1][0], xRange[1][1]);
            const z = randomRange(zRange[0], zRange[1]);
            const size = randomRange(0.8, 1.5);
            return { x, z, size }
        })
    }, [count, zRange, xRange])

    const cTop = type === 'green' ? '#4caf50' : type === 'autumn' ? '#ff9800' : '#81c784'
    const cMid = type === 'green' ? '#388e3c' : type === 'autumn' ? '#f57c00' : '#4caf50'

    return (
        <group>
            {trees.map((t, i) => (
                <group key={i} position={[t.x, -1.5, t.z]}>
                    <mesh position={[0, 0.4 * t.size, 0]} castShadow><cylinderGeometry args={[0.06 * t.size, 0.1 * t.size, 0.8 * t.size, 6]} /><meshStandardMaterial color="#795548" transparent opacity={opacity} /></mesh>
                    <mesh position={[0, 1.0 * t.size, 0]} castShadow><coneGeometry args={[0.4 * t.size, 0.8 * t.size, 7]} /><meshStandardMaterial color={cTop} transparent opacity={opacity} /></mesh>
                    <mesh position={[0, 1.4 * t.size, 0]} castShadow><coneGeometry args={[0.28 * t.size, 0.6 * t.size, 7]} /><meshStandardMaterial color={cMid} transparent opacity={opacity} /></mesh>
                </group>
            ))}
        </group>
    )
}

// ── People ──────────────────────────────────────────────────────────
function Crowd({ count = 15, bounds = [-3.5, 3.5, -10, 10], opacity = 1 }) {
    const people = useMemo(() => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#ff5722', '#795548'];
        return Array.from({ length: count }).map(() => ({
            x: Math.random() > 0.5 ? randomRange(bounds[0] - 1.5, bounds[0] + 0.5) : randomRange(bounds[1] - 0.5, bounds[1] + 1.5),
            z: randomRange(bounds[2], bounds[3]),
            color: colors[Math.floor(Math.random() * colors.length)],
            scale: randomRange(0.85, 1.15),
            speed: randomRange(0.5, 1.5) * (Math.random() > 0.5 ? 1 : -1)
        }))
    }, [count, bounds])

    const groupRef = useRef()
    useFrame((_, dt) => {
        if (!groupRef.current) return;
        groupRef.current.children.forEach((child, i) => {
            child.position.z += people[i].speed * dt;
            if (child.position.z > bounds[3]) child.position.z = bounds[2]
            if (child.position.z < bounds[2]) child.position.z = bounds[3]
        })
    })

    return (
        <group ref={groupRef}>
            {people.map((p, i) => (
                <group key={i} position={[p.x, -1.5, p.z]} scale={p.scale}>
                    <mesh position={[0, 0.25, 0]} castShadow><capsuleGeometry args={[0.1, 0.35, 4, 8]} /><meshStandardMaterial color={p.color} transparent opacity={opacity} /></mesh>
                    <mesh position={[0, 0.65, 0]} castShadow><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#ffccbc" transparent opacity={opacity} /></mesh>
                </group>
            ))}
        </group>
    )
}

// ── Traffic ─────────────────────────────────────────────────────────
function Traffic({ count = 8, type = 'mixed', speedMul = 1, opacity = 1 }) {
    const vehicles = useMemo(() => {
        const colors = ['#d32f2f', '#1976d2', '#388e3c', '#fbc02d', '#e0e0e0', '#424242', '#00bcd4']
        return Array.from({ length: count }).map(() => {
            const lane = Math.random() > 0.5 ? 1 : -1;
            const x = lane * randomRange(0.6, 1.8);
            const z = randomRange(-15, 15);
            const isCar = type === 'car' ? true : type === 'bike' ? false : Math.random() > 0.5;
            return {
                x, z, lane, isCar,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: (isCar ? randomRange(3, 5) : randomRange(2, 3.5)) * lane * speedMul
            }
        })
    }, [count, type, speedMul])

    const ref = useRef()
    useFrame((_, dt) => {
        if (!ref.current) return;
        ref.current.children.forEach((child, i) => {
            child.position.z += vehicles[i].speed * dt;
            if (vehicles[i].lane > 0 && child.position.z > 15) child.position.z = -15;
            if (vehicles[i].lane < 0 && child.position.z < -15) child.position.z = 15;
        })
    })

    return (
        <group ref={ref}>
            {vehicles.map((v, i) => (
                <group key={i} position={[v.x, -1.5, v.z]} rotation={[0, Math.PI / 2 * v.lane, 0]}>
                    <mesh position={[0, 0.25, 0]} castShadow>
                        <boxGeometry args={v.isCar ? [1.8, 0.5, 0.9] : [0.8, 0.4, 0.3]} />
                        <meshStandardMaterial color={v.color} metalness={v.isCar ? 0.8 : 0.2} roughness={0.2} transparent opacity={opacity} />
                    </mesh>
                    {v.isCar && (
                        <mesh position={[0, 0.6, -0.05]} castShadow>
                            <boxGeometry args={[1.0, 0.35, 0.8]} />
                            <meshPhysicalMaterial color="#cce8ff" transmission={0.8} transparent opacity={opacity} />
                        </mesh>
                    )}
                    {!v.isCar && <mesh position={[0.1, 0.6, 0]}><capsuleGeometry args={[0.08, 0.2]} /><meshStandardMaterial color="#333" transparent opacity={opacity} /></mesh>}
                </group>
            ))}
        </group>
    )
}

// ── Generic City Blocks (Background & Density) ─────────────────────
function GenericCityBlocks({ count = 30, xRange = [[-15, -5], [5, 15]], zRange = [-15, 10], heightRange = [2, 8], colors = ['#fff'], opacity = 1, glass = false, is1986 = false }) {
    const blocks = useMemo(() => {
        return Array.from({ length: count }).map(() => {
            const isLeft = Math.random() > 0.5;
            return {
                x: isLeft ? randomRange(xRange[0][0], xRange[0][1]) : randomRange(xRange[1][0], xRange[1][1]),
                z: randomRange(zRange[0], zRange[1]),
                w: randomRange(1.5, 3.5),
                h: randomRange(heightRange[0], heightRange[1]),
                d: randomRange(1.5, 3.5),
                rot: randomRange(-0.1, 0.1),
                color: colors[Math.floor(Math.random() * colors.length)]
            }
        })
    }, [count, xRange, zRange, heightRange, colors])

    return (
        <group>
            {blocks.map((b, i) => (
                <group key={i} position={[b.x, -1.5 + b.h / 2, b.z]} rotation={[0, b.rot, 0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[b.w, b.h, b.d]} />
                        {glass
                            ? <meshPhysicalMaterial color={b.color} transmission={0.9} metalness={0.8} roughness={0} transparent opacity={opacity} />
                            : <meshStandardMaterial color={b.color} roughness={0.9} transparent opacity={opacity} />
                        }
                    </mesh>
                    {is1986 && Math.random() > 0.5 && (
                        <mesh position={[0, b.h / 2 + 0.5, 0]}>
                            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
                            <meshStandardMaterial color="#555" transparent opacity={opacity} />
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    )
}

// ─────────────────────────────────────────────────────────────────────
// ERA SCENE PACKAGES
// ─────────────────────────────────────────────────────────────────────

function Era1986({ era }) {
    const op = clamp(1 - era * 1.2, 0, 1)
    if (op < 0.01) return null
    return (
        <group>
            <GenericCityBlocks count={25} heightRange={[1.5, 3.5]} colors={['#bcaaa4', '#a1887f', '#d7ccc8', '#8d6e63', '#ffccbc']} opacity={op} is1986 />
            <PowerPoles opacity={op} />
            <TreeForest count={15} opacity={op} type="autumn" />

            {/* Main Block (Khu Tập Thể) */}
            <group position={[-6, 0.5, -4]}>
                <mesh castShadow><boxGeometry args={[4, 4, 2]} />{mat('#ffe0b2', { transparent: true, opacity: op })}</mesh>
                {/* Balconies */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <mesh key={i} position={[(i % 4 - 1.5) * 0.9, Math.floor(i / 4) * 1.2 - 0.5, 1.1]} castShadow>
                        <boxGeometry args={[0.8, 0.4, 0.3]} />{mat('#ffccbc', { transparent: true, opacity: op })}
                    </mesh>
                ))}
            </group>

            {/* Propaganda Billboard */}
            <group position={[6, 0, -2]} rotation={[0, -0.3, 0]}>
                <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[4, 2, 0.2]} />{mat('#e53935', { transparent: true, opacity: op })}</mesh>
                <mesh position={[0, 2, 0.11]}><planeGeometry args={[3.8, 1.8]} />{mat('#ffc107', { transparent: true, opacity: op })}</mesh>
                <mesh position={[-1.5, 0.5, 0]}><cylinderGeometry args={[0.1, 0.1, 3]} />{mat('#555', { transparent: true, opacity: op })}</mesh>
                <mesh position={[1.5, 0.5, 0]}><cylinderGeometry args={[0.1, 0.1, 3]} />{mat('#555', { transparent: true, opacity: op })}</mesh>
            </group>

            <Crowd count={30} opacity={op} />
            <Traffic count={12} type="bike" speedMul={0.6} opacity={op} />

            {/* Market Stalls scattered */}
            {[[-4, 2], [5, 4], [4, -1], [-4, -4]].map(([x, z], i) => (
                <group key={i} position={[x, -0.9, z]} rotation={[0, Math.random() * Math.PI, 0]}>
                    <mesh castShadow><boxGeometry args={[1.5, 0.8, 1]} />{mat('#8d6e63', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, 0.8, 0]} castShadow><coneGeometry args={[1.2, 0.5, 4]} />{mat('#e53935', { transparent: true, opacity: op })}</mesh>
                </group>
            ))}
        </group>
    )
}

function Era1996({ era }) {
    const op = eraOpacity(era, 0.3, 1.0, 2.2)
    if (op < 0.01) return null
    return (
        <group>
            {/* Dense Tube Houses (Nhà ống) */}
            <GenericCityBlocks count={40} heightRange={[2, 5.5]} colors={['#fff9c4', '#ffecb3', '#ffe0b2', '#f8bbd0', '#c8e6c9', '#bbdefb']} opacity={op} />
            <PowerPoles opacity={op} />
            <TreeForest count={30} opacity={op} type="green" />

            <Crowd count={40} opacity={op} />
            <Traffic count={18} type="mixed" speedMul={0.8} opacity={op} />

            {/* Small shops */}
            {Array.from({ length: 6 }).map((_, i) => (
                <group key={i} position={[Math.random() > 0.5 ? -4 : 4, -0.5, -8 + i * 3]}>
                    <mesh castShadow><boxGeometry args={[2, 2, 2]} />{mat('#ffffff', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, 1, 1.05]}><planeGeometry args={[1.8, 0.6]} />{mat('#d32f2f', { transparent: true, opacity: op })}</mesh>
                    {/* Awning */}
                    <mesh position={[0, 0.5, 1.4]} rotation={[0.3, 0, 0]}><boxGeometry args={[2, 0.1, 1]} />{mat('#1976d2', { transparent: true, opacity: op })}</mesh>
                </group>
            ))}
        </group>
    )
}

function Era2006({ era }) {
    const op = eraOpacity(era, 1.2, 2.0, 3.2)
    if (op < 0.01) return null
    return (
        <group>
            {/* Medium glass buildings & concrete logic */}
            <GenericCityBlocks count={20} heightRange={[3, 7]} colors={['#e3f2fd', '#bbdefb']} opacity={op} glass />
            <GenericCityBlocks count={30} heightRange={[2, 5]} colors={['#ffffff', '#f5f5f5', '#eeeeee']} opacity={op} />
            <TreeForest count={40} opacity={op} type="green" />

            <Crowd count={45} opacity={op} />
            <Traffic count={20} type="mixed" speedMul={1.2} opacity={op} />

            {/* Billboards */}
            {[[-5, -5], [5, 2]].map(([x, z], i) => (
                <group key={i} position={[x, 3, z]} rotation={[0, x > 0 ? -0.5 : 0.5, 0]}>
                    <mesh castShadow><boxGeometry args={[0.2, 4, 0.2]} />{mat('#757575', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[0.3, 3, 4]} />{mat('#1e88e5', { transparent: true, opacity: op })}</mesh>
                    <mesh position={[x > 0 ? -0.16 : 0.16, 2, 0]}><planeGeometry args={[3.8, 2.8]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={op} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

function Era2016({ era }) {
    const op = eraOpacity(era, 2.2, 3.0, 3.8)
    if (op < 0.01) return null
    return (
        <group>
            {/* High-rise & modern commercial */}
            <GenericCityBlocks count={40} heightRange={[4, 10]} colors={['#e0f7fa', '#ffffff', '#f3e5f5']} opacity={op} glass />
            <TreeForest count={50} opacity={op} type="green" />

            {/* Giant LED Screens on buildings */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh key={i} position={[Math.random() > 0.5 ? -6 : 6, 4, -8 + i * 4]}>
                    <boxGeometry args={[0.2, 3, 5]} />
                    <meshStandardMaterial color={['#00e676', '#ff4081', '#00e5ff', '#ffca28'][i]} emissive={['#00e676', '#ff4081', '#00e5ff', '#ffca28'][i]} emissiveIntensity={1.5} transparent opacity={op} />
                </mesh>
            ))}

            <Crowd count={60} opacity={op} />
            <Traffic count={25} type="car" speedMul={1.5} opacity={op} />
        </group>
    )
}

function Era2026({ era }) {
    const op = clamp((era - 3.2) * 1.2, 0, 1)
    if (op < 0.01) return null
    return (
        <group>
            {/* Supertall dense glass city */}
            <GenericCityBlocks count={60} heightRange={[6, 18]} colors={['#ffffff', '#e0f7fa', '#e3f2fd']} opacity={op} glass />
            <TreeForest count={80} opacity={op} type="green" />

            {/* Neon Rings / Sky Bridges */}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[0, 8 + i * 2.5, -10 + i * 2]} rotation={[-Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[Math.random() * 4 + 3, 0.1, 8, 50]} />
                    <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} transparent opacity={op} />
                </mesh>
            ))}

            <Crowd count={80} opacity={op} />
            <Traffic count={30} type="car" speedMul={2.0} opacity={op} />

            {/* Flying Drones */}
            {Array.from({ length: 8 }).map((_, i) => (
                <group key={i} position={[randomRange(-8, 8), randomRange(7, 12), randomRange(-10, 10)]}>
                    <mesh><boxGeometry args={[0.4, 0.1, 0.4]} /><meshStandardMaterial color="#fff" transparent opacity={op} /></mesh>
                    <mesh position={[0, -0.1, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={3} transparent opacity={op} /></mesh>
                </group>
            ))}

            <mesh position={[0, -1.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <torusGeometry args={[8, 0.05, 8, 100]} />
                <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2.5} transparent opacity={op} />
            </mesh>
        </group>
    )
}

// ── Red Dot (gamification) ─────────────────────────────────────────
function RedDot3D({ position, onClick, resolved }) {
    const ref = useRef()
    useFrame((state, dt) => {
        if (!ref.current || resolved) return
        ref.current.rotation.y += dt * 1.8
        ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3.5) * 0.18)
    })
    if (resolved) return null
    return (
        <group position={position}>
            <mesh ref={ref} onClick={onClick}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={2} transparent opacity={0.9} />
            </mesh>
            {/* Pulsing ring indicator */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.45, 32]} />
                <meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={2} transparent opacity={0.6} />
            </mesh>
        </group>
    )
}

// ── Main Scene Content ─────────────────────────────────────────────
function SceneContent({ year, resolvedDots, onDotClick }) {
    const era = clamp((year - 1986) / (2026 - 1986) * 4, 0, 4)

    const showDots = year <= 1995
    const dotPositions = [[-2.5, 2.5, -2], [3.5, 1.0, 1.5], [0, 0, 4]]

    // SMOOTH VIBRANT COLORS
    const skyColor = useMemo(() => {
        const colors = ['#90a4ae', '#81d4fa', '#29b6f6', '#ffb74d', '#e0f7fa']
        const i = Math.floor(era)
        if (i >= 4) return colors[4]
        return colorLerp(colors[i], colors[i + 1], era - i)
    }, [era])

    const sunColor = useMemo(() => {
        const colors = ['#ffffff', '#ffffff', '#ffffff', '#fff3e0', '#ffffff']
        const i = Math.floor(era)
        if (i >= 4) return colors[4]
        return colorLerp(colors[i], colors[i + 1], era - i)
    }, [era])

    return (
        <>
            <color attach="background" args={[skyColor]} />
            <fog attach="fog" args={[skyColor, 15, 65]} />

            <ambientLight intensity={1.5} color="#ffffff" />

            <directionalLight
                position={[15, 25, 10]}
                intensity={2.0}
                color={sunColor}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.0005}
            />

            <directionalLight position={[-15, 15, -15]} intensity={1.2} color="#e3f2fd" />

            <Environment preset="city" />

            <Road era={era} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]} receiveShadow>
                <planeGeometry args={[100, 100, 40, 40]} />
                <meshStandardMaterial color="#00e5ff" wireframe transparent opacity={0.1} emissive="#00e5ff" emissiveIntensity={0.2} />
            </mesh>

            <group position={[0, 0, 0]}>
                <Era1986 era={era} />
                <Era1996 era={era} />
                <Era2006 era={era} />
                <Era2016 era={era} />
                <Era2026 era={era} />
            </group>

            {showDots && dotPositions.map((pos, i) => (
                <RedDot3D key={i} position={pos} onClick={() => onDotClick(i)} resolved={resolvedDots.includes(i)} />
            ))}

            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.5} far={15} color="#000000" />

            <OrbitControls
                makeDefault enableDamping dampingFactor={0.05}
                minDistance={5} maxDistance={35}
                maxPolarAngle={Math.PI * 0.48}
                autoRotate={false}
            />
        </>
    )
}

// ── Exported Canvas ────────────────────────────────────────────────
export default function Scene3D({ year, resolvedDots, onDotClick }) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 8, 20], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        >
            <SceneContent year={year} resolvedDots={resolvedDots} onDotClick={onDotClick} />
        </Canvas>
    )
}
