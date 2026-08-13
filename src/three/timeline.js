// Central scroll-progress thresholds shared across the Hero/About 3D scene.
// `heroAboutProgress` runs 0 -> 1 across the Hero+About wrapper.
export const TIMELINE = {
  heroFadeEnd: 0.32,      // hero copy fully faded by here
  formStart: 0.30,        // ascii dust starts accumulating into the PCB shape
  formEnd: 0.75,          // ascii dust fully assembled into the PCB outline
  solidStart: 0.82,       // solid realistic PCB starts crossfading in
  solidEnd: 1.0,          // solid PCB fully opaque, dust nearly gone
  labelsStart: 0.78,      // chip stat/skill callouts start fading in
  labelsEnd: 0.98,
  aboutRevealStart: 0.55, // bio glass panel starts fading in
  aboutRevealEnd: 0.85,
}

export function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / Math.max(0.0001, edge1 - edge0)))
  return t * t * (3 - 2 * t)
}
