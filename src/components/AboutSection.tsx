import { useEffect, useRef, useState } from 'react';
import PCBReveal from './pcb/PCBReveal';

export default function AboutSection() {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="about"
      className="relative overflow-hidden"
      style={{ background: '#050505', minHeight: '100vh', borderTop: '1px solid #111' }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <svg className="w-full h-full">
          {[20, 40, 60, 80].map(p => (
            <line key={p} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#FFFFFF" strokeWidth="0.4" />
          ))}
        </svg>
      </div>

      {/* SKILLS backdrop — binary digits burst across the whole section
          on first scroll into view, then assemble into the PCB on the right */}
      <PCBReveal backdrop />

      {/* Two-column layout: left = about text, right = skills board (backdrop) */}
      <div
        className="relative grid grid-cols-1 md:grid-cols-[1fr_38%]"
        style={{
          zIndex: 1,
          minHeight: '100vh',
          padding: 'clamp(24px, 5vw, 80px)',
          paddingTop: 'clamp(60px, 10vh, 120px)',
        }}
      >
        {/* LEFT — all the text content */}
        <div className="flex flex-col justify-center" style={{ paddingRight: 'clamp(16px, 4vw, 60px)' }}>
          {/* Section marker */}
          <div
            className="flex items-center gap-3 mb-10"
            style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.6s ease 0.1s' }}
          >
            <div className="w-5 h-px" style={{ background: '#FFFFFF' }} />
            <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3em' }}>ABOUT × SKILLS</span>
          </div>

          {/* Main statement */}
          <div className="mb-12">
            <h2
              className="font-black tracking-tighter leading-[0.85] uppercase"
              style={{ fontSize: 'clamp(44px, 7.5vw, 120px)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span
                style={{
                  display: 'block',
                  color: '#F5F5F0',
                  opacity: vis ? 1 : 0,
                  transform: vis ? 'none' : 'translateY(24px)',
                  transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
                }}
              >
                MORE THAN
              </span>
              <span
                style={{
                  display: 'block',
                  color: '#FFFFFF',
                  paddingLeft: 'clamp(16px, 3vw, 48px)',
                  opacity: vis ? 1 : 0,
                  transform: vis ? 'none' : 'translateY(24px)',
                  transition: 'opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s',
                }}
              >
                A DESIGNER.
              </span>
            </h2>
            <p
              style={{
                marginTop: '28px',
                maxWidth: '560px',
                fontSize: '15px',
                lineHeight: 1.65,
                color: 'rgba(245,245,240,0.6)',
                opacity: vis ? 1 : 0,
                transition: 'opacity 0.7s ease 0.35s',
              }}
            >
              M.Des UI/UX Design student with an engineering background. I design intuitive interfaces,
              tangible interactions and immersive product experiences where design, technology and human
              behaviour meet, across UX research, product, service and interaction design, IoT, AR and
              physical-digital systems.
            </p>
          </div>

          {/* Identity words — two aligned rows:
              DESIGNER  ARTIST
              DANCER    ENGINEER */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              justifyContent: 'start',
              alignItems: 'start',
              columnGap: 'clamp(24px, 4vw, 64px)',
              rowGap: 'clamp(24px, 5vh, 48px)',
              opacity: vis ? 1 : 0,
              transition: 'opacity 0.8s ease 0.4s',
            }}
          >
            {[
              ['DESIGNER', 'UI/UX · PRODUCT · INTERACTION'],
              ['ARTIST', 'PAINTER · VISUAL ARTIST'],
              ['DANCER', 'PROFESSIONAL KATHAK DANCER'],
              ['ENGINEER', 'B.TECH ELECTRONICS & COMMUNICATION'],
            ].map(([word, sub]) => (
              <div
                key={word}
                className="font-black uppercase leading-none tracking-tighter select-none"
                style={{ fontSize: 'clamp(28px, 4.5vw, 68px)', color: '#F5F5F0', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {word}
                {sub && (
                  <div className="font-mono mt-1" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', fontWeight: 400 }}>
                    {sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bio line */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mt-10"
            style={{ borderTop: '1px solid #111', paddingTop: '20px', opacity: vis ? 1 : 0, transition: 'opacity 0.7s ease 0.8s' }}
          >
            {[
              ['EDUCATION', 'M.Des, Intelligent UI/UX Design · Dhirubhai Ambani University, Gandhinagar · 2025 to present'],
              ['ENGINEERING', 'B.Tech, Electronics & Communication · Delhi Technological University · 2020 to 2024'],
              ['EXPERIENCE', 'Network Planning Intern · Tata Tele Business Services, Delhi · May to Sep 2023'],
              ['FOCUS', 'UX design · interaction · product · design research · physical computing · emerging interfaces'],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="font-mono" style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', marginBottom: '4px' }}>{l}</div>
                <div className="font-mono" style={{ fontSize: '10px', lineHeight: 1.55, color: 'rgba(245,245,240,0.55)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — skills board assembles here (rendered by the backdrop layer) */}
        <div className="hidden md:block" />

        {/* Mobile: leave room below the text for the skills board */}
        <div className="md:hidden" style={{ height: 'clamp(500px, 130vw, 620px)' }} />
      </div>

    </section>
  );
}
