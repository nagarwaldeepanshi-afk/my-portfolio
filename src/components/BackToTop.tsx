import { useEffect, useRef, useState } from 'react';
import { easeInOutCubic } from './liquid';

// Back to top after hellomonday.com: at the very end of the page, keep
// scrolling (or pull up on touch) and an elastic bulge stretches up out
// of the bottom edge with "Back to top" inside. Pull far enough and it
// springs the page back to the top. Hovering the bottom edge shows a
// small bulge; clicking it does the same.

const MAX_H = 96; // px — full bulge height

export default function BackToTop() {
  const [pull, setPull] = useState(0); // 0..1 shown
  const target = useRef(0);
  const cur = useRef(0);
  const vel = useRef(0);
  const lastInput = useRef(0);
  const launching = useRef(false);
  const hovering = useRef(false);

  const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

  const launch = () => {
    if (launching.current) return;
    launching.current = true;
    target.current = 1.15;
    setTimeout(() => {
      const from = window.scrollY;
      const start = performance.now();
      const dur = Math.min(1600, 600 + from * 0.08);
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        window.scrollTo(0, from * (1 - easeInOutCubic(k)));
        if (k < 1) requestAnimationFrame(step);
        else { launching.current = false; target.current = 0; }
      };
      target.current = 0;
      requestAnimationFrame(step);
    }, 260);
  };

  useEffect(() => {
    // spring the bulge toward its target
    let raf = 0;
    const tick = (now: number) => {
      if (!launching.current && !hovering.current && now - lastInput.current > 220) target.current = 0;
      const k = 0.16, damp = 0.72;
      vel.current = (vel.current + (target.current - cur.current) * k) * damp;
      cur.current += vel.current;
      setPull(Math.max(0, cur.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      if (launching.current || e.deltaY <= 0 || !atBottom()) return;
      lastInput.current = performance.now();
      target.current = Math.min(1, target.current + e.deltaY / 500);
      if (target.current >= 1) launch();
    };
    let ty: number | null = null;
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (ty == null || launching.current || !atBottom()) return;
      const dy = ty - e.touches[0].clientY;
      if (dy > 0) {
        lastInput.current = performance.now();
        target.current = Math.min(1, dy / 220);
        if (target.current >= 1) launch();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const h = pull * MAX_H;
  const W = 600; // viewBox width; scaled to the bulge container
  const top = MAX_H * 1.25 - h;
  const d = `M0,${MAX_H * 1.25} C${W * 0.18},${MAX_H * 1.25} ${W * 0.3},${top} ${W * 0.5},${top} C${W * 0.7},${top} ${W * 0.82},${MAX_H * 1.25} ${W},${MAX_H * 1.25} Z`;
  const labelY = Math.max(0, 1 - Math.min(1, pull * 1.6));

  return (
    <div
      className="relative mx-auto"
      style={{ width: 'min(620px, 70%)', height: MAX_H * 1.25, marginTop: 8, cursor: 'pointer' }}
      onMouseEnter={() => { hovering.current = true; if (!launching.current) target.current = 0.42; }}
      onMouseLeave={() => { hovering.current = false; }}
      onClick={launch}
      role="button"
      aria-label="Back to top"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') launch(); }}
      data-cursor="TOP"
    >
      <svg viewBox={`0 0 ${W} ${MAX_H * 1.25}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        <path d={d} fill="#F5F5F0" />
      </svg>
      <span
        className="absolute left-1/2 font-mono"
        style={{
          bottom: Math.max(8, h * 0.42),
          transform: `translate(-50%, ${labelY * 28}px)`,
          opacity: Math.min(1, pull * 2.2),
          fontSize: 11,
          letterSpacing: '0.2em',
          color: '#050505',
          whiteSpace: 'nowrap',
        }}
      >
        ↑ BACK TO TOP
      </span>
      {/* hint line when idle */}
      <span className="absolute left-1/2 bottom-2 font-mono" style={{ transform: 'translateX(-50%)', fontSize: 8, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.35)', opacity: pull < 0.05 ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>
        KEEP SCROLLING TO GO BACK UP
      </span>
    </div>
  );
}
