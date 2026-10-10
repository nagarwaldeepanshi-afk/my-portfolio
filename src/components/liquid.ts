// Shared helper for the liquid edges used by the splash and the menu.
// Builds an SVG path for a region bounded by a wavy vertical edge.

export function wavyEdgePath(
  W: number,
  H: number,
  edgeX: (y: number) => number,
  side: 'left' | 'right',
  steps = 48,
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const y = (i / steps) * (H + 40) - 20;
    pts.push([edgeX(y), y]);
  }
  // smooth curve through the points (Catmull-Rom → cubic Bézier)
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const far = side === 'left' ? -60 : W + 60;
  d += ` L${far},${H + 20} L${far},-20 Z`;
  return d;
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
