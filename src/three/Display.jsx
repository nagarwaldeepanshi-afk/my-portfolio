import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { DISPLAY_POS, DISPLAY_SIZE, SCREEN_INSET, STAND_BASE_WORLD, PROJECTS_TIMELINE } from './sceneLayout.js'
import { smoothstep } from './timeline.js'
import ProjectsScreenContent from '../components/ProjectsScreenContent.jsx'

const CONTENT_PX_W = 900
const CONTENT_SCALE = SCREEN_INSET.w / CONTENT_PX_W

export default function Display({ progress = 0 }) {
  const screenMatRef = useRef(null)
  const contentGroupRef = useRef(null)
  const [x, y, z] = DISPLAY_POS

  useFrame((state) => {
    const power = smoothstep(PROJECTS_TIMELINE.powerStart, PROJECTS_TIMELINE.powerEnd, progress)
    let flicker = 0
    if (power > 0.02 && power < 0.96 && Math.random() < 0.06) {
      flicker = Math.random() * 0.5
    }
    if (screenMatRef.current) {
      screenMatRef.current.emissiveIntensity = Math.max(0.02, power * 1.3 - flicker)
    }

    const contentReveal = smoothstep(PROJECTS_TIMELINE.contentStart, PROJECTS_TIMELINE.contentEnd, progress)
    const group = contentGroupRef.current
    if (group) {
      group.visible = contentReveal > 0.02
      const s = CONTENT_SCALE * (0.92 + contentReveal * 0.08)
      group.scale.set(s, s, s)
    }
  })

  return (
    <group>
      {/* stand base + pole */}
      <mesh position={[STAND_BASE_WORLD[0], STAND_BASE_WORLD[1] - 0.05, STAND_BASE_WORLD[2]]}>
        <cylinderGeometry args={[0.38, 0.46, 0.06, 28]} />
        <meshStandardMaterial color="#111318" roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[x, y - 1.05, z - 0.05]}>
        <boxGeometry args={[0.1, 1.05, 0.1]} />
        <meshStandardMaterial color="#111318" roughness={0.5} metalness={0.35} />
      </mesh>

      {/* bezel */}
      <mesh position={[x, y, z]}>
        <boxGeometry args={[DISPLAY_SIZE.w, DISPLAY_SIZE.h, DISPLAY_SIZE.depth]} />
        <meshStandardMaterial color="#0d0e12" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* screen surface — glows on as it powers up */}
      <mesh position={[x, y, z + DISPLAY_SIZE.depth / 2 + 0.004]}>
        <planeGeometry args={[SCREEN_INSET.w, SCREEN_INSET.h]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#02030a"
          emissive="#dfe8ff"
          emissiveIntensity={0}
          roughness={0.3}
        />
      </mesh>

      {/* project cards, mapped onto the screen once powered */}
      <group
        ref={contentGroupRef}
        position={[x - SCREEN_INSET.w / 2, y + SCREEN_INSET.h / 2, z + DISPLAY_SIZE.depth / 2 + 0.02]}
        visible={false}
      >
        <Html transform occlude={false} style={{ pointerEvents: 'auto' }}>
          <div style={{ transform: `scale(1)`, transformOrigin: 'top left' }}>
            <ProjectsScreenContent />
          </div>
        </Html>
      </group>
    </group>
  )
}
