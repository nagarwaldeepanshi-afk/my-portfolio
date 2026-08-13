import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildCableCurve, PROJECTS_TIMELINE } from './sceneLayout.js'
import { smoothstep } from './timeline.js'

const MAX_SEGMENTS = 48

export default function UsbCable({ progress = 0 }) {
  const meshRef = useRef(null)
  const curve = useMemo(() => buildCableCurve(), [])
  const lastRevealRef = useRef(-1)

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const reveal = smoothstep(PROJECTS_TIMELINE.cableStart, PROJECTS_TIMELINE.cableEnd, progress)
    mesh.visible = reveal > 0.01
    if (reveal <= 0.01) return
    if (Math.abs(reveal - lastRevealRef.current) < 0.004) return
    lastRevealRef.current = reveal

    const segments = Math.max(2, Math.round(reveal * MAX_SEGMENTS))
    const points = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * reveal
      points.push(curve.getPointAt(Math.min(1, t)))
    }
    if (points.length < 2) return
    const subCurve = new THREE.CatmullRomCurve3(points)
    const geo = new THREE.TubeGeometry(subCurve, Math.max(6, segments), 0.045, 8, false)
    mesh.geometry.dispose()
    mesh.geometry = geo
  })

  return (
    <mesh ref={meshRef} visible={false}>
      <tubeGeometry args={[curve, 8, 0.045, 8, false]} />
      <meshStandardMaterial color="#17181d" roughness={0.45} metalness={0.2} />
    </mesh>
  )
}
