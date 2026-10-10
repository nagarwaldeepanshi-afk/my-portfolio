import { useEffect, useRef, type RefObject } from 'react';

// Menu button fixed at the middle of the right edge (as on hellomonday.com).
// As the cursor comes near, a wobbly blob swells up behind the icon and
// leans toward the cursor; the icon is pulled slightly toward it too.
// Blob and icon are separate layers, each with a difference blend, so the
// icon reads on top of the blob over both black and white sections.

const R_MAX = 34; // blob radius at full proximity (px)
const RANGE = 170; // distance (px) at which the blob starts to appear

interface Props {
  btnRef: RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
}

export default function MenuButton({ btnRef, onOpen }: Props) {
  const blobRef = useRef<SVGPathElement>(null);
  const blobWrap = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf = 0;
    let prox = 0, pv = 0, ox = 0, oy = 0;
    const tick = (now: number) => {
      const btn = btnRef.current;
      if (btn) {
        const r = btn.getBoundingClientRect();
        // centre of the button's untransformed box
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = mouse.x - cx, dy = mouse.y - cy;
        const d = Math.hypot(dx, dy);
        const target = Math.max(0, Math.min(1, 1 - (d - 18) / RANGE));
        // springy swell
        pv = (pv + (target - prox) * 0.16) * 0.72;
        prox += pv;
        const p = Math.max(0, prox);
        // lean toward the cursor
        const lean = Math.min(1, d / 60);
        ox += ((d > 0 ? (dx / d) * 14 * p * lean : 0) - ox) * 0.18;
        oy += ((d > 0 ? (dy / d) * 14 * p * lean : 0) - oy) * 0.18;

        const t = now / 1000;
        const R = R_MAX * p;
        let path = '';
        if (R > 0.5) {
          const N = 28;
          const pts: [number, number][] = [];
          for (let i = 0; i < N; i++) {
            const a = (i / N) * Math.PI * 2;
            const wob =
              1 +
              0.1 * Math.sin(a * 3 + t * 2.4) +
              0.07 * Math.sin(a * 5 - t * 3.1) +
              0.05 * Math.sin(a * 2 + t * 1.7);
            // stretch a little toward the cursor
            const toward = d > 0 ? Math.max(0, Math.cos(a - Math.atan2(dy, dx))) * 0.18 * p : 0;
            const rr = R * (wob + toward);
            pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
          }
          path = `M${((pts[0][0] + pts[N - 1][0]) / 2).toFixed(1)},${((pts[0][1] + pts[N - 1][1]) / 2).toFixed(1)}`;
          for (let i = 0; i < N; i++) {
            const c = pts[i], n = pts[(i + 1) % N];
            path += ` Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${((c[0] + n[0]) / 2).toFixed(1)},${((c[1] + n[1]) / 2).toFixed(1)}`;
          }
          path += 'Z';
        }
        blobRef.current?.setAttribute('d', path);
        if (blobWrap.current) blobWrap.current.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
        if (iconRef.current) iconRef.current.style.transform = `translate(calc(-50% + ${ox * 0.55}px), calc(-50% + ${oy * 0.55}px))`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, [btnRef]);

  // all layers share one centre point, a little in from the right edge
  const pos = { left: 'calc(100% - clamp(12px, 2.2vw, 32px) - 22px)', top: '50%' } as const;

  return (
    <>
      {/* blob layer */}
      <div
        ref={blobWrap}
        className="fixed pointer-events-none"
        style={{ ...pos, width: 120, height: 120, transform: 'translate(-50%, -50%)', zIndex: 149, mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        <svg width="120" height="120" viewBox="-60 -60 120 120" style={{ overflow: 'visible', display: 'block' }}>
          <path ref={blobRef} d="" fill="#fff" />
        </svg>
      </div>

      {/* icon layer */}
      <div
        ref={iconRef}
        className="fixed pointer-events-none flex flex-col items-center justify-center"
        style={{ ...pos, width: 44, height: 44, gap: 5, transform: 'translate(-50%, -50%)', zIndex: 151, mixBlendMode: 'difference' }}
        aria-hidden="true"
      >
        <span style={{ width: 22, height: 1.6, background: '#fff', display: 'block' }} />
        <span style={{ width: 15, height: 1.6, background: '#fff', display: 'block', marginLeft: 7 }} />
        <span style={{ width: 22, height: 1.6, background: '#fff', display: 'block' }} />
      </div>

      {/* invisible hit area */}
      <button
        ref={btnRef}
        type="button"
        onClick={onOpen}
        aria-label="Open menu"
        data-cursor="MENU"
        className="fixed"
        style={{ ...pos, width: 64, height: 64, transform: 'translate(-50%, -50%)', background: 'none', border: 0, cursor: 'pointer', zIndex: 152 }}
      />
    </>
  );
}
