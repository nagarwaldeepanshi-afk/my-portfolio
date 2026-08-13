// Procedurally lays out a point-cloud that reads as a circuit board:
// an outline, orthogonal traces, chip footprints, mounting holes and vias.
// No external model needed — everything is generated from simple shapes.

// Shared layout constants used by the ascii field, the solid PCB model,
// the chip labels, and the USB cable/display scene — kept in one place so
// everything lines up in the same 3D coordinate space.
export const PCB_X_OFFSET = 1.3
export const BOARD_W = 9.2
export const BOARD_H = 5.6
export const BOARD_DEPTH = 0.12
// Edge connector nub (where the USB cable visually plugs into the board),
// in *unoffset* board-local space — consumers should add PCB_X_OFFSET.
export const CONNECTOR_LOCAL = [BOARD_W / 2 - 0.05, -BOARD_H / 2 + 0.55, BOARD_DEPTH / 2]

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function rectPerimeter(cx, cy, w, h, n, rand, jitter = 0.01) {
  const pts = []
  const perim = 2 * (w + h)
  for (let i = 0; i < n; i++) {
    let d = (i / n) * perim
    let x, y
    if (d < w) {
      x = cx - w / 2 + d
      y = cy - h / 2
    } else if (d < w + h) {
      x = cx + w / 2
      y = cy - h / 2 + (d - w)
    } else if (d < 2 * w + h) {
      x = cx + w / 2 - (d - w - h)
      y = cy + h / 2
    } else {
      x = cx - w / 2
      y = cy + h / 2 - (d - 2 * w - h)
    }
    pts.push([x + (rand() - 0.5) * jitter, y + (rand() - 0.5) * jitter, (rand() - 0.5) * 0.03])
  }
  return pts
}

function rectFill(cx, cy, w, h, n, rand, zLift = 0.08) {
  const pts = []
  for (let i = 0; i < n; i++) {
    pts.push([
      cx + (rand() - 0.5) * w,
      cy + (rand() - 0.5) * h,
      zLift + (rand() - 0.5) * 0.04,
    ])
  }
  return pts
}

function circle(cx, cy, r, n, rand) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, (rand() - 0.5) * 0.02])
  }
  return pts
}

function tracePath(points, n, rand) {
  // points: array of [x,y] waypoints forming an orthogonal path
  const segLengths = []
  let total = 0
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    segLengths.push(len)
    total += len
  }
  const pts = []
  for (let i = 0; i < n; i++) {
    let d = (i / n) * total
    let segIdx = 0
    while (segIdx < segLengths.length - 1 && d > segLengths[segIdx]) {
      d -= segLengths[segIdx]
      segIdx++
    }
    const [x1, y1] = points[segIdx]
    const [x2, y2] = points[segIdx + 1]
    const t = segLengths[segIdx] > 0 ? d / segLengths[segIdx] : 0
    pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, (rand() - 0.5) * 0.015])
  }
  return pts
}

export const CHIPS = [
  { cx: -2.9, cy: 1.3, w: 1.5, h: 1.0 },
  { cx: -0.2, cy: -1.4, w: 2.0, h: 1.1 },
  { cx: 2.6, cy: 1.1, w: 1.3, h: 1.3 },
  { cx: 1.7, cy: -1.5, w: 1.1, h: 0.8 },
  { cx: -2.6, cy: -1.2, w: 1.1, h: 0.9 },
]

const TRACES = [
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

export function generatePCBLayout(count, seed = 1337) {
  const rand = mulberry32(seed)
  const boardW = BOARD_W
  const boardH = BOARD_H

  const budget = {
    outline: Math.floor(count * 0.12),
    holes: Math.floor(count * 0.03),
    traces: Math.floor(count * 0.36),
    chips: Math.floor(count * 0.32),
    pads: 0,
  }
  budget.pads = count - budget.outline - budget.holes - budget.traces - budget.chips

  let pts = []

  pts.push(...rectPerimeter(0, 0, boardW, boardH, budget.outline, rand))

  const holeCorners = [
    [-boardW / 2 + 0.35, -boardH / 2 + 0.35],
    [boardW / 2 - 0.35, -boardH / 2 + 0.35],
    [-boardW / 2 + 0.35, boardH / 2 - 0.35],
    [boardW / 2 - 0.35, boardH / 2 - 0.35],
  ]
  const perHole = Math.floor(budget.holes / holeCorners.length)
  holeCorners.forEach(([cx, cy]) => {
    pts.push(...circle(cx, cy, 0.16, perHole, rand))
  })

  const perTrace = Math.max(4, Math.floor(budget.traces / TRACES.length))
  TRACES.forEach((path) => {
    pts.push(...tracePath(path, perTrace, rand))
  })

  const totalChipArea = CHIPS.reduce((s, c) => s + c.w * c.h, 0)
  CHIPS.forEach((chip) => {
    const share = Math.floor((chip.w * chip.h) / totalChipArea * budget.chips)
    const borderShare = Math.floor(share * 0.35)
    const fillShare = share - borderShare
    pts.push(...rectPerimeter(chip.cx, chip.cy, chip.w, chip.h, borderShare, rand, 0.015))
    pts.push(...rectFill(chip.cx, chip.cy, chip.w * 0.82, chip.h * 0.82, fillShare, rand, 0.09))
  })

  // Pads: small clusters scattered near trace bends / chip pins
  const padCenters = []
  TRACES.forEach((path) => padCenters.push(path[0], path[path.length - 1]))
  CHIPS.forEach((c) => {
    for (let i = -1; i <= 1; i += 2) {
      padCenters.push([c.cx + (c.w / 2) * i, c.cy - c.h / 2 - 0.08])
      padCenters.push([c.cx + (c.w / 2) * i, c.cy + c.h / 2 + 0.08])
    }
  })
  let padIdx = 0
  while (pts.length < count) {
    const [cx, cy] = padCenters[padIdx % padCenters.length]
    pts.push([cx + (rand() - 0.5) * 0.08, cy + (rand() - 0.5) * 0.08, 0.05 + (rand() - 0.5) * 0.02])
    padIdx++
  }

  // Trim / pad to exact count
  if (pts.length > count) pts = pts.slice(0, count)
  while (pts.length < count) pts.push([0, 0, 0])

  // shuffle deterministically so index order doesn't bias the accumulate animation
  // (outline points aren't all indices 0..n, chips aren't all last, etc.)
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pts[i], pts[j]] = [pts[j], pts[i]]
  }

  return pts
}
