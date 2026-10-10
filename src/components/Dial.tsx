import { useEffect, useRef, useState } from 'react';

// Rotating "clock" dial, after the Wove menu by Hello Monday:
// a large circle whose right edge sits inside the container; items are
// placed around its rim and the whole dial rotates so the active item
// lands at 3 o'clock. Tick marks turn with it like a clock face.

export interface DialItem {
  num: string;
  title: string;
  sub?: string;
}

interface Props {
  items: DialItem[];
  active: number; // target index
  onSelect: (i: number) => void; // clicked an item
  theme: 'light' | 'dark';
  edge?: number; // x (0..1 of width) where the rim touches 3 o'clock
  stepDeg?: number; // angle between items
  startOffset?: number; // initial spin-in offset (items)
  clip?: boolean; // clip to the container (menu) or let labels overflow (in-page)
}

export default function Dial({ items, active, onSelect, theme, edge = 0.34, stepDeg = 24, startOffset = 0, clip = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [a, setA] = useState(active - startOffset);
  const aRef = useRef(active - startOffset);
  const target = useRef(active);
  target.current = active;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const d = target.current - aRef.current;
      if (Math.abs(d) > 0.0005) {
        aRef.current += d * 0.09;
        setA(aRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ink = theme === 'light' ? '17,17,17' : '245,245,240';
  const { w, h } = size;
  const R = Math.max(220, h * 0.78);
  const cx = w * edge - R;
  const cy = h / 2;
  const step = (stepDeg * Math.PI) / 180;
  const narrow = w < 560;

  return (
    <div ref={ref} className={`absolute inset-0 select-none ${clip ? 'overflow-hidden' : ''}`}>
      {w > 0 && (
        <>
          <svg className="absolute inset-0" width={w} height={h} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={`rgba(${ink},0.16)`} strokeWidth={1} />
            {/* clock ticks — rotate with the dial */}
            <g transform={`rotate(${-a * stepDeg} ${cx} ${cy})`}>
              {Array.from({ length: 120 }, (_, k) => {
                const t = (k / 120) * Math.PI * 2;
                const major = k % 5 === 0;
                const r1 = R - (major ? 10 : 5);
                return (
                  <line
                    key={k}
                    x1={cx + Math.cos(t) * r1}
                    y1={cy + Math.sin(t) * r1}
                    x2={cx + Math.cos(t) * R}
                    y2={cy + Math.sin(t) * R}
                    stroke={`rgba(${ink},${major ? 0.35 : 0.14})`}
                    strokeWidth={major ? 1 : 0.6}
                  />
                );
              })}
            </g>
            {/* fixed 3 o'clock marker */}
            <line x1={cx + R - 16} y1={cy} x2={cx + R + 6} y2={cy} stroke={`rgba(${ink},0.9)`} strokeWidth={1.2} />
          </svg>

          {items.map((it, i) => {
            const rel = i - a;
            const th = rel * step;
            if (Math.abs(th) > Math.PI * 0.55) return null;
            const dist = Math.min(1, Math.abs(rel));
            const far = Math.abs(rel);
            const op = Math.max(0, 1 - far * 0.32);
            const px = cx + Math.cos(th) * R;
            const py = cy + Math.sin(th) * R;
            const isActive = Math.round(a) === i && Math.abs(rel) < 0.5;
            return (
              <button
                key={it.num}
                type="button"
                onClick={() => onSelect(i)}
                className="absolute text-left"
                style={{
                  left: px,
                  top: py,
                  transform: `rotate(${(th * 180) / Math.PI}deg)`,
                  transformOrigin: '0 50%',
                  translate: '0 -50%',
                  opacity: op,
                  display: 'flex',
                  alignItems: 'center',
                  gap: narrow ? 10 : 16,
                  background: 'none',
                  border: 0,
                  padding: 0,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: `rgba(${ink},${0.35 + 0.65 * (1 - dist)})`, flex: 'none', marginLeft: -3 }} />
                <span
                  className="font-mono"
                  style={{
                    fontWeight: 700,
                    fontSize: (narrow ? 22 : 34) - dist * (narrow ? 6 : 10),
                    color: `rgba(${ink},${0.4 + 0.6 * (1 - dist)})`,
                    marginLeft: narrow ? 8 : 14,
                    letterSpacing: '0.02em',
                  }}
                >
                  {it.num}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    className="uppercase"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      fontSize: (narrow ? 22 : 40) - dist * (narrow ? 6 : 12),
                      lineHeight: 1,
                      color: `rgba(${ink},${0.3 + 0.7 * (1 - dist)})`,
                    }}
                  >
                    {it.title}
                  </span>
                  {it.sub && (
                    <span
                      style={{
                        fontSize: narrow ? 11 : 13,
                        lineHeight: 1.45,
                        color: `rgba(${ink},0.55)`,
                        opacity: isActive ? 1 : 0,
                        transition: 'opacity 0.35s ease',
                        whiteSpace: 'normal',
                        maxWidth: narrow ? 200 : 340,
                      }}
                    >
                      {it.sub}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
