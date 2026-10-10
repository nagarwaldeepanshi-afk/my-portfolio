import { useEffect, useRef, useState } from 'react';

export default function PhilosophySection() {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const words = ['I DESIGN', 'THINGS', 'THAT PEOPLE', 'CAN FEEL.'];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-8 md:px-16 py-24 md:py-36"
      style={{ background: '#050505', borderTop: '1px solid #0f0f0f' }}
    >
      {/* Faint grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
        <svg className="w-full h-full">
          {[33, 66].map(p => <line key={p} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#FFFFFF" strokeWidth="0.5" />)}
          {[33, 66].map(p => <line key={p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#333" strokeWidth="0.4" />)}
        </svg>
      </div>

      {/* Giant statement */}
      <div className="relative">
        {words.map((word, i) => (
          <div
            key={word}
            className="font-black leading-[0.83] tracking-tighter uppercase overflow-hidden"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(52px, 10.5vw, 160px)',
            }}
          >
            <span
              className="block"
              style={{
                color: i === words.length - 1 ? '#FFFFFF' : '#F5F5F0',
                transform: vis ? 'translateY(0)' : 'translateY(110%)',
                transition: `transform 0.85s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
                paddingLeft: i % 2 === 1 ? 'clamp(24px, 5vw, 80px)' : '0',
              }}
            >
              {word}
            </span>
          </div>
        ))}

        {/* Paragraph — right aligned on desktop */}
        <div
          className="mt-12 md:mt-16 max-w-sm md:ml-auto"
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? 'none' : 'translateY(16px)',
            transition: 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-5" style={{ background: '#FFFFFF', opacity: 0.5 }} />
            <span className="font-mono" style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.25em' }}>DESIGN PHILOSOPHY</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,240,0.5)' }}>
            "I move between digital interfaces, physical objects,
            visual art and performance. That range shapes the way
            I observe people, systems and interactions."
          </p>
        </div>
      </div>
    </section>
  );
}
