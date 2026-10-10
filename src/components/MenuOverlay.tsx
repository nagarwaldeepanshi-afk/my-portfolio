import { useEffect, useRef, useState } from 'react';
import { wavyEdgePath, easeInOutCubic } from './liquid';

// Menu after hellomonday.com: a black liquid blob pours out of the menu
// button (top-right) and floods the screen with a wavy edge, then large
// serif links slide in from the right. Hover shows a dot and nudges the
// link. Closing pulls the liquid back to the right.

const ITEMS = [
  { label: 'Work', id: 'work' },
  { label: 'About', id: 'about' },
  { label: 'Experiments', id: 'experiments' },
  { label: 'Process', id: 'process' },
  { label: 'Contact', id: 'contact' },
];

interface Props {
  open: boolean;
  origin: { x: number; y: number };
  onClose: () => void;
}

const DUR = 900;

export default function MenuOverlay({ open, origin, onClose }: Props) {
  const [mounted, setMounted] = useState(open);
  const [p, setP] = useState(0);
  const [time, setTime] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const pRef = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) setMounted(true);
    if (!open && !mounted) return;
    document.body.style.overflow = open ? 'hidden' : '';
    const from = pRef.current;
    const to = open ? 1 : 0;
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const loop = (now: number) => {
      const k = Math.min(1, (now - start) / DUR);
      pRef.current = from + (to - from) * k;
      setP(pRef.current);
      setTime(now / 1000);
      if (k < 1) raf.current = requestAnimationFrame(loop);
      else if (!open) setMounted(false);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const { w: W, h: H } = size;
  const e = easeInOutCubic(p);
  const amp = Math.sin(Math.PI * p) * W * 0.1;
  const base = W + 80 - e * (W * 1.45);
  const edge = (y: number) => {
    // the liquid leads at the height of the menu button and trails above/below it
    const oy = origin.y || H / 2;
    const lead = Math.max(0, 1 - Math.abs(y - oy) / H) * Math.sin(Math.PI * p) * W * 0.22;
    return base - lead + amp * Math.sin((y / H) * Math.PI * 1.7 + time * 2) + amp * 0.4 * Math.sin((y / H) * Math.PI * 3.3 - time * 2.6);
  };
  const textIn = open ? Math.max(0, (p - 0.45) / 0.55) : Math.max(0, (p - 0.6) / 0.4);

  const go = (id: string) => {
    const el = document.getElementById(id);
    onClose();
    setTimeout(() => {
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    }, 350);
  };

  return (
    <div className="fixed inset-0" role="dialog" aria-modal="true" aria-label="Site menu" style={{ zIndex: 600, pointerEvents: open ? 'all' : 'none' }}>
      <svg width={W} height={H} className="absolute inset-0" style={{ display: 'block' }}>
        <path d={wavyEdgePath(W, H, edge, 'right')} fill="#000" />
      </svg>

      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between" style={{ height: 52, padding: '0 clamp(16px, 4vw, 56px)', opacity: textIn }}>
        <span className="font-mono font-semibold" style={{ fontSize: 12, letterSpacing: '0.14em', color: '#fff' }}>DEEPANSHI NAGARWAL</span>
        <button type="button" onClick={onClose} aria-label="Close menu" style={{ width: 40, height: 40, position: 'relative', background: 'none', border: 0, cursor: 'pointer' }}>
          <span style={{ position: 'absolute', left: 13, right: 13, top: '50%', height: 1.5, background: '#fff', transform: 'rotate(45deg)' }} />
          <span style={{ position: 'absolute', left: 13, right: 13, top: '50%', height: 1.5, background: '#fff', transform: 'rotate(-45deg)' }} />
        </button>
      </div>

      {/* links */}
      <nav className="absolute flex flex-col" style={{ left: W < 700 ? '12vw' : '55%', top: 'clamp(70px, 12vh, 120px)', gap: 'clamp(4px, 1.2vh, 14px)' }}>
        {ITEMS.map((it, i) => {
          const k = Math.max(0, Math.min(1, textIn * 1.6 - i * 0.12));
          const ek = 1 - Math.pow(1 - k, 3);
          const isH = hover === i;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => go(it.id)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="relative text-left"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 400,
                fontSize: 'clamp(40px, 6.4vw, 84px)',
                lineHeight: 1.12,
                color: '#fff',
                background: 'none',
                border: 0,
                cursor: 'pointer',
                opacity: ek,
                transform: `translateX(${(1 - ek) * 90 + (isH ? 14 : 0)}px)`,
                transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <span
                className="absolute rounded-full"
                style={{ width: 7, height: 7, background: '#fff', left: -20, top: '54%', opacity: isH ? 1 : 0, transform: `scale(${isH ? 1 : 0})`, transition: 'opacity 0.25s, transform 0.3s' }}
              />
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* socials */}
      <div className="absolute flex gap-8" style={{ left: W < 700 ? '12vw' : '55%', bottom: 'clamp(24px, 5vh, 48px)', opacity: textIn }}>
        <a href="mailto:deepanshi.nagarwal@gmail.com" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Email</a>
        <a href="https://www.linkedin.com/in/deepanshi-nagarwal-102645202/" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>LinkedIn</a>
        <a href="https://www.behance.net/deepansnagarwa" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Behance</a>
      </div>
    </div>
  );
}
