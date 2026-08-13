import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_KEYFRAMES, PROJECTS_TIMELINE } from './sceneLayout.js'
import { smoothstep } from './timeline.js'

// Smoothly dollies/pans the camera across the whole Hero -> About ->
// Projects journey: centered on hero, drifting toward the PCB as it forms,
// panning right to a wide establishing shot once the cable/display appear,
// then pushing in tight on the screen as the project cards reveal.
export default function CameraRig({ heroAboutProgress = 0, projectsProgress = 0, projectsActive = false }) {
  const { camera } = useThree()
  const lookRef = useRef(new THREE.Vector3(0, 0, 0))
  const fovRef = useRef(CAMERA_KEYFRAMES.hero.fov)

  const heroPos = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.hero.pos))
  const heroLook = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.hero.look))
  const aboutPos = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.about.pos))
  const aboutLook = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.about.look))
  const widePos = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.projectsWide.pos))
  const wideLook = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.projectsWide.look))
  const zoomPos = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.projectsZoom.pos))
  const zoomLook = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES.projectsZoom.look))

  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())

  useFrame(() => {
    const aboutBlend = smoothstep(0, 1, heroAboutProgress)
    targetPos.current.copy(heroPos.current).lerp(aboutPos.current, aboutBlend)
    targetLook.current.copy(heroLook.current).lerp(aboutLook.current, aboutBlend)
    let targetFov = THREE.MathUtils.lerp(CAMERA_KEYFRAMES.hero.fov, CAMERA_KEYFRAMES.about.fov, aboutBlend)

    if (projectsActive) {
      const wideBlend = smoothstep(PROJECTS_TIMELINE.wideStart, PROJECTS_TIMELINE.wideEnd, projectsProgress)
      targetPos.current.lerp(widePos.current, wideBlend)
      targetLook.current.lerp(wideLook.current, wideBlend)
      targetFov = THREE.MathUtils.lerp(targetFov, CAMERA_KEYFRAMES.projectsWide.fov, wideBlend)

      const zoomBlend = smoothstep(PROJECTS_TIMELINE.zoomStart, PROJECTS_TIMELINE.zoomEnd, projectsProgress)
      targetPos.current.lerp(zoomPos.current, zoomBlend)
      targetLook.current.lerp(zoomLook.current, zoomBlend)
      targetFov = THREE.MathUtils.lerp(targetFov, CAMERA_KEYFRAMES.projectsZoom.fov, zoomBlend)
    }

    camera.position.lerp(targetPos.current, 0.06)
    lookRef.current.lerp(targetLook.current, 0.06)
    camera.lookAt(lookRef.current)

    fovRef.current += (targetFov - fovRef.current) * 0.06
    if (Math.abs(camera.fov - fovRef.current) > 0.01) {
      camera.fov = fovRef.current
      camera.updateProjectionMatrix()
    }
  })

  return null
}
