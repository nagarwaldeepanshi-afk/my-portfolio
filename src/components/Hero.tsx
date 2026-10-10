import { useEffect, useState } from 'react';
import PaintCanvas from './PaintCanvas';
import AsciiBackground from './AsciiBackground';

interface Props {
  scrollProgress: number;
  loaded: boolean;
}

export default function Hero({ scrollProgress, loaded }: Props) {
  const paintOpacity = Math.max(0, 1 - scrollProgress * 2.8);

  const textColor = '#050505';

  // ALIVE scroll choreography
  const FILL_END = 0.3; // fraction of a screen scrolled when the fill completes
  const fillT = Math.min(1, scrollProgress / FILL_END);
  const aliveFill = Math.round(fillT * 1000) / 10; // 0 → 100 (%)
  const dropT = Math.max(0, (scrollProgress - FILL_END) / (1 - FILL_END));
  const vh = typeof window !== 'undefined' ? window.innerHeight || 800 : 800;
  const aliveDrop = dropT * dropT * vh * 0.8; // eases in, then sinks into About

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [loaded]);

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ height: '100svh', minHeight: '600px', background: '#FFFFFF' }}
    >
      {/* Floating ASCII layer */}
      <div className="absolute inset-0 z-[1]">
        <AsciiBackground />
      </div>

      {/* Paint canvas */}
      <div
        className="absolute inset-0 z-10"
        style={{ opacity: paintOpacity, pointerEvents: 'none', transition: 'opacity 0.08s linear' }}
      >
        <PaintCanvas
          recoverySpeed={0.0028}
          eraseStrength={0.95}
          showText={visible}
          textPos={{ x: 0.045, y: 0.6 }}
          textLines={[
            { text: "Hi, I'm", size: 38, weight: 500 },
            { text: 'Deepanshi', size: 80, weight: 800 },
          ]}
        />
      </div>

{/* Main composition */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{ padding: 'clamp(20px, 5vw, 72px)' }}
      >
        {/* Top strip */}
        <div
          className="flex items-center justify-between"
          style={{
            paddingTop: '58px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(-8px)',
            transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
          }}
        >
          <div className="flex items-center gap-3 font-mono" style={{ fontSize: '9px', color: textColor, opacity: 0.45, letterSpacing: '0.22em' }}>
            <span>BASED IN INDIA</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>2026</span>
          </div>
          <div className="font-mono hidden md:block" style={{ fontSize: '9px', color: textColor, opacity: 0.35, letterSpacing: '0.22em' }}>
            DESIGN / INTERACTION / EXPERIMENTS
          </div>
        </div>

        {/* 3-column: left text | centre avatar | right text */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplateRows: '1fr auto',
            paddingTop: '44px',
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.9s ease 0.05s, transform 0.9s ease 0.05s',
          }}
        >
          {/* Main row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr clamp(200px, 28vw, 400px) 1fr',
              columnGap: 'clamp(8px, 2vw, 28px)',
              padding: '0 clamp(16px, 4vw, 56px)',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {/* LEFT column — right-aligned */}
            <div className="flex flex-col justify-start items-end gap-3" style={{ paddingTop: '0', marginTop: '-15%' }}>
              {/* DESIGNING — solid, right-aligned */}
              <div
                className="font-black leading-[0.82] tracking-tighter uppercase text-right"
                style={{
                  fontSize: 'clamp(32px, 5.8vw, 90px)',
                  color: textColor,
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'color 0.08s linear',
                  wordBreak: 'break-all',
                  hyphens: 'none',
                }}
              >
                DESIGNING
              </div>

              {/* THAT — outline, right-aligned */}
              <div
                className="font-black leading-[0.82] tracking-tighter uppercase text-right"
                style={{
                  fontSize: 'clamp(26px, 4.8vw, 74px)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  WebkitTextStroke: `clamp(1px, 0.09vw, 1.5px) ${textColor}`,
                  WebkitTextFillColor: 'transparent',
                  transition: '-webkit-text-stroke-color 0.08s linear',
                }}
              >
                THAT
              </div>
            </div>

            {/* CENTRE — placeholder; actual avatar is FloatingAvatar (fixed) */}
            <div style={{ height: '100%' }} />

            {/* RIGHT column — left-aligned */}
            <div className="flex flex-col justify-center items-start gap-3">
              {/* INTERFACES — solid, one line */}
              <div
                className="font-black leading-[0.82] tracking-tighter uppercase"
                style={{
                  fontSize: 'clamp(28px, 5vw, 78px)',
                  color: textColor,
                  fontFamily: "'Space Grotesk', sans-serif",
                  transition: 'color 0.08s linear',
                }}
              >
                INTERFACES
              </div>

              {/* FEELS — outline */}
              <div
                className="font-black leading-[0.82] tracking-tighter uppercase"
                style={{
                  fontSize: 'clamp(28px, 5vw, 78px)',
                  fontFamily: "'Space Grotesk', sans-serif",
                  WebkitTextStroke: `clamp(1px, 0.09vw, 1.5px) ${textColor}`,
                  WebkitTextFillColor: 'transparent',
                  transition: '-webkit-text-stroke-color 0.08s linear',
                }}
              >
                FEELS
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1 mt-2">
                {['UI/UX', 'PRODUCT', 'INTERACTION'].map((t, i) => (
                  <span key={t} className="font-mono" style={{ fontSize: '9px', color: textColor, opacity: 0.3 - i * 0.05, letterSpacing: '0.2em' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ALIVE — full-width centred at bottom.
              Scroll 0 → 30% of a screen: the outlined word fills with black,
              rising from the bottom like ink.
              After that it sinks downward as you scroll on, sliding into the
              black About section where it merges into the background. */}
          <div
            className="flex justify-center items-end"
            style={{
              padding: '0 clamp(16px, 4vw, 56px)',
              paddingBottom: 'clamp(12px, 3vh, 32px)',
              transform: `translateY(${aliveDrop}px)`,
              willChange: 'transform',
            }}
          >
            <div
              className="font-black leading-[0.80] tracking-tighter uppercase"
              style={{
                fontSize: 'clamp(56px, 13vw, 200px)',
                fontFamily: "'Space Grotesk', sans-serif",
                WebkitTextStroke: `clamp(1px, 0.13vw, 2.5px) ${textColor}`,
                WebkitTextFillColor: 'transparent',
                backgroundImage: `linear-gradient(to top, ${textColor} ${aliveFill}%, transparent ${aliveFill}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              ALIVE
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute flex flex-col items-center gap-1"
          style={{
            bottom: 'clamp(20px, 4vh, 40px)',
            left: 'clamp(20px, 5vw, 72px)',
            opacity: visible ? Math.max(0, 1 - scrollProgress * 5) : 0,
            transition: 'opacity 0.8s ease 0.8s',
          }}
        >
          <div className="h-8 w-px" style={{ background: `rgba(255,255,255,0.4)` }} />
          <div className="w-1 h-1 rotate-45 border-b border-r" style={{ borderColor: 'rgba(255,255,255,0.4)' }} />
        </div>

        {/* Right-side floating stat */}
        <div
          className="absolute hidden md:flex flex-col gap-6"
          style={{
            right: 'clamp(20px, 5vw, 72px)',
            bottom: 'clamp(80px, 14vh, 160px)',
            opacity: visible ? 0.7 : 0,
            transition: 'opacity 1s ease 0.6s',
          }}
        >
          {[['12+', 'PROJECTS'], ['M.DES', 'UI/UX · DAU'], ['B.TECH', 'ECE · DTU']].map(([n, l]) => (
            <div key={l} className="flex flex-col items-end">
              <span className="font-black leading-none" style={{ fontSize: 'clamp(20px, 2.5vw, 34px)', color: '#FFFFFF', opacity: 0.85 }}>{n}</span>
              <span className="font-mono" style={{ fontSize: '8px', color: textColor, opacity: 0.35, letterSpacing: '0.18em' }}>{l}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
