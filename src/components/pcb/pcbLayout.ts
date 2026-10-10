// Pure geometry for the isometric "PCB" illustration that the binary
// digits assemble into. No rendering here — just points to animate to.
//
// The board is modeled as a grid of iso tiles (like isometric-game
// tile math): each cell has a (col, row) position and an elevation
// (how many "board thicknesses" it sits above the ground plane). The
// board itself is elevation 1 (a thin slab); each skill "chip" sits
// on top of the board at a taller elevation, so it reads as a raised
// component once assembled.

export const TILE_W = 30; // half-width of one iso tile, in px
export const TILE_H = 15; // half-height of one iso tile, in px

export interface Point {
  x: number;
  y: number;
}

export interface PCBPoint extends Point {
  char: '0' | '1';
  group: string; // which chip/board-face this point belongs to
}

export interface SkillChip {
  name: string;
  meta: string;
  cols: [number, number];
  rows: [number, number];
  elevation: number;
  // Pre-computed centroid (screen space) filled in by buildPCB(),
  // used to anchor the floating skill label once assembled.
  centroid?: Point;
}

const BOARD_COLS = 10;
const BOARD_ROWS = 6;
const BOARD_THICKNESS = 1;

// The five skill "chips" placed on the board. Edit names/meta freely —
// geometry adapts automatically since positions are grid-based, not
// pixel-based.
export const SKILL_CHIPS: SkillChip[] = [
  { name: 'INTERFACE', meta: 'FIGMA · DESIGN SYSTEMS', cols: [0.5, 3], rows: [0.5, 2.2], elevation: BOARD_THICKNESS + 0.6 },
  { name: 'FRONTEND', meta: 'HTML · CSS · JS · REACT', cols: [7, 9.5], rows: [0.5, 2.2], elevation: BOARD_THICKNESS + 0.6 },
  { name: 'IMMERSIVE', meta: 'UNITY · AR · BLENDER', cols: [0.5, 3], rows: [3.8, 5.5], elevation: BOARD_THICKNESS + 0.6 },
  { name: 'PHYSICAL', meta: 'ARDUINO · RFID · SENSORS', cols: [7, 9.5], rows: [3.8, 5.5], elevation: BOARD_THICKNESS + 0.6 },
  { name: 'RESEARCH', meta: 'INTERVIEWS · USABILITY', cols: [4, 6], rows: [2.2, 3.8], elevation: BOARD_THICKNESS + 1.1 },
];

function isoPoint(col: number, row: number, elevation = 0): Point {
  return {
    x: (col - row) * TILE_W,
    y: (col + row) * TILE_H - elevation * TILE_H * 2,
  };
}

// Walks the perimeter of a polygon and drops a point every `step` px
// along each edge — this is what gives us the "outline traced in
// binary digits" look rather than a filled block.
function edgePoints(corners: Point[], step: number, group: string): PCBPoint[] {
  const pts: PCBPoint[] = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const segments = Math.max(1, Math.round(len / step));
    for (let s = 0; s < segments; s++) {
      pts.push({
        x: a.x + (dx * s) / segments,
        y: a.y + (dy * s) / segments,
        char: Math.random() > 0.5 ? '1' : '0',
        group,
      });
    }
  }
  return pts;
}

function quad(c1: Point, c2: Point, c3: Point, c4: Point): Point[] {
  return [c1, c2, c3, c4];
}

interface BuildResult {
  points: PCBPoint[];
  chips: SkillChip[];
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
}

export function buildPCB(): BuildResult {
  const points: PCBPoint[] = [];

  // --- Board top face + two visible side faces (classic iso box) ---
  const topCorners = quad(
    isoPoint(0, 0, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, 0, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, BOARD_ROWS, BOARD_THICKNESS),
    isoPoint(0, BOARD_ROWS, BOARD_THICKNESS),
  );
  points.push(...edgePoints(topCorners, 9, 'board-top'));

  const frontLeftFace = quad(
    isoPoint(0, BOARD_ROWS, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, BOARD_ROWS, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, BOARD_ROWS, 0),
    isoPoint(0, BOARD_ROWS, 0),
  );
  points.push(...edgePoints(frontLeftFace, 9, 'board-side'));

  const frontRightFace = quad(
    isoPoint(BOARD_COLS, 0, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, BOARD_ROWS, BOARD_THICKNESS),
    isoPoint(BOARD_COLS, BOARD_ROWS, 0),
    isoPoint(BOARD_COLS, 0, 0),
  );
  points.push(...edgePoints(frontRightFace, 9, 'board-side'));

  // --- Each skill chip: top face + two side faces, raised above the board ---
  const chips = SKILL_CHIPS.map((chip) => {
    const [c0, c1] = chip.cols;
    const [r0, r1] = chip.rows;

    const chipTop = quad(
      isoPoint(c0, r0, chip.elevation),
      isoPoint(c1, r0, chip.elevation),
      isoPoint(c1, r1, chip.elevation),
      isoPoint(c0, r1, chip.elevation),
    );
    points.push(...edgePoints(chipTop, 7, chip.name));

    const chipFrontLeft = quad(
      isoPoint(c0, r1, chip.elevation),
      isoPoint(c1, r1, chip.elevation),
      isoPoint(c1, r1, BOARD_THICKNESS),
      isoPoint(c0, r1, BOARD_THICKNESS),
    );
    points.push(...edgePoints(chipFrontLeft, 7, chip.name));

    const chipFrontRight = quad(
      isoPoint(c1, r0, chip.elevation),
      isoPoint(c1, r1, chip.elevation),
      isoPoint(c1, r1, BOARD_THICKNESS),
      isoPoint(c1, r0, BOARD_THICKNESS),
    );
    points.push(...edgePoints(chipFrontRight, 7, chip.name));

    const centroid = isoPoint((c0 + c1) / 2, (r0 + r1) / 2, chip.elevation);
    return { ...chip, centroid };
  });

  // A handful of small "pin" tick marks along the front edge, for
  // detail — purely decorative, tagged onto the board-side group.
  for (let i = 1; i < BOARD_COLS; i++) {
    const base = isoPoint(i, BOARD_ROWS, BOARD_THICKNESS);
    points.push({ x: base.x, y: base.y + 3, char: Math.random() > 0.5 ? '1' : '0', group: 'board-side' });
  }

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    points,
    chips,
    bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
  };
}
