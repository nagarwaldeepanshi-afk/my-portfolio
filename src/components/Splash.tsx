import { useEffect, useRef, useState } from 'react';
import { wavyEdgePath, easeInOutCubic } from './liquid';

// Splash after hellomonday.com: a black screen is washed away by a
// liquid, wavy edge sweeping left → right (grey turning to white),
// it holds on white for a beat with a small mark in the corner,
// then the white fades to reveal the site.

interface Props {
  onReveal: () => void;
  onDone: () => void;
}

export default function Splash({ onReveal, onDone }: Props) {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [p, setP] = useState(0); // wipe progress 0..1
  const [t, setT] = useState(0); // time for the wobble
  const [fade, setFade] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const DELAY = 450;
    const WIPE = 1250;
    const start = performance.now();
    const loop = (now: number) => {
      const el = now - start;
      setT(el / 1000);
      setP(Math.max(0, Math.min(1, (el - DELAY) / WIPE)));
      if (el < DELAY + WIPE + 50) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    const t1 = setTimeout(() => setShowMark(true), DELAY + WIPE - 150);
    const t2 = setTimeout(() => { setFade(true); onReveal(); }, DELAY + WIPE + 650);
    const t3 = setTimeout(onDone, DELAY + WIPE + 650 + 700);
    return () => { cancelAnimationFrame(raf.current); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onReveal, onDone]);

  const { w: W, h: H } = size;
  const e = easeInOutCubic(p);
  // wave amplitude swells mid-sweep and dies down at the end
  const amp = Math.sin(Math.PI * Math.min(1, p * 1.05)) * W * 0.09;
  const base = -W * 0.2 + e * (W * 1.4);
  const edge = (y: number) =>
    base +
    amp * Math.sin((y / H) * Math.PI * 1.6 + t * 2.2) +
    amp * 0.45 * Math.sin((y / H) * Math.PI * 3.1 - t * 3.1);
  // grey → white as it sweeps
  const g = Math.round(150 + 105 * Math.min(1, p * 1.6));
  const fill = `rgb(${g},${g},${g - 2})`;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 99999, background: '#000', opacity: fade ? 0 : 1, transition: 'opacity 0.7s ease', pointerEvents: fade ? 'none' : 'all' }}
    >
      <svg width={W} height={H} className="absolute inset-0" style={{ display: 'block' }}>
        {p > 0 && <path d={wavyEdgePath(W, H, edge, 'left')} fill={fill} />}
      </svg>
      {/* small mark in the corner while it holds on white */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        className="absolute"
        style={{ top: 18, right: 'clamp(16px, 4vw, 56px)', opacity: showMark ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        <circle cx="11" cy="11" r="9.5" stroke="#050505" strokeWidth="0.8" />
        <circle cx="11" cy="11" r="5" stroke="#050505" strokeWidth="0.6" />
        <circle cx="11" cy="11" r="1.8" fill="#050505" />
      </svg>
    </div>
  );
}
