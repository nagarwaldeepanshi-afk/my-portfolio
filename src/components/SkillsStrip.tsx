// Thin skills strip between Design Process and Contact: one slim band
// with the skills running horizontally in an endless loop.

const SKILLS = [
  'UI / UX DESIGN', 'PRODUCT DESIGN', 'INTERACTION DESIGN', 'SERVICE DESIGN', 'DESIGN SYSTEMS', 'VISUAL DESIGN',
  'USER RESEARCH', 'USER INTERVIEWS', 'JOURNEY MAPPING', 'INFORMATION ARCHITECTURE', 'USABILITY TESTING', 'A/B TESTING',
  'FIGMA', 'FIGJAM', 'FRAMER', 'ADOBE CC', 'BLENDER', 'UNITY',
  'ARDUINO', 'RASPBERRY PI', 'RFID · SENSORS', 'AR CONCEPTS', 'HTML · CSS · JS', 'REACT',
];

const ROW_H = 56;

function Run() {
  return (
    <div className="flex items-center flex-none" aria-hidden="true">
      {SKILLS.map((s, i) => (
        <span key={i} className="flex items-center flex-none">
          <span
            className="font-black uppercase tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(13px, 1.3vw, 18px)',
              color: i % 2 === 0 ? '#F5F5F0' : 'transparent',
              WebkitTextStroke: i % 2 === 0 ? undefined : '1px rgba(245,245,240,0.6)',
              whiteSpace: 'nowrap',
              padding: '0 clamp(14px, 1.6vw, 24px)',
            }}
          >
            {s}
          </span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(245,245,240,0.4)', flex: 'none' }} />
        </span>
      ))}
    </div>
  );
}

export default function SkillsStrip() {
  return (
    <section
      id="skills"
      aria-label="Skills"
      className="relative flex items-stretch overflow-hidden"
      style={{ height: ROW_H, background: '#050505', borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}
    >
      <div
        className="flex items-center gap-3 flex-none relative"
        style={{ padding: '0 clamp(16px, 4vw, 64px)', background: '#050505', zIndex: 2, borderRight: '1px solid #1a1a1a' }}
      >
        <div className="w-5 h-px hidden sm:block" style={{ background: '#FFFFFF' }} />
        <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
          SKILLS
        </span>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
        }}
      >
        <span className="sr-only">{SKILLS.join(', ')}</span>
        <div className="skills-marquee flex h-full items-center w-max">
          <Run />
          <Run />
        </div>
      </div>
    </section>
  );
}
