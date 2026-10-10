import { useEffect, useRef, useState } from 'react';
import { cursorStore } from '../cursorStore';

interface CursorState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  phase: number;
  label: string;
  opacity: number;
}

export default function Cursor() {
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const phaseRef = useRef(0);
  const scaleRef = useRef(1);
  const scaleTargetRef = useRef(1);
  const labelRef = useRef('');
  const opacityRef = useRef(1);
  const rafRef = useRef(0);
  const [s, setS] = useState<CursorState>({
    x: -200, y: -200, vx: 0, vy: 0, scale: 1, phase: 0, label: '', opacity: 1,
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const link = el.closest('a, button, [data-cursor]') as HTMLElement | null;
      if (link) {
        scaleTargetRef.current = 2.6;
        labelRef.current = link.dataset.cursor ?? '';
      } else {
        scaleTargetRef.current = 1;
        labelRef.current = '';
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);

    const tick = () => {
      const p = posRef.current;
      const t = targetRef.current;
      const nx = p.x + (t.x - p.x) * 0.13;
      const ny = p.y + (t.y - p.y) * 0.13;
      const vx = (nx - p.x) * 0.85 + velRef.current.vx * 0.15;
      const vy = (ny - p.y) * 0.85 + velRef.current.vy * 0.15;
      velRef.current = { vx, vy };
      posRef.current = { x: nx, y: ny };
      phaseRef.current += 0.022;
      scaleRef.current += (scaleTargetRef.current - scaleRef.current) * 0.1;
      // When PCBReveal is bursting the blob into binary digits, fade
      // this cursor out; otherwise ease back to fully visible.
      const opacityTarget = cursorStore.burstActive ? 0 : 1;
      opacityRef.current += (opacityTarget - opacityRef.current) * 0.14;
      setS({ x: nx, y: ny, vx, vy, scale: scaleRef.current, phase: phaseRef.current, label: labelRef.current, opacity: opacityRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, []);

  const { x, y, vx, vy, scale, phase, label, opacity } = s;
  const baseR = 14 * scale;
  const speed = Math.sqrt(vx * vx + vy * vy);
  const stretch = Math.min(3, 1 + speed * 0.55);
  const angle = speed > 0.15 ? Math.atan2(vy, vx) : 0;
  const N = 14;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const pts = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const noise =
      Math.sin(a * 2 + phase) * 0.18 +
      Math.sin(a * 3 - phase * 1.2) * 0.1 +
      Math.sin(a * 5 + phase * 0.65) * 0.06;
    const r = baseR * (1 + noise);
    const dot = Math.cos(a) * cos + Math.sin(a) * sin;
    const sf = 1 + (stretch - 1) * Math.max(0, dot);
    return { x: r * sf * Math.cos(a), y: r * sf * Math.sin(a) };
  });

  let d = '';
  for (let i = 0; i < N; i++) {
    const c = pts[i];
    const n = pts[(i + 1) % N];
    const mx = (c.x + n.x) / 2;
    const my = (c.y + n.y) / 2;
    if (i === 0) d += `M${mx.toFixed(1)},${my.toFixed(1)}`;
    else d += `Q${c.x.toFixed(1)},${c.y.toFixed(1)},${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const lp = pts[N - 1];
  const fp = pts[0];
  d += `Q${lp.x.toFixed(1)},${lp.y.toFixed(1)},${((lp.x + fp.x) / 2).toFixed(1)},${((lp.y + fp.y) / 2).toFixed(1)}Z`;

  const pad = baseR * 3.5;
  const vb = `${-pad} ${-pad} ${pad * 2} ${pad * 2}`;
  const svgProps = { width: pad * 2, height: pad * 2, viewBox: vb, overflow: 'visible' as const, style: { display: 'block' as const } };

  // Oil spill gradient — rotates with phase
  const oilAngle = phase * 45;
  const oa = (oilAngle * Math.PI) / 180;
  const gx1 = -pad * Math.cos(oa);
  const gy1 = -pad * Math.sin(oa);
  const gx2 = pad * Math.cos(oa);
  const gy2 = pad * Math.sin(oa);

  // Binary grid — 14×14 oversized, edges hidden by clipPath
  // Binary grid — 20×20 well beyond blob boundary, clip hides edges
  const ROWS = 20, COLS = 20;
  const binaryGrid = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const idx = row * COLS + col;
      const t = Math.floor(phase * 1.5);
      const v = ((idx * 2654435761 + t * 1013904223) >>> 17) & 1;
      const cx = -baseR * 3.2 + col * (baseR * 6.4 / (COLS - 1));
      const cy = -baseR * 3.2 + row * (baseR * 6.4 / (ROWS - 1));
      return { bit: v, cx, cy, key: `${row}-${col}` };
    })
  ).flat();

  // publish to shared store for WorkSection mask
  cursorStore.x = x;
  cursorStore.y = y;
  cursorStore.path = d;
  cursorStore.baseR = baseR;

  const shared = {
    position: 'fixed' as const,
    left: x,
    top: y,
    transform: 'translate(-50%,-50%)',
    pointerEvents: 'none' as const,
    willChange: 'transform' as const,
    opacity,
  };

  return (
    <>
      {/* Oil spill border — sits beneath blob, screen blend for iridescence */}
      <div style={{ ...shared, zIndex: 99996, mixBlendMode: 'screen' }}>
        <svg {...svgProps}>
          <defs>
            <linearGradient id="oil-a" gradientUnits="userSpaceOnUse" x1={gx1} y1={gy1} x2={gx2} y2={gy2}>
              <stop offset="0%"   stopColor="#ff0090" />
              <stop offset="18%"  stopColor="#ff6000" />
              <stop offset="36%"  stopColor="#FFFFFF" />
              <stop offset="54%"  stopColor="#00ffaa" />
              <stop offset="72%"  stopColor="#0088ff" />
              <stop offset="88%"  stopColor="#aa00ff" />
              <stop offset="100%" stopColor="#ff0090" />
            </linearGradient>
            <linearGradient id="oil-b" gradientUnits="userSpaceOnUse" x1={gy1} y1={-gx1} x2={gy2} y2={-gx2}>
              <stop offset="0%"   stopColor="#00ffcc" />
              <stop offset="25%"  stopColor="#ff00aa" />
              <stop offset="50%"  stopColor="#ffaa00" />
              <stop offset="75%"  stopColor="#0055ff" />
              <stop offset="100%" stopColor="#00ffcc" />
            </linearGradient>
            <filter id="oil-blur">
              <feGaussianBlur stdDeviation="1.2" />
            </filter>
          </defs>
          {/* Fat blurred outer glow */}
          <path d={d} fill="none" stroke="url(#oil-a)" strokeWidth="6" filter="url(#oil-blur)" strokeOpacity="0.85" />
          {/* Crisp inner shimmer */}
          <path d={d} fill="none" stroke="url(#oil-b)" strokeWidth="2" strokeOpacity="0.9" />
        </svg>
      </div>

      {/* Main blob — difference blend */}
      <div style={{ ...shared, zIndex: 99998, mixBlendMode: 'difference' }}>
        <svg {...svgProps}>
          <path d={d} fill="#FFFFFF" />
          {label && (
            <text x="0" y={baseR + 14} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="'Space Grotesk', sans-serif" letterSpacing="0.15em">
              {label}
            </text>
          )}
        </svg>
      </div>

      {/* Binary pattern — clipped to blob, visible as yellow-on-black on hero */}
      <div style={{ ...shared, zIndex: 99999 }}>
        <svg {...svgProps}>
          <defs>
            <clipPath id="blob-clip">
              <path d={d} />
            </clipPath>
          </defs>
          <g clipPath="url(#blob-clip)">
            {binaryGrid.map(({ bit, cx, cy, key }) => (
              <text
                key={key}
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fillOpacity={0.55 + (bit ? 0.3 : 0)}
                fontSize={baseR * 0.27}
                fontFamily="'Space Grotesk', sans-serif"
              >
                {bit}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </>
  );
}
