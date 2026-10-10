import { useEffect, useRef, useState } from 'react';

// Work grid after the "related work" grid on hellomonday.com:
// white section, small label, three portrait covers with serif titles.
// Hover: the cover zooms slightly, a dot appears before the title, and
// the cover's edges behave like jelly. They lean toward the cursor, and
// when the cursor leaves, the edge stretches after it and snaps back
// with a wobble.

const BASE = import.meta.env.BASE_URL;

const PROJECTS = [
  { title: 'Jio Care, from conversation to resolution', cat: 'Service Design', img: `${BASE}work/covers/jio-care-portrait.jpg`, href: `${BASE}work/jio-care.html` },
  { title: 'Arthshila, wandering up a public library', cat: 'UX Research · Spatial UX', img: `${BASE}work/covers/arthshila-portrait.jpg`, href: `${BASE}work/arthshila.html` },
  { title: 'Bajaj Avenger 220, a dashboard for the road', cat: 'Two-Wheeler HMI', img: `${BASE}work/covers/avenger-220-portrait.jpg`, href: `${BASE}work/avenger-220.html` },
];

type Edge = { d: number; v: number; t: number; tv: number }; // displacement, velocity, position along edge (0..1)

const STRETCH = 140; // how far (px) an edge will follow the cursor out
const FOLLOW = 0.55; // share of the cursor's distance the edge follows
const MAX_D = 34; // max bulge (px)
const BLEED = 80; // soft image area beyond the card that a bulge can reveal

function JellyCard({ p }: { p: typeof PROJECTS[0] }) {
  const box = useRef<HTMLDivElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const mouse = useRef({ x: -9999, y: -9999 });
  const wasInside = useRef(false);
  const edges = useRef<Record<'top' | 'right' | 'bottom' | 'left', Edge>>({
    top: { d: 0, v: 0, t: 0.5, tv: 0 },
    right: { d: 0, v: 0, t: 0.5, tv: 0 },
    bottom: { d: 0, v: 0, t: 0.5, tv: 0 },
    left: { d: 0, v: 0, t: 0.5, tv: 0 },
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove, { passive: true });
    let raf = 0;
    const tick = () => {
      const el = box.current, c = clip.current;
      if (el && c) {
        const r = el.getBoundingClientRect();
        const w = r.width, h = r.height;
        const mx = mouse.current.x - r.left, my = mouse.current.y - r.top;
        const inside = mx >= 0 && mx <= w && my >= 0 && my <= h;
        if (inside) wasInside.current = true;
        const tx = Math.min(1, Math.max(0, mx / w));
        const ty = Math.min(1, Math.max(0, my / h));

        // target displacement per edge
        const target = (out: number, along: number, inRange: boolean) => {
          if (inside) {
            // lean slightly toward a cursor that's close to this edge
            const near = Math.max(0, 1 - Math.abs(out) / 70);
            return { d: near * 10, t: along };
          }
          if (wasInside.current && inRange && out > 0 && out < STRETCH) return { d: Math.min(MAX_D, out * FOLLOW), t: along };
          return { d: 0, t: along };
        };
        const tgt = {
          right: target(mx - w, ty, my > -20 && my < h + 20),
          left: target(-mx, ty, my > -20 && my < h + 20),
          bottom: target(my - h, tx, mx > -20 && mx < w + 20),
          top: target(-my, tx, mx > -20 && mx < w + 20),
        };
        if (!inside && (mx < -STRETCH || mx > w + STRETCH || my < -STRETCH || my > h + STRETCH)) wasInside.current = false;

        let moving = false;
        (Object.keys(edges.current) as (keyof typeof edges.current)[]).forEach(k => {
          const e = edges.current[k];
          const g = tgt[k];
          e.v = (e.v + (g.d - e.d) * 0.14) * 0.8;
          e.d += e.v;
          e.tv = (e.tv + (g.t - e.t) * 0.2) * 0.7;
          e.t += e.tv;
          if (Math.abs(e.d) > 0.05 || Math.abs(e.v) > 0.05) moving = true;
        });

        {
          void moving;
          const E = edges.current;
          // each edge is a quadratic curve whose control point is pushed out
          const path =
            `M0,0 ` +
            `Q${E.top.t * w},${-E.top.d * 2} ${w},0 ` +
            `Q${w + E.right.d * 2},${E.right.t * h} ${w},${h} ` +
            `Q${E.bottom.t * w},${h + E.bottom.d * 2} 0,${h} ` +
            `Q${-E.left.d * 2},${E.left.t * h} 0,0 Z`;
          c.style.clipPath = `path('${path}')`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, []);

  return (
    <a
      href={p.href}
      target="_blank"
      rel="noopener"
      data-cursor="VIEW"
      className="block"
      style={{ textDecoration: 'none', color: '#000' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* cover: the outer box keeps layout; the inner clip can bulge past it */}
      <div ref={box} className="relative" style={{ aspectRatio: '3 / 4' }}>
        <div ref={clip} className="absolute inset-0" style={{ overflow: 'visible', clipPath: 'inset(0)' }}>
          {/* soft continuation of the cover, only seen when an edge stretches out */}
          <div className="absolute overflow-hidden" style={{ inset: -BLEED }}>
            <img
              src={p.img}
              alt=""
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) saturate(1.1)', transform: 'scale(1.08)' }}
            />
          </div>
          {/* the cover itself, at exactly the card size */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={p.img}
              alt={`${p.title} cover`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top center',
                transform: hover ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.9s cubic-bezier(0.22,1,0.36,1)',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* title + category */}
      <div style={{ marginTop: 22 }}>
        <h3
          className="relative"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(22px, 2.2vw, 32px)',
            lineHeight: 1.18,
            margin: 0,
            transform: hover ? 'translateX(14px)' : 'none',
            transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span
            className="absolute rounded-full"
            style={{ width: 6, height: 6, background: '#000', left: -16, top: '0.6em', opacity: hover ? 1 : 0, transform: `scale(${hover ? 1 : 0})`, transition: 'opacity 0.25s, transform 0.3s' }}
          />
          {p.title}
        </h3>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>{p.cat}</p>
      </div>
    </a>
  );
}

export default function WorkSection() {
  return (
    <section id="work" style={{ background: '#FFFFFF', position: 'relative' }}>
      <div style={{ padding: 'clamp(56px, 8vw, 110px) clamp(20px, 5vw, 72px) clamp(64px, 9vw, 120px)' }}>
        <h2 style={{ fontSize: 15, fontWeight: 400, margin: '0 0 clamp(28px, 4vw, 48px)', color: '#000' }}>
          Selected work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ columnGap: 'clamp(24px, 5.5vw, 96px)', rowGap: 56 }}>
          {PROJECTS.map(p => (
            <JellyCard key={p.href} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
