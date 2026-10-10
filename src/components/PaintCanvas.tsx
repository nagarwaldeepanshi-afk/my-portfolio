import { useEffect, useRef, useCallback } from 'react';

interface Drip {
  x: number;
  y: number;
  vy: number;
  radius: number;
  maxLen: number;
  len: number;
  alpha: number;
}

interface Props {
  opacity?: number;
  className?: string;
  recoverySpeed?: number;
  eraseStrength?: number;
  // White text painted onto the black layer. It fades in when `showText`
  // turns true and is wiped away for good wherever the cursor passes.
  textLines?: { text: string; size: number; weight?: number; font?: string }[];
  textPos?: { x: number; y: number }; // fractions of width / height (top-left of first line)
  showText?: boolean;
}

export default function PaintCanvas({
  opacity = 1,
  className = '',
  recoverySpeed = 0.0035,
  eraseStrength = 0.92,
  textLines,
  textPos = { x: 0.05, y: 0.55 },
  showText = false,
}: Props) {
  const textRef = useRef<HTMLCanvasElement | null>(null);
  const textAlphaRef = useRef(0);
  const showTextRef = useRef(showText);
  showTextRef.current = showText;
  const textLinesRef = useRef(textLines);
  textLinesRef.current = textLines;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -999, y: -999, prevX: -999, prevY: -999, moved: false });
  const dripsRef = useRef<Drip[]>([]);
  const rafRef = useRef<number>(0);
  const readyRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) { readyRef.current = false; return; }

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    if (!offRef.current) offRef.current = document.createElement('canvas');
    const off = offRef.current;
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d')!;
    octx.fillStyle = '#050505';
    octx.fillRect(0, 0, w, h);

    // text layer
    const lines = textLinesRef.current;
    if (lines && lines.length) {
      if (!textRef.current) textRef.current = document.createElement('canvas');
      const tc = textRef.current;
      tc.width = w;
      tc.height = h;
      const tctx = tc.getContext('2d')!;
      tctx.clearRect(0, 0, w, h);
      tctx.fillStyle = '#FFFFFF';
      tctx.textBaseline = 'top';
      let y = textPos.y * h;
      const scale = Math.min(w / 1440, h / 820) * 1;
      for (const ln of lines) {
        const px = Math.max(18, ln.size * scale);
        tctx.font = `${ln.weight ?? 800} ${px}px ${ln.font ?? "'Space Grotesk', sans-serif"}`;
        tctx.fillText(ln.text, textPos.x * w, y);
        y += px * 1.02;
      }
    }
    readyRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    init();
    // redraw once web fonts are ready so the canvas text uses Space Grotesk
    if (textLinesRef.current && 'fonts' in document) {
      document.fonts.load("800 80px 'Space Grotesk'").then(() => init()).catch(() => {});
    }

    const ro = new ResizeObserver(() => {
      init();
      dripsRef.current = [];
    });
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = {
        prevX: mouseRef.current.x,
        prevY: mouseRef.current.y,
        x, y, moved: true,
      };
    };

    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;
      mouseRef.current = {
        prevX: mouseRef.current.x,
        prevY: mouseRef.current.y,
        x, y, moved: true,
      };
    };

    document.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove', onTouch, { passive: false });

    const animate = () => {
      const off = offRef.current;
      const display = canvasRef.current;
      if (!readyRef.current || !off || !display || off.width === 0 || off.height === 0) {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const octx = off.getContext('2d')!;
      const ctx = display.getContext('2d')!;
      const W = off.width;
      const H = off.height;

      // --- 1. Paint recovery (flows back) ---
      octx.globalCompositeOperation = 'source-over';
      octx.globalAlpha = recoverySpeed;
      octx.fillStyle = '#050505';
      octx.fillRect(0, 0, W, H);
      octx.globalAlpha = 1;

      // --- 2. Cursor erase ---
      const m = mouseRef.current;
      if (m.moved) {
        const dx = m.x - m.prevX;
        const dy = m.y - m.prevY;
        const speed = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const radius = Math.max(28, Math.min(130, speed * 2.2 + 28));
        const stretch = Math.min(2.8, 1 + speed / 30);

        octx.globalCompositeOperation = 'destination-out';
        octx.save();
        octx.translate(m.x, m.y);
        octx.rotate(angle);
        octx.scale(stretch, 1);
        octx.translate(-m.x, -m.y);

        // Core erase: soft radial gradient for organic liquid edge
        const g1 = octx.createRadialGradient(m.x, m.y, 0, m.x, m.y, radius);
        g1.addColorStop(0, `rgba(0,0,0,${eraseStrength})`);
        g1.addColorStop(0.45, `rgba(0,0,0,${eraseStrength * 0.75})`);
        g1.addColorStop(0.78, `rgba(0,0,0,${eraseStrength * 0.2})`);
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        octx.fillStyle = g1;
        octx.beginPath();
        octx.arc(m.x, m.y, radius * 1.15, 0, Math.PI * 2);
        octx.fill();

        // Secondary irregular halo - offset slightly for asymmetry
        const offX = m.x + Math.sin(Date.now() * 0.003) * radius * 0.18;
        const offY = m.y + Math.cos(Date.now() * 0.004) * radius * 0.12;
        const g2 = octx.createRadialGradient(offX, offY, 0, offX, offY, radius * 0.7);
        g2.addColorStop(0, `rgba(0,0,0,${eraseStrength * 0.35})`);
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        octx.fillStyle = g2;
        octx.beginPath();
        octx.arc(offX, offY, radius * 0.85, 0, Math.PI * 2);
        octx.fill();

        octx.restore();
        octx.globalCompositeOperation = 'source-over';

        // wipe the white text permanently along the same stroke
        const tc = textRef.current;
        if (tc && textAlphaRef.current > 0.05) {
          const tctx = tc.getContext('2d')!;
          tctx.save();
          tctx.globalCompositeOperation = 'destination-out';
          tctx.translate(m.x, m.y);
          tctx.rotate(angle);
          tctx.scale(stretch, 1);
          tctx.translate(-m.x, -m.y);
          const gt = tctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, radius);
          gt.addColorStop(0, 'rgba(0,0,0,1)');
          gt.addColorStop(0.6, 'rgba(0,0,0,0.9)');
          gt.addColorStop(1, 'rgba(0,0,0,0)');
          tctx.fillStyle = gt;
          tctx.beginPath();
          tctx.arc(m.x, m.y, radius * 1.1, 0, Math.PI * 2);
          tctx.fill();
          tctx.restore();
        }

        mouseRef.current.moved = false;
      }

      // --- 3. Render drips ---
      for (const d of dripsRef.current) {
        d.len = Math.min(d.maxLen, d.len + d.vy);
        d.y += d.vy * 0.6;

        octx.globalCompositeOperation = 'destination-out';

        // Drip body
        const dg = octx.createLinearGradient(d.x, d.y - d.len, d.x, d.y);
        dg.addColorStop(0, 'rgba(0,0,0,0)');
        dg.addColorStop(0.2, `rgba(0,0,0,${d.alpha * 0.5})`);
        dg.addColorStop(1, `rgba(0,0,0,${d.alpha})`);
        octx.fillStyle = dg;
        octx.beginPath();
        octx.ellipse(d.x, d.y - d.len / 2, d.radius, d.len / 2 + 1, 0, 0, Math.PI * 2);
        octx.fill();

        // Drip bulge at tip
        const bg = octx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.radius * 2.2);
        bg.addColorStop(0, `rgba(0,0,0,${d.alpha})`);
        bg.addColorStop(0.6, `rgba(0,0,0,${d.alpha * 0.4})`);
        bg.addColorStop(1, 'rgba(0,0,0,0)');
        octx.fillStyle = bg;
        octx.beginPath();
        octx.arc(d.x, d.y, d.radius * 2.2, 0, Math.PI * 2);
        octx.fill();

        octx.globalCompositeOperation = 'source-over';
      }

      dripsRef.current = dripsRef.current.filter(d => d.len < d.maxLen);

      // --- 4. Blit to display ---
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, display.width / dpr, display.height / dpr);
      ctx.drawImage(off, 0, 0);
      if (textRef.current) {
        const target = showTextRef.current ? 1 : 0;
        textAlphaRef.current += (target - textAlphaRef.current) * 0.04;
        if (textAlphaRef.current > 0.01) {
          ctx.globalAlpha = textAlphaRef.current;
          ctx.drawImage(textRef.current, 0, 0);
          ctx.globalAlpha = 1;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onTouch);
    };
  }, [init, recoverySpeed, eraseStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ opacity, touchAction: 'none' }}
    />
  );
}
