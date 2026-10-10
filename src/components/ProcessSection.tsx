import { useEffect, useState } from 'react';
import Dial from './Dial';

const steps = [
  { id: 'OBSERVE', desc: 'Understand the human, the system, and the gap between them.' },
  { id: 'QUESTION', desc: 'Challenge assumptions. Define what actually needs solving.' },
  { id: 'EXPLORE', desc: 'Sketch, prototype, break — across material and digital.' },
  { id: 'BUILD', desc: 'Craft the interaction. Wire motion, logic, and feedback.' },
  { id: 'TEST', desc: 'Place it in real hands. Watch what breaks.' },
  { id: 'REFINE', desc: 'Polish until the seams disappear.' },
];

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);

  // tick forward like a clock
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setActiveStep(a => (a + 1) % steps.length), 2800);
    return () => clearTimeout(t);
  }, [activeStep, paused]);

  return (
    <section
      id="process"
      className="relative overflow-hidden px-8 md:px-16 py-24"
      style={{ background: '#050505', borderTop: '1px solid #0d0d0d' }}
    >
      {/* Background technical diagram - faint */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" style={{ opacity: 0.04 }}>
          <circle cx="80%" cy="50%" r="30%" fill="none" stroke="#FFFFFF" strokeWidth="0.6" strokeDasharray="4 12" />
          <circle cx="80%" cy="50%" r="20%" fill="none" stroke="#FFFFFF" strokeWidth="0.4" strokeDasharray="2 8" />
          <circle cx="80%" cy="50%" r="10%" fill="none" stroke="#FFFFFF" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-3 mb-16">
        <div className="w-6 h-px" style={{ background: '#FFFFFF' }} />
        <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          DESIGN PROCESS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* Left - title */}
        <div>
          <h2
            className="font-black tracking-tighter leading-none uppercase mb-6"
            style={{
              fontSize: 'clamp(48px, 7vw, 110px)',
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#F5F5F0',
            }}
          >
            HOW<br />I<br />
            <span style={{ color: '#FFFFFF' }}>THINK.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,240,0.35)', maxWidth: '340px' }}>
            Every project moves through the same arc — from
            observation to something that actually works in the world.
          </p>
        </div>

        {/* Right - process "clock": steps sit around a rotating dial
            (after the Wove menu by Hello Monday). It ticks forward on its
            own like a clock; hover to pause, click a step or use the arrows. */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative" style={{ height: 'clamp(420px, 62vh, 600px)' }}>
            <Dial
              items={steps.map((st, i) => ({ num: String(i + 1).padStart(2, '0'), title: st.id, sub: st.desc }))}
              active={activeStep}
              onSelect={setActiveStep}
              theme="dark"
              edge={0.14}
              stepDeg={26}
              clip={false}
            />
          </div>

          {/* controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => setActiveStep(a => (a - 1 + steps.length) % steps.length)}
              className="font-mono"
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', color: '#F5F5F0', background: 'none', cursor: 'pointer' }}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() => setActiveStep(a => (a + 1) % steps.length)}
              className="font-mono"
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', color: '#F5F5F0', background: 'none', cursor: 'pointer' }}
            >
              ↓
            </button>
            <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {String(activeStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {paused ? 'PAUSED' : 'AUTO'}
            </span>
          </div>

          {/* Technical corner label */}
          <div
            className="mt-8 flex items-center gap-3"
            style={{ borderTop: '1px solid #111', paddingTop: '16px' }}
          >
            <span className="font-mono text-[8px] tracking-wider" style={{ color: '#2a2a2a' }}>
              ITERATIVE / NON-LINEAR / HUMAN-CENTERED
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
