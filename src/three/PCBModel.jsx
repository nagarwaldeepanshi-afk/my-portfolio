import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CHIPS, PCB_X_OFFSET, BOARD_W, BOARD_H, BOARD_DEPTH, CONNECTOR_LOCAL } from './pcbLayout.js'
import { TIMELINE, smoothstep } from './timeline.js'

const TRACE_PATHS = [
  [[-4.4, 1.3], [-3.65, 1.3]],
  [[-2.15, 1.3], [-1.2, 1.3], [-1.2, 0.4]],
  [[-0.2, -0.85], [-0.2, 0.4], [-1.2, 0.4]],
  [[0.8, -1.4], [1.15, -1.4], [1.15, -1.1]],
  [[1.95, 1.1], [3.2, 1.1], [3.2, 2.6]],
  [[2.6, 0.45], [2.6, -0.3], [1.7, -0.3], [1.7, -1.1]],
  [[-2.6, -0.75], [-2.6, 0.0], [-0.2, 0.0], [-0.2, -0.85]],
  [[-3.65, -1.2], [-4.4, -1.2]],
  [[2.25, -1.5], [4.4, -1.5]],
  [[-2.9, 1.8], [-2.9, 2.6], [4.4, 2.6]],
  [[0.8, -1.85], [0.8, -2.6]],
  [[-0.2, -1.95], [-0.2, -2.6]],
]

const HOLE_CORNERS = [
  [-BOARD_W / 2 + 0.35, -BOARD_H / 2 + 0.35],
  [BOARD_W / 2 - 0.35, -BOARD_H / 2 + 0.35],
  [-BOARD_W / 2 + 0.35, BOARD_H / 2 - 0.35],
  [BOARD_W / 2 - 0.35, BOARD_H / 2 - 0.35],
]

const TRACE_THICKNESS = 0.045
const TRACE_Z = BOARD_DEPTH / 2 + 0.005

function TraceSegment({ a, b }) {
  const { length, midX, midY, angle } = useMemo(() => {
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    return {
      length: Math.hypot(dx, dy),
      midX: (a[0] + b[0]) / 2,
      midY: (a[1] + b[1]) / 2,
      angle: Math.atan2(dy, dx),
    }
  }, [a, b])

  return (
    <mesh position={[midX, midY, TRACE_Z]} rotation={[0, 0, angle]}>
      <boxGeometry args={[length, TRACE_THICKNESS, 0.008]} />
      <meshStandardMaterial
        color="#1db8a8"
        emissive="#40e0d0"
        emissiveIntensity={1.4}
        roughness={0.35}
        metalness={0.2}
      />
    </mesh>
  )
}

function Traces() {
  const segments = useMemo(() => {
    const segs = []
    TRACE_PATHS.forEach((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        segs.push([path[i], path[i + 1]])
      }
    })
    return segs
  }, [])

  return (
    <group>
      {segments.map(([a, b], i) => (
        <TraceSegment key={i} a={a} b={b} />
      ))}
    </group>
  )
}

function ChipPins({ chip }) {
  const pins = useMemo(() => {
    const list = []
    const pinCount = Math.max(3, Math.round(chip.w * 4))
    for (let i = 0; i < pinCount; i++) {
      const t = pinCount > 1 ? i / (pinCount - 1) : 0.5
      const x = chip.cx - chip.w / 2 + t * chip.w
      list.push([x, chip.cy - chip.h / 2 - 0.045])
      list.push([x, chip.cy + chip.h / 2 + 0.045])
    }
    return list
  }, [chip])

  return (
    <group>
      {pins.map(([x, y], i) => (
        <mesh key={i} position={[x, y, TRACE_Z]}>
          <boxGeometry args={[0.05, 0.09, 0.012]} />
          <meshStandardMaterial color="#d9c27a" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Chip({ chip }) {
  const depth = 0.16
  return (
    <group>
      <mesh position={[chip.cx, chip.cy, BOARD_DEPTH / 2 + depth / 2]} castShadow>
        <boxGeometry args={[chip.w, chip.h, depth]} />
        <meshStandardMaterial color="#15161b" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* pin-1 notch marker */}
      <mesh
        position={[
          chip.cx - chip.w / 2 + 0.09,
          chip.cy + chip.h / 2 - 0.09,
          BOARD_DEPTH / 2 + depth + 0.004,
        ]}
      >
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#9aa0ad" roughness={0.6} />
      </mesh>
      <ChipPins chip={chip} />
    </group>
  )
}

function MountingHoles() {
  return (
    <group>
      {HOLE_CORNERS.map(([x, y], i) => (
        <group key={i} position={[x, y, BOARD_DEPTH / 2 + 0.002]}>
          <mesh>
            <ringGeometry args={[0.1, 0.16, 24]} />
            <meshStandardMaterial color="#c7ccd6" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <circleGeometry args={[0.1, 24]} />
            <meshStandardMaterial color="#05060a" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function ConnectorNub() {
  const [x, y, z] = CONNECTOR_LOCAL
  return (
    <mesh position={[x + 0.12, y, z + 0.03]} castShadow>
      <boxGeometry args={[0.32, 0.22, 0.14]} />
      <meshStandardMaterial color="#d9c27a" metalness={0.9} roughness={0.25} emissive="#7c5cff" emissiveIntensity={0.15} />
    </mesh>
  )
}

export default function PCBModel({ progress = 0 }) {
  const groupRef = useRef(null)

  useFrame((state) => {
    const reveal = smoothstep(TIMELINE.solidStart, TIMELINE.solidEnd, progress)
    const group = groupRef.current
    if (!group) return

    group.visible = reveal > 0.01
    const scale = 0.94 + reveal * 0.06
    group.scale.setScalar(scale)

    // gentle idle bob once fully formed
    const t = state.clock.elapsedTime
    group.position.y = reveal > 0.98 ? Math.sin(t * 0.35) * 0.04 : 0

    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.material.transparent = true
        obj.material.opacity = reveal
      }
    })
  })

  return (
    <group ref={groupRef} position={[PCB_X_OFFSET, 0, 0]} visible={false}>
      <mesh receiveShadow>
        <boxGeometry args={[BOARD_W, BOARD_H, BOARD_DEPTH]} />
        <meshStandardMaterial color="#0b1410" roughness={0.65} metalness={0.12} />
      </mesh>
      <Traces />
      {CHIPS.map((chip, i) => (
        <Chip key={i} chip={chip} />
      ))}
      <MountingHoles />
      <ConnectorNub />
    </group>
  )
}
