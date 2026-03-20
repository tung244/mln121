import React, { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { connectMqtt, disconnectMqtt, publishMessage, publishSceneSignal } from '../services/mqttService'
import MapAudioPlayer from './MapAudioPlayer'

function Model({ url }) {
  const { scene } = useGLTF(url)

  const optimizedScene = useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false
        child.receiveShadow = false
        child.frustumCulled = true
        if (child.material) {
          child.material.metalness = 0
          child.material.roughness = 1
          child.material.envMapIntensity = 0
        }
      }
    })
    return scene
  }, [scene])

  return <primitive object={optimizedScene} />
}

// Preload scenes for smooth transitions
const preloadScene = (url) => {
  useGLTF.preload(url)
}

// Controls WASD Movement
function FpsControls({ onUnlock, eyeHeight = 0.8 }) {
  const { camera } = useThree()
  const controlsRef = useRef()
  const speed = 2 // units per second

  useEffect(() => {
    // Reset camera position for FPS
    camera.position.set(0, eyeHeight, 5)
    camera.rotation.set(0, 0, 0)

    const keys = { w: false, a: false, s: false, d: false }
    const onKeyDown = (e) => { const k = e.key.toLowerCase(); if (keys.hasOwnProperty(k)) keys[k] = true }
    const onKeyUp = (e) => { const k = e.key.toLowerCase(); if (keys.hasOwnProperty(k)) keys[k] = false }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let reqId
    let lastTime = performance.now()

    const update = () => {
      reqId = requestAnimationFrame(update)
      const now = performance.now()
      const delta = (now - lastTime) / 1000
      lastTime = now

      if (!controlsRef.current || !controlsRef.current.isLocked) return

      const moveZ = (keys.s ? 1 : 0) - (keys.w ? 1 : 0)
      const moveX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0)

      // Move camera relative to its current orientation
      controlsRef.current.moveRight(moveX * speed * delta)
      controlsRef.current.moveForward(-moveZ * speed * delta)

      // Force ground height lock
      camera.position.y = eyeHeight
    }
    update()

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(reqId)
    }
  }, [camera])

  return (
    <>
      <PointerLockControls ref={controlsRef} onUnlock={onUnlock} pointerSpeed={0.4} />
    </>
  )
}

export default function GLBViewer({ onClose }) {
  const [viewMode, setViewMode] = useState('fps') // 'fps' or 'orbit'
  const [modelUrl, setModelUrl] = useState('/6.glb')
  const [mqttConnected, setMqttConnected] = useState(false)

  // Scene navigation sequence
  const scenes = ['/6.glb', '/9.glb', '/11.glb', '/14.glb']
  const currentSceneIndex = scenes.indexOf(modelUrl)

  // Map each scene to an audio source (ví dụ: cần cập nhật link thực tế)
  const sceneAudioMap = {
    '/6.glb': '/audio/6.mp3',
    '/9.glb': '/audio/9.mp3',
    '/11.glb': '/audio/11.mp3',
    '/14.glb': '/audio/14.mp3'
  }

  const handleNext = () => {
    if (currentSceneIndex < scenes.length - 1) {
      const nextScene = scenes[currentSceneIndex + 1]
      setModelUrl(nextScene)
      // Preload scene sau nếu có
      if (currentSceneIndex + 2 < scenes.length) {
        preloadScene(scenes[currentSceneIndex + 2])
      }
      // Gửi tín hiệu MQTT cho scene tiếp theo
      if (nextScene === '/6.glb') publishSceneSignal('6')
      else if (nextScene === '/9.glb') publishSceneSignal('9')
      else if (nextScene === '/11.glb') publishSceneSignal('11')
      else if (nextScene === '/14.glb') publishSceneSignal('14')
    }
  }

  const handleBack = () => {
    if (currentSceneIndex > 0) {
      const prevScene = scenes[currentSceneIndex - 1]
      setModelUrl(prevScene)
      // Preload scene trước nếu có
      if (currentSceneIndex - 2 >= 0) {
        preloadScene(scenes[currentSceneIndex - 2])
      }
      // Gửi tín hiệu MQTT cho scene trước đó
      if (prevScene === '/6.glb') publishSceneSignal('6')
      else if (prevScene === '/9.glb') publishSceneSignal('9')
      else if (prevScene === '/11.glb') publishSceneSignal('11')
      else if (prevScene === '/14.glb') publishSceneSignal('14')
    }
  }

  // MQTT Connection initialization
  useEffect(() => {
    const client = connectMqtt()

    // Listen to connection event to update UI
    client.on('connect', () => {
      setMqttConnected(true)
      // Gửi tín hiệu khi kết nối thành công
      setTimeout(() => publishSceneSignal('6'), 500)
    })

    client.on('close', () => {
      setMqttConnected(false)
    })

    client.on('error', () => {
      setMqttConnected(false)
    })

    // Preload next scene khi viewer mở
    preloadScene('/9.glb')

    return () => {
      disconnectMqtt()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[999] bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'linear-gradient(to right, #ffffff11 1px, transparent 1px), linear-gradient(to bottom, #ffffff11 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-20 px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-red-400 backdrop-blur-md transition-all"
      >
        ✕ Đóng Viewer
      </button>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {/* Navigation Buttons */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={handleBack}
            disabled={currentSceneIndex === 0}
            className={`px-4 py-2 font-mono text-xs rounded-xl transition-all border shadow-lg backdrop-blur-md ${currentSceneIndex === 0 ? 'bg-gray-600/50 text-gray-400 border-gray-700 cursor-not-allowed opacity-50' : 'bg-blue-600/90 text-white border-blue-400 hover:bg-blue-500'}`}
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentSceneIndex === scenes.length - 1}
            className={`px-4 py-2 font-mono text-xs rounded-xl transition-all border shadow-lg backdrop-blur-md ${currentSceneIndex === scenes.length - 1 ? 'bg-gray-600/50 text-gray-400 border-gray-700 cursor-not-allowed opacity-50' : 'bg-green-600/90 text-white border-green-400 hover:bg-green-500'}`}
          >
            Next →
          </button>
        </div>

        {/* Scene Indicator */}
        <div className="text-cyan-300 font-mono text-xs px-3 py-1 rounded-lg bg-black/60 border border-cyan-500/50 mb-2">
          {currentSceneIndex + 1} / {scenes.length}
        </div>

        {/* View Mode Toggle - Only show when in Orbit mode to allow going back to FPS */}
        {viewMode === 'orbit' && (
          <button
            onClick={() => setViewMode('fps')}
            className="px-4 py-2 font-mono text-xs rounded-xl transition-all border shadow-lg backdrop-blur-md bg-pink-600/90 text-white border-pink-400 animate-pulse"
          >
            🚶 Tiếp tục đi bộ (FPS)
          </button>
        )}
      </div>

      {/* MQTT Controls Panel inside Viewer */}
      <div className="absolute top-28 right-4 z-20 flex flex-col gap-2 p-3 rounded-xl border border-cyan-500/30 backdrop-blur-md bg-black/40 shadow-[0_0_15px_rgba(0,255,255,0.1)] items-end">
        <div className="text-cyan-400 font-mono text-[10px] flex items-center gap-2 mb-1">
          ESP32 MQTT: {mqttConnected ? 'CONNECTED' : 'DISCONNECTED'}
          <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-500 shadow-[0_0_5px_#00ff00]' : 'bg-red-500 shadow-[0_0_5px_#ff0000]'} animate-pulse`}></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => publishMessage({ msgs: 'ON' })}
            disabled={!mqttConnected}
            className="px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold transition-all hover:scale-105 bg-green-900/80 border border-green-400 text-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,255,0,0.3)]"
          >
            🟢 BẬT (ON)
          </button>
          <button
            onClick={() => publishMessage({ msgs: 'OFF' })}
            disabled={!mqttConnected}
            className="px-4 py-1.5 rounded-lg font-orbitron text-xs font-bold transition-all hover:scale-105 bg-red-900/80 border border-red-400 text-red-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(255,0,0,0.3)]"
          >
            🔴 TẮT (OFF)
          </button>
        </div>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center transform hover:scale-105 transition-transform duration-500">
        <h1 className="text-5xl md:text-7xl font-orbitron font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)] animate-pulse">
          {modelUrl === '/6.glb' ? '6' : modelUrl === '/9.glb' ? '9' : modelUrl === '/11.glb' ? '11' : '14'}
        </h1>
        <div className="text-cyan-200 mt-2 font-mono tracking-[0.3em] uppercase text-sm opacity-80 backdrop-blur-sm border border-cyan-500/30 px-6 py-1 rounded-full inline-block bg-black/40">
          Kỷ Nguyên Đổi Mới Số
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 5, 10], fov: 60 }}
        dpr={[1, 1]}
        performance={{ min: 0.1 }}
        gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
        key={modelUrl} // Force remount when model changes to reset camera
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
        </Suspense>

        {viewMode === 'orbit' ? (
          <OrbitControls makeDefault autoRotate autoRotateSpeed={0.2} enablePan={true} enableDamping dampingFactor={0.05} />
        ) : (
          <FpsControls 
            onUnlock={() => setViewMode('orbit')} 
            eyeHeight={modelUrl === '/14.glb' ? 0.3 : 0.8}
          />
        )}
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-200/90 font-mono text-sm pointer-events-none bg-black/60 px-6 py-2 rounded-full border border-cyan-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,255,0.3)]">
        {viewMode === 'orbit'
          ? "✨ Chuột trái: Xoay | Lăn chuột: Thu phóng | Chuột phải: Di chuyển ✨"
          : "✨ Nhấn chuột vào màn hình: Đi bộ | W A S D: Di chuyển | Phím ESC: Chuột bình thường ✨"}
      </div>

      {/* Tích hợp Audio Player nổi ở góc phải dưới cho Scene hiện tại */}
      <MapAudioPlayer 
        src={sceneAudioMap[modelUrl]} 
        title={`Thuyết minh: ${modelUrl.replace('/', '').replace('.glb', '')}`} 
      />
    </div>
  )
}
