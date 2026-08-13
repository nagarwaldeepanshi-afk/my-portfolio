import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildAsciiAtlas } from './asciiAtlas.js'
import { generatePCBLayout, PCB_X_OFFSET } from './pcbLayout.js'
import { TIMELINE, smoothstep } from './timeline.js'

const COUNT = 1600

const VERTEX_SHADER = /* glsl */ `
  attribute vec2 aGlyph;
  attribute float aOpacity;
  attribute float aTint;
  uniform float uCols;
  uniform float uRows;
  varying vec2 vUv;
  varying float vOpacity;
  varying float vTint;

  void main() {
    vUv = (uv + aGlyph) / vec2(uCols, uRows);
    vOpacity = aOpacity;
    vTint = aTint;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uGlobalOpacity;
  varying vec2 vUv;
  varying float vOpacity;
  varying float vTint;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    vec3 colorA = vec3(0.420, 0.420, 0.447);
    vec3 colorB = vec3(0.420, 0.420, 0.447);
    vec3 color = mix(colorA, colorB, vTint);
    float alpha = tex.a * vOpacity * uGlobalOpacity;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
  }
`

export default function AsciiField({ progress = 0 }) {
  const meshRef = useRef(null)
  const { camera } = useThree()

  const atlas = useMemo(() => buildAsciiAtlas(), [])
  const geometry = useMemo(() => new THREE.PlaneGeometry(0.16, 0.2), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: atlas.texture },
          uCols: { value: atlas.cols },
          uRows: { value: atlas.rows },
          uGlobalOpacity: { value: 1 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [atlas]
  )

  const pcbTargets = useMemo(() => generatePCBLayout(COUNT), [])

  // Per-particle simulation state, built once.
  const sim = useMemo(() => {
    const scatter = new Float32Array(COUNT * 3)
    const pcb = new Float32Array(COUNT * 3)
    const current = new Float32Array(COUNT * 3)
    const seed = new Float32Array(COUNT)
    const glyph = new Float32Array(COUNT * 2)
    const opacity = new Float32Array(COUNT)
    const tint = new Float32Array(COUNT)
    const floatPhase = new Float32Array(COUNT * 2)

    for (let i = 0; i < COUNT; i++) {
      const sx = (Math.random() - 0.5) * 13
      const sy = (Math.random() - 0.5) * 7.5
      const sz = (Math.random() - 0.5) * 3 - 0.5
      scatter[i * 3] = sx
      scatter[i * 3 + 1] = sy
      scatter[i * 3 + 2] = sz

      const p = pcbTargets[i] || [0, 0, 0]
      pcb[i * 3] = p[0]
      pcb[i * 3 + 1] = p[1]
      pcb[i * 3 + 2] = p[2]

      current[i * 3] = sx
      current[i * 3 + 1] = sy
      current[i * 3 + 2] = sz

      seed[i] = Math.random()
      glyph[i * 2] = Math.floor(Math.random() * atlas.cols)
      glyph[i * 2 + 1] = Math.floor(Math.random() * atlas.rows)
      opacity[i] = 0.35 + Math.random() * 0.65
      tint[i] = Math.random()
      floatPhase[i * 2] = Math.random() * Math.PI * 2
      floatPhase[i * 2 + 1] = 0.4 + Math.random() * 0.6
    }

    return { scatter, pcb, current, seed, glyph, opacity, tint, floatPhase }
  }, [atlas, pcbTargets])

  useLayoutEffect(() => {
    const geo = meshRef.current?.geometry
    if (!geo) return
    geo.setAttribute('aGlyph', new THREE.InstancedBufferAttribute(sim.glyph, 2))
    geo.setAttribute('aOpacity', new THREE.InstancedBufferAttribute(sim.opacity, 1))
    geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(sim.tint, 1))
  }, [sim])

  // Mouse tracking (independent of canvas pointer-events so it works even
  // when the canvas sits behind interactive HTML content).
  const mouseNDC = useRef(new THREE.Vector2(-10, -10))
  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0))
  const raycaster = useRef(new THREE.Raycaster())
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
  const prevMouseWorld = useRef(new THREE.Vector3())
  const mouseVelocity = useRef(0)

  useEffect(() => {
    const handleMove = (e) => {
      mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const progressRef = useRef(progress)
  progressRef.current = progress

  useFrame((state, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    raycaster.current.setFromCamera(mouseNDC.current, camera)
    const hit = new THREE.Vector3()
    if (raycaster.current.ray.intersectPlane(plane.current, hit)) {
      prevMouseWorld.current.copy(mouseWorld.current)
      mouseWorld.current.copy(hit)
      mouseVelocity.current = mouseWorld.current.distanceTo(prevMouseWorld.current)
    }

    const t = state.clock.elapsedTime
    const form = smoothstep(TIMELINE.formStart, TIMELINE.formEnd, progressRef.current) // 0 during hero, 1 once PCB shape is assembled
    const solidReveal = smoothstep(TIMELINE.solidStart, TIMELINE.solidEnd, progressRef.current) // 0 -> 1 as the realistic solid board takes over
    const repelStrength = Math.max(0, 1 - form * 1.3)

    const { scatter, pcb, current, seed, floatPhase, glyph, opacity } = sim
    let glyphDirty = false

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const delay = seed[i] * 0.55
      const localForm = smoothstep(0, 1, (form - delay) / Math.max(0.001, 1 - delay))

      const floatX = Math.sin(t * floatPhase[i * 2 + 1] + floatPhase[i * 2]) * 0.12 * (1 - localForm)
      const floatY = Math.cos(t * floatPhase[i * 2 + 1] * 0.8 + floatPhase[i * 2]) * 0.1 * (1 - localForm)
      const pulse = localForm > 0.98 ? Math.sin(t * 1.4 + seed[i] * 10) * 0.01 : 0

      let baseX = scatter[i3] + floatX
      let baseY = scatter[i3 + 1] + floatY
      let baseZ = scatter[i3 + 2]

      if (repelStrength > 0.01) {
        const dx = baseX - mouseWorld.current.x
        const dy = baseY - mouseWorld.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const radius = 2.1
        if (dist < radius) {
          const force = (1 - dist / radius) * 1.4 * repelStrength
          baseX += (dx / (dist + 0.001)) * force
          baseY += (dy / (dist + 0.001)) * force

          if (mouseVelocity.current > 0.01 && Math.random() < 0.06) {
            glyph[i * 2] = Math.floor(Math.random() * atlas.cols)
            glyph[i * 2 + 1] = Math.floor(Math.random() * atlas.rows)
            glyphDirty = true
          }
        }
      }

      const pcbX = pcb[i3] + PCB_X_OFFSET * localForm
      const targetX = baseX + (pcbX - baseX) * localForm
      const targetY = baseY + (pcb[i3 + 1] - baseY) * localForm
      const targetZ = baseZ + (pcb[i3 + 2] + pulse - baseZ) * localForm

      current[i3] += (targetX - current[i3]) * 0.09
      current[i3 + 1] += (targetY - current[i3 + 1]) * 0.09
      current[i3 + 2] += (targetZ - current[i3 + 2]) * 0.09

      dummy.position.set(current[i3], current[i3 + 1], current[i3 + 2])
      const s = 0.85 + 0.15 * localForm
      dummy.scale.set(s, s, s)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (glyphDirty) mesh.geometry.attributes.aGlyph.needsUpdate = true
    material.uniforms.uGlobalOpacity.value = Math.max(0.08, 1 - solidReveal * 0.92)

    void opacity
  })

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, COUNT]} frustumCulled={false} />
  )
}
