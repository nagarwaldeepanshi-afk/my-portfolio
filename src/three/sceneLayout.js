import * as THREE from 'three'
import { PCB_X_OFFSET, CONNECTOR_LOCAL } from './pcbLayout.js'

// World-space anchor where the USB cable visually plugs into the PCB
// (matches PCBModel's <ConnectorNub />).
export const CONNECTOR_WORLD = [
  PCB_X_OFFSET + CONNECTOR_LOCAL[0] + 0.12,
  CONNECTOR_LOCAL[1],
  CONNECTOR_LOCAL[2] + 0.03,
]

export const DISPLAY_POS = [9.2, -0.05, 0.7]
export const DISPLAY_SIZE = { w: 3.0, h: 1.9, depth: 0.14 }
export const SCREEN_INSET = { w: 2.66, h: 1.58 }
export const STAND_BASE_WORLD = [9.2, -2.2, 0.42]

// Timeline for the Projects-section sub-scene (its own 0 -> 1 scroll progress).
export const PROJECTS_TIMELINE = {
  wideStart: 0.0,
  wideEnd: 0.15,
  cableStart: 0.08,
  cableEnd: 0.48,
  powerStart: 0.46,
  powerEnd: 0.6,
  zoomStart: 0.52,
  zoomEnd: 0.82,
  contentStart: 0.58,
  contentEnd: 0.8,
}

export function buildCableCurve() {
  const p0 = new THREE.Vector3(...CONNECTOR_WORLD)
  const p1 = new THREE.Vector3(6.8, -2.75, 0.5)
  const p2 = new THREE.Vector3(8.1, -2.6, 0.55)
  const p3 = new THREE.Vector3(...STAND_BASE_WORLD)
  return new THREE.CatmullRomCurve3([p0, p1, p2, p3], false, 'catmullrom', 0.2)
}

// Screen surface world-Z (matches Display.jsx's screen plane) — used as the
// zoomed camera's look-at target so the push-in lands exactly on the screen.
const SCREEN_Z = DISPLAY_POS[2] + DISPLAY_SIZE.depth / 2 + 0.02

// Camera keyframes for the full Hero -> About -> Projects journey.
// "projectsWide" is the establishing shot (cable draws in, display powers
// on); "projectsZoom" is a tight push-in on the screen itself, timed to
// arrive as the project cards reveal — a proper "zoom in and reveal".
export const CAMERA_KEYFRAMES = {
  hero: { pos: [0, 0, 7], look: [0, 0, 0], fov: 50 },
  about: { pos: [0.6, 0, 7], look: [PCB_X_OFFSET, 0, 0], fov: 50 },
  projectsWide: {
    pos: [6.4, 0.15, 7.6],
    look: [DISPLAY_POS[0], DISPLAY_POS[1], 0],
    fov: 50,
  },
  projectsZoom: {
    pos: [DISPLAY_POS[0] - 0.55, DISPLAY_POS[1] + 0.05, SCREEN_Z + 2.3],
    look: [DISPLAY_POS[0], DISPLAY_POS[1], SCREEN_Z],
    fov: 36,
  },
}
