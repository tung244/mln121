import { useRef, useMemo, createContext, useContext } from 'react'
export const ObjectClickContext = createContext(null)
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Html, Float } from '@react-three/drei'
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
    const onObjectClick = useContext(ObjectClickContext)
    return (
        <group onClick={(e) => { e.stopPropagation(); onObjectClick && onObjectClick('road') }}>
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
                    {/* Thân cây */}
                    <mesh position={[0, 0.4 * t.size, 0]} castShadow><cylinderGeometry args={[0.06 * t.size, 0.1 * t.size, 0.8 * t.size, 6]} /><meshStandardMaterial color="#795548" transparent opacity={opacity} /></mesh>
                    {/* Tán cây Low-poly Icosahedron */}
                    <mesh position={[0, 1.0 * t.size, 0]} castShadow><icosahedronGeometry args={[0.45 * t.size, 1]} /><meshStandardMaterial color={cTop} flatShading transparent opacity={opacity} /></mesh>
                    <mesh position={[0, 1.4 * t.size, 0]} castShadow><icosahedronGeometry args={[0.35 * t.size, 1]} /><meshStandardMaterial color={cMid} flatShading transparent opacity={opacity} /></mesh>
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

    const onObjectClick = useContext(ObjectClickContext)
    return (
        <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onObjectClick && onObjectClick('person') }}>
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

    const onObjectClick = useContext(ObjectClickContext)
    return (
        <group ref={ref} onClick={(e) => { e.stopPropagation(); onObjectClick && onObjectClick('vehicle') }}>
            {vehicles.map((v, i) => (
                <group key={i} position={[v.x, -1.5, v.z]} rotation={[0, Math.PI / 2 * v.lane, 0]}>
                    {v.isCar ? (
                        <>
                            {/* Khung dưới ô tô */}
                            <mesh position={[0, 0.25, 0]} castShadow>
                                <boxGeometry args={[1.6, 0.35, 0.8]} />
                                <meshStandardMaterial color={v.color} metalness={0.6} roughness={0.3} transparent opacity={opacity} />
                            </mesh>
                            {/* Khoang lái */}
                            <mesh position={[-0.1, 0.55, 0]} castShadow>
                                <boxGeometry args={[0.8, 0.3, 0.7]} />
                                <meshPhysicalMaterial color="#222" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
                            </mesh>
                            {/* 4 Bánh xe */}
                            {[-0.45, 0.45].map((wx, wi) =>
                                [-0.4, 0.4].map((wz, wj) => (
                                    <mesh key={`w-${wi}-${wj}`} position={[wx, 0.15, wz]} rotation={[Math.PI / 2, 0, 0]}>
                                        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
                                        <meshStandardMaterial color="#111" />
                                    </mesh>
                                ))
                            )}
                            {/* Đèn pha */}
                            <group position={[0.8, 0.25, 0]}>
                                <mesh position={[0.01, 0, 0.25]}><boxGeometry args={[0.05, 0.1, 0.15]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} /></mesh>
                                <mesh position={[0.01, 0, -0.25]}><boxGeometry args={[0.05, 0.1, 0.15]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} /></mesh>
                            </group>
                            {/* Đèn hậu */}
                            <group position={[-0.8, 0.25, 0]}>
                                <mesh position={[-0.01, 0, 0.25]}><boxGeometry args={[0.05, 0.1, 0.15]} /><meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={2} /></mesh>
                                <mesh position={[-0.01, 0, -0.25]}><boxGeometry args={[0.05, 0.1, 0.15]} /><meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={2} /></mesh>
                            </group>
                        </>
                    ) : (
                        <>
                            {/* Xe máy */}
                            <mesh position={[0, 0.25, 0]} castShadow>
                                <boxGeometry args={[0.8, 0.4, 0.25]} />
                                <meshStandardMaterial color={v.color} metalness={0.2} roughness={0.6} transparent opacity={opacity} />
                            </mesh>
                            {/* 2 Bánh xe máy */}
                            <mesh position={[-0.3, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 12]} /><meshStandardMaterial color="#111" /></mesh>
                            <mesh position={[0.3, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.05, 12]} /><meshStandardMaterial color="#111" /></mesh>
                            {/* Người lái */}
                            <mesh position={[-0.1, 0.7, 0]}><capsuleGeometry args={[0.1, 0.2]} /><meshStandardMaterial color="#333" transparent opacity={opacity} /></mesh>
                            <mesh position={[-0.1, 0.95, 0]}><sphereGeometry args={[0.1]} /><meshStandardMaterial color="#ffccbc" /></mesh>
                        </>
                    )}
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

    const onObjectClick = useContext(ObjectClickContext)
    return (
        <group onClick={(e) => { e.stopPropagation(); onObjectClick && onObjectClick('store') }}>
            {blocks.map((b, i) => {
                const isModern = glass && b.h > 4;
                const isOld = !glass;
                return (
                    <group key={i} position={[b.x, -1.5 + b.h / 2, b.z]} rotation={[0, b.rot, 0]}>
                        {/* Đế tòa nhà */}
                        <mesh castShadow receiveShadow>
                            <boxGeometry args={[b.w, b.h, b.d]} />
                            {glass
                                ? <meshPhysicalMaterial color={b.color} transmission={0.9} metalness={0.8} roughness={0} transparent opacity={opacity} />
                                : <meshStandardMaterial color={b.color} roughness={0.9} transparent opacity={opacity} />
                            }
                        </mesh>

                        {/* Chi tiết tòa nhà hiện đại (Skyscrapers) */}
                        {isModern && (
                            <>
                                <mesh position={[0, b.h / 2 + b.h * 0.15, 0]} castShadow>
                                    <boxGeometry args={[b.w * 0.8, b.h * 0.3, b.d * 0.8]} />
                                    <meshPhysicalMaterial color={b.color} transmission={0.9} metalness={0.8} roughness={0} transparent opacity={opacity} />
                                </mesh>
                                {/* Dải đèn Neon vát viền */}
                                <mesh position={[b.w / 2 + 0.05, 0, b.d / 2 + 0.05]}><boxGeometry args={[0.05, b.h, 0.05]} /><meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} transparent opacity={opacity} /></mesh>
                            </>
                        )}

                        {/* Chi tiết nhà phố/nhà cũ (Tube Houses) */}
                        {isOld && (
                            <>
                                {/* Mái tôn dốc / chóp */}
                                <mesh position={[0, b.h / 2 + 0.3, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
                                    <coneGeometry args={[b.w * 0.7, 0.6, 4]} />
                                    <meshStandardMaterial color={is1986 ? '#d32f2f' : '#795548'} roughness={0.9} transparent opacity={opacity} flatShading />
                                </mesh>
                                {/* Ban công lồi */}
                                <mesh position={[0, b.h * 0.25 - b.h / 2, b.d / 2 + 0.15]} castShadow>
                                    <boxGeometry args={[b.w * 0.7, 0.2, 0.4]} />
                                    <meshStandardMaterial color="#9e9e9e" transparent opacity={opacity} />
                                </mesh>
                            </>
                        )}
                    </group>
                )
            })}
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

            {/* Siêu công trình 1986: Thủy điện Hòa Bình (Đang xây dựng) */}
            <group position={[-12, 0, -8]} rotation={[0, Math.PI / 4, 0]}>
                <mesh castShadow receiveShadow><boxGeometry args={[6, 4, 3]} />{mat('#757575', { transparent: true, opacity: op })}</mesh>
                {/* Các ống xả nước */}
                {[-1, 0, 1].map(x => (
                    <mesh key={x} position={[x * 1.5, 2, 1.6]} rotation={[Math.PI / 2, 0, 0]}>
                        <cylinderGeometry args={[0.5, 0.5, 1]} />{mat('#424242', { transparent: true, opacity: op })}
                    </mesh>
                ))}
                {/* Chữ: THỦY ĐIỆN HÒA BÌNH */}
                <Float speed={2} floatIntensity={0} rotationIntensity={0} position={[0, 4.5, 0]}>
                    <Html center zIndexRange={[100, 0]} className="pointer-events-none">
                        <div className="bg-red-700 text-yellow-300 font-bold px-4 py-1 border-2 border-yellow-300 shadow-lg text-xs whitespace-nowrap" style={{ opacity: op }}>THỦY ĐIỆN HÒA BÌNH</div>
                    </Html>
                </Float>
            </group>

            {/* Băng rôn ngang đường */}
            <group position={[0, 4, 0]}>
                <mesh><boxGeometry args={[14, 0.8, 0.1]} />{mat('#d32f2f', { transparent: true, opacity: op })}</mesh>
                <Html position={[0, 0, 0.06]} center zIndexRange={[100, 0]} className="pointer-events-none">
                    <div className="text-yellow-300 font-bold uppercase text-lg whitespace-nowrap drop-shadow-md" style={{ opacity: op }}>Nhiệt liệt chào mừng Đại hội VI</div>
                </Html>
            </group>
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

            {/* Siêu công trình 1996: Đường dây 500kV Bắc - Nam */}
            {Array.from({ length: 4 }).map((_, i) => (
                <group key={`line-${i}`} position={[-8, 0, -15 + i * 8]}>
                    {/* Trụ góc A */}
                    <mesh position={[-1, 4, 0]} rotation={[0, 0, 0.1]}><cylinderGeometry args={[0.05, 0.2, 8]} />{mat('#b0bec5', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                    <mesh position={[1, 4, 0]} rotation={[0, 0, -0.1]}><cylinderGeometry args={[0.05, 0.2, 8]} />{mat('#b0bec5', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                    {/* Xà ngang */}
                    <mesh position={[0, 6, 0]}><boxGeometry args={[4, 0.1, 0.1]} />{mat('#b0bec5', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                    <mesh position={[0, 4, 0]}><boxGeometry args={[5, 0.1, 0.1]} />{mat('#b0bec5', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                    {/* Dây điện (Line) */}
                    {i < 3 && [-1.5, 0, 1.5].map(x => (
                        <mesh key={x} position={[x, 6, 4]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 8]} />{mat('#222', { transparent: true, opacity: op })}</mesh>
                    ))}
                </group>
            ))}

            <Float speed={2} floatIntensity={0} rotationIntensity={0} position={[-8, 8, -5]}>
                <Html center zIndexRange={[100, 0]} className="pointer-events-none">
                    <div className="bg-red-700 text-yellow-300 font-bold px-3 py-1 border-2 border-yellow-300 shadow-lg text-xs whitespace-nowrap" style={{ opacity: op }}>ĐƯỜNG DÂY 500kV BẮC NAM</div>
                </Html>
            </Float>
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

            {/* Siêu công trình 2006: Cầu Mỹ Thuận ngầm hiểu phía xa */}
            <group position={[12, 0, -10]} rotation={[0, Math.PI / 4, 0]}>
                {/* Trụ cầu chữ H */}
                <mesh position={[-2, 6, 0]}><boxGeometry args={[0.6, 12, 1]} />{mat('#eeeeee', { transparent: true, opacity: op })}</mesh>
                <mesh position={[2, 6, 0]}><boxGeometry args={[0.6, 12, 1]} />{mat('#eeeeee', { transparent: true, opacity: op })}</mesh>
                <mesh position={[0, 10, 0]}><boxGeometry args={[4, 0.8, 0.8]} />{mat('#eeeeee', { transparent: true, opacity: op })}</mesh>
                <mesh position={[0, 4, 0]}><boxGeometry args={[4.5, 0.8, 0.8]} />{mat('#eeeeee', { transparent: true, opacity: op })}</mesh>

                {/* Dây văng */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <group key={`cable-${i}`}>
                        <mesh position={[-2, 7 + i * 0.8, -3 - i]} rotation={[Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 5]} />{mat('#9e9e9e', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                        <mesh position={[-2, 7 + i * 0.8, 3 + i]} rotation={[-Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 5]} />{mat('#9e9e9e', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                        <mesh position={[2, 7 + i * 0.8, -3 - i]} rotation={[Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 5]} />{mat('#9e9e9e', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                        <mesh position={[2, 7 + i * 0.8, 3 + i]} rotation={[-Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 5]} />{mat('#9e9e9e', { transparent: true, opacity: op, metalness: 0.8 })}</mesh>
                    </group>
                ))}

                {/* Mặt cầu */}
                <mesh position={[0, 4.5, 0]}><boxGeometry args={[5, 0.4, 25]} />{mat('#424242', { transparent: true, opacity: op })}</mesh>
            </group>

            <Float speed={2} floatIntensity={0} rotationIntensity={0} position={[12, 13, -10]}>
                <Html center zIndexRange={[100, 0]} className="pointer-events-none">
                    <div className="bg-blue-600/90 backdrop-blur text-white font-bold px-3 py-1 border border-blue-400 shadow-[0_0_10px_rgba(0,100,255,0.5)] rounded-lg text-xs whitespace-nowrap" style={{ opacity: op }}>CẦU MỸ THUẬN</div>
                </Html>
            </Float>
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

            {/* Siêu công trình: Landmark 81 mọc lên */}
            <group position={[15, 0, -15]} rotation={[0, -Math.PI / 4, 0]}>
                {/* Tòa nhà xếp tầng */}
                <mesh position={[0, 8, 0]}><boxGeometry args={[6, 16, 6]} />{mat('#e3f2fd', { transparent: true, opacity: op, metalness: 0.9, roughness: 0.1 })}</mesh>
                <mesh position={[0, 18, 0]}><boxGeometry args={[4, 8, 4]} />{mat('#bbdefb', { transparent: true, opacity: op, metalness: 0.9, roughness: 0.1 })}</mesh>
                <mesh position={[0, 24, 0]}><boxGeometry args={[2, 6, 2]} />{mat('#90caf9', { transparent: true, opacity: op, metalness: 0.9, roughness: 0.1 })}</mesh>
                {/* Spire */}
                <mesh position={[0, 28, 0]}><cylinderGeometry args={[0.05, 0.2, 6]} />{mat('#fff', { transparent: true, opacity: op, metalness: 1 })}</mesh>
                <mesh position={[0, 31, 0]}><sphereGeometry args={[0.2]} /><meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={3} transparent opacity={op} /></mesh>
            </group>
        </group>
    )
}

function MetroTrain({ opacity }) {
    const ref = useRef()
    useFrame((_, dt) => {
        if (!ref.current) return
        ref.current.position.z += 12 * dt
        if (ref.current.position.z > 20) ref.current.position.z = -20
    })
    return (
        <group ref={ref} position={[0, 0, -20]}>
            <mesh>
                <boxGeometry args={[1.5, 1.2, 8]} />
                <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1} transparent opacity={opacity} transmission={0.9} />
            </mesh>
            <mesh position={[0.76, 0.2, 0]}><boxGeometry args={[0.01, 0.6, 7]} />{mat('#111', { transparent: true, opacity: opacity })}</mesh>
            <mesh position={[-0.76, 0.2, 0]}><boxGeometry args={[0.01, 0.6, 7]} />{mat('#111', { transparent: true, opacity: opacity })}</mesh>
            <mesh position={[0, 0, 4.01]}><planeGeometry args={[1.2, 0.3]} /><meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} transparent opacity={opacity} /></mesh>
            <mesh position={[0, 0, -4.01]}><planeGeometry args={[1.2, 0.3]} /><meshStandardMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={2} transparent opacity={opacity} /></mesh>
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

            {/* Siêu công trình 2026: Tàu điện ngầm Metro (Chạy trên cao) */}
            <group position={[-6, 6, 0]}>
                {/* Đường ray */}
                <mesh position={[0, 0, 0]}><boxGeometry args={[2, 0.5, 40]} />{mat('#424242', { transparent: true, opacity: op })}</mesh>
                {/* Trụ đỡ */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <mesh key={`pillar-${i}`} position={[0, -3.2, -15 + i * 10]}><cylinderGeometry args={[0.6, 0.8, 6]} />{mat('#9e9e9e', { transparent: true, opacity: op })}</mesh>
                ))}
                {/* Tàu chạy */}
                <group position={[0, 0.8, 0]}>
                    <MetroTrain opacity={op} />
                </group>
            </group>

            {/* Hologram Signs siêu to lơ lửng */}
            <Float speed={3} floatIntensity={1} rotationIntensity={0.5} position={[0, 15, -8]}>
                <Html center zIndexRange={[100, 0]} className="pointer-events-none">
                    <div className="flex flex-col items-center">
                        <div className="text-cyan-400 font-orbitron font-bold text-5xl whitespace-nowrap drop-shadow-[0_0_20px_rgba(0,255,255,1)]" style={{ opacity: op }}>KỶ NGUYÊN VƯƠN MÌNH</div>
                        <div className="text-pink-400 font-mono font-bold text-2xl whitespace-nowrap drop-shadow-[0_0_15px_rgba(255,64,129,1)] mt-2 bg-black/50 px-4 py-1 rounded border border-pink-500/50" style={{ opacity: op }}>FDI: 36 TỶ USD</div>
                    </div>
                </Html>
            </Float>

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

// ── Historical Hotspots ─────────────────────────────────────────────
const HOTSPOTS = [
    { year: 1986, pos: [-3, 1, 0], title: '1986', desc: 'Chỉ thị 100 & Khoán 10', icon: '📝' },
    { year: 1996, pos: [3, 2, -4], title: '1995', desc: 'Bình thường hóa quan hệ Mỹ', icon: '🤝' },
    { year: 2006, pos: [-4, 3, -6], title: '2007', desc: 'Gia nhập WTO', icon: '🌐' },
    { year: 2016, pos: [5, 4, -8], title: '2016', desc: 'Chuyển đổi quốc gia số', icon: '📱' },
    { year: 2026, pos: [0, 5, -10], title: '2026', desc: 'Kỷ nguyên Xanh & AI', icon: '🌱' }
]

function HistoricalHotspots({ year }) {
    return (
        <group>
            {HOTSPOTS.map((h, i) => {
                const isActive = year >= h.year && year < (HOTSPOTS[i + 1]?.year || 2027)
                if (!isActive) return null
                return (
                    <Float key={i} speed={2} rotationIntensity={0} floatIntensity={0.5} position={h.pos}>
                        <Html center distanceFactor={15} zIndexRange={[100, 0]}>
                            <div className="flex flex-col items-center animate-pulse-slow group cursor-pointer" style={{ pointerEvents: 'auto' }}>
                                <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-transform group-hover:scale-125 mb-2">
                                    {h.icon}
                                </div>
                                <div className="bg-black/80 backdrop-blur-md border border-cyan-400 rounded-xl p-3 text-center pointer-events-none transform scale-0 group-hover:scale-100 transition-transform origin-bottom shadow-[0_0_20px_rgba(0,255,255,0.3)] min-w-[160px]">
                                    <div className="font-orbitron text-cyan-300 text-sm font-bold mb-1">{h.title}</div>
                                    <div className="font-mono text-xs text-white leading-tight">{h.desc}</div>
                                </div>
                            </div>
                        </Html>
                    </Float>
                )
            })}
        </group>
    )
}

// ── Main Scene Content ─────────────────────────────────────────────
function SceneContent({ year, resolvedDots, onDotClick, isCinematic, onObjectClick }) {
    const era = clamp((year - 1986) / (2026 - 1986) * 4, 0, 4)

    const showDots = year <= 1995
    const dotPositions = [[-2.5, 2.5, -2], [3.5, 1.0, 1.5], [0, 0, 4]]

    // VIBRANT TO CYBERPUNK COLORS
    // 1986: Sương mù xám (#78909c)
    // 1996: Trời trong (#81d4fa)
    // 2006: Ban ngày rực rỡ (#29b6f6)
    // 2016: Hoàng hôn (#ffb74d) -> (#1a237e)
    // 2026: Đêm Cyberpunk Neo-Tokyo (#090a0f)
    const skyColor = useMemo(() => {
        const colors = ['#78909c', '#81d4fa', '#29b6f6', '#1a237e', '#090a0f']
        const i = Math.floor(era)
        if (i >= 4) return colors[4]
        return colorLerp(colors[i], colors[i + 1], era - i)
    }, [era])

    const sunColor = useMemo(() => {
        const colors = ['#ffffff', '#ffffff', '#ffffff', '#b39ddb', '#00e5ff']
        const i = Math.floor(era)
        if (i >= 4) return colors[4]
        return colorLerp(colors[i], colors[i + 1], era - i)
    }, [era])

    // Cinematic Camera Path
    const controlsRef = useRef()
    useFrame((state) => {
        if (isCinematic) {
            // Bay lượn đẹp mắt qua thành phố
            const targetX = Math.sin(era * Math.PI * 0.4) * 12
            const targetY = 8 + era * 2.5
            const targetZ = 20 - era * 5

            state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02)

            // Xoay camera nhìn mượt về phía trước
            const lookTarget = new THREE.Vector3(0, era * 2, -10)
            if (controlsRef.current) {
                controlsRef.current.target.lerp(lookTarget, 0.05)
                controlsRef.current.update()
            }
        }
    })

    return (
        <ObjectClickContext.Provider value={onObjectClick}>
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

            <HistoricalHotspots year={year} />

            {showDots && dotPositions.map((pos, i) => (
                <RedDot3D key={i} position={pos} onClick={() => onDotClick(i)} resolved={resolvedDots.includes(i)} />
            ))}

            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.5} far={15} color="#000000" />

            <OrbitControls
                ref={controlsRef}
                makeDefault enableDamping dampingFactor={0.05}
                minDistance={5} maxDistance={35}
                maxPolarAngle={Math.PI * 0.48}
                autoRotate={false}
                enabled={!isCinematic}
            />
        </ObjectClickContext.Provider>
    )
}

// ── Exported Canvas ────────────────────────────────────────────────
export default function Scene3D({ year, resolvedDots, onDotClick, isCinematic, onObjectClick }) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 8, 20], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        >
            <SceneContent year={year} resolvedDots={resolvedDots} onDotClick={onDotClick} isCinematic={isCinematic} onObjectClick={onObjectClick} />
        </Canvas>
    )
}
