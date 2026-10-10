export default function TechWorld() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#050505' }}>
      {/* Fine dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #1e1e1e 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scan line animation */}
      <div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%)',
          animationName: 'scan-line',
          animationDuration: '10s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          top: 0,
        }}
      />

      {/* Large hidden watermark words */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {([
          { text: 'SYSTEMS',     x: '3%',  y: '6%',  size: '16vw', op: 0.05, rot: '-2deg' },
          { text: 'INTERACTION', x: '-1%', y: '32%', size: '12vw', op: 0.04, rot: '0deg' },
          { text: 'RESEARCH',    x: '44%', y: '18%', size: '10vw', op: 0.055, rot: '1deg' },
          { text: 'PHYSICAL',    x: '52%', y: '52%', size: '11vw', op: 0.04, rot: '-1.5deg' },
          { text: 'DIGITAL',     x: '6%',  y: '66%', size: '14vw', op: 0.05, rot: '2deg' },
          { text: 'MOTION',      x: '58%', y: '76%', size: '10vw', op: 0.045, rot: '-1deg' },
          { text: 'EXPERIMENT',  x: '15%', y: '86%', size: '11vw', op: 0.04, rot: '1.5deg' },
        ] as const).map(({ text, x, y, size, op, rot }) => (
          <div
            key={text}
            className="absolute font-black leading-none whitespace-nowrap"
            style={{
              left: x, top: y,
              fontSize: size,
              color: `rgba(245,245,240,${op})`,
              fontFamily: "'Space Grotesk', sans-serif",
              transform: `rotate(${rot})`,
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* SVG wireframe tech layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ opacity: 0.2 }}
      >
        {/* Grid rules */}
        <line x1="0" y1="33.3%" x2="100%" y2="33.3%" stroke="#1e1e1e" strokeWidth="0.5" strokeDasharray="5 15" />
        <line x1="0" y1="66.6%" x2="100%" y2="66.6%" stroke="#1e1e1e" strokeWidth="0.5" strokeDasharray="5 15" />
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="4 14" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="4 14" />
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="4 14" />

        {/* Chat UI wireframe fragment */}
        <rect x="4%" y="8%" width="20%" height="16%" rx="3" fill="none" stroke="#2d2d2d" strokeWidth="0.7" />
        <rect x="4%" y="9.2%" width="20%" height="2%" rx="0" fill="#161616" />
        <line x1="4%" y1="11.2%" x2="24%" y2="11.2%" stroke="#222" strokeWidth="0.4" />
        <rect x="5%" y="12%" width="7%" height="1.8%" rx="2" fill="none" stroke="#252525" strokeWidth="0.5" />
        <rect x="14%" y="12%" width="9%" height="1.8%" rx="2" fill="#1e1e1e" />
        <rect x="5%" y="15%" width="5%" height="1.5%" rx="2" fill="#252525" />
        <rect x="14%" y="15%" width="8%" height="1.5%" rx="2" fill="none" stroke="#252525" strokeWidth="0.4" />

        {/* Phone wireframe */}
        <rect x="74%" y="5%" width="9%" height="20%" rx="4" fill="none" stroke="#2a2a2a" strokeWidth="0.8" />
        <rect x="75.5%" y="7.5%" width="6%" height="13%" fill="none" stroke="#222" strokeWidth="0.4" />
        <circle cx="78.5%" cy="23%" r="1%" fill="none" stroke="#222" strokeWidth="0.5" />
        <line x1="77%" y1="6.8%" x2="80%" y2="6.8%" stroke="#222" strokeWidth="0.5" />

        {/* Crosshair 1 */}
        <g>
          <circle cx="56%" cy="22%" r="2.2%" fill="none" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.35" />
          <circle cx="56%" cy="22%" r="1%" fill="none" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.2" />
          <line x1="53.2%" y1="22%" x2="54.5%" y2="22%" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.35" />
          <line x1="57.5%" y1="22%" x2="58.8%" y2="22%" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.35" />
          <line x1="56%" y1="19.2%" x2="56%" y2="20.5%" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.35" />
          <line x1="56%" y1="23.5%" x2="56%" y2="24.8%" stroke="#FFFFFF" strokeWidth="0.7" strokeOpacity="0.35" />
          <circle cx="56%" cy="22%" r="0.25%" fill="#FFFFFF" fillOpacity="0.4" />
        </g>

        {/* Hex grid fragment */}
        <polygon points="82%,40% 85%,38.5% 88%,40% 88%,43% 85%,44.5% 82%,43%" fill="none" stroke="#252525" strokeWidth="0.7" />
        <polygon points="88%,40% 91%,38.5% 94%,40% 94%,43% 91%,44.5% 88%,43%" fill="#141414" stroke="#252525" strokeWidth="0.7" />
        <polygon points="85%,44.5% 88%,43% 91%,44.5% 91%,47.5% 88%,49% 85%,47.5%" fill="none" stroke="#222" strokeWidth="0.6" />
        <circle cx="88%" cy="41.5%" r="0.6%" fill="#FFFFFF" fillOpacity="0.25" />

        {/* Timeline / flow */}
        <line x1="7%" y1="55%" x2="7%" y2="82%" stroke="#222" strokeWidth="0.8" />
        {[55, 63, 71, 79].map((y, i) => (
          <g key={y}>
            <circle cx="7%" cy={`${y}%`} r="0.6%" fill={i < 2 ? '#FFFFFF' : '#1e1e1e'}
              fillOpacity={i < 2 ? 0.35 : 1} stroke={i < 2 ? '#FFFFFF' : '#252525'} strokeWidth="0.5" strokeOpacity={i < 2 ? 0.5 : 1} />
            <line x1="7.6%" y1={`${y}%`} x2="18%" y2={`${y}%`} stroke="#1a1a1a" strokeWidth="0.4" />
            <rect x="18%" y={`${y - 2}%`} width="10%" height="4%" rx="1" fill="none" stroke="#222" strokeWidth="0.5" />
          </g>
        ))}

        {/* Corner coordinates */}
        <text x="1.5%" y="98%" fill="#222" fontSize="8" fontFamily="'Space Grotesk', sans-serif" letterSpacing="1">
          23.0225° N / 72.5714° E — AHMEDABAD
        </text>
        <text x="74%" y="98%" fill="#1e1e1e" fontSize="8" fontFamily="'Space Grotesk', sans-serif">
          PORTFOLIO v2.0
        </text>
        <text x="1.5%" y="2.5%" fill="#1e1e1e" fontSize="8" fontFamily="'Space Grotesk', sans-serif">
          DEEPANSHI.NAGARWAL — UX DESIGNER
        </text>

        {/* Abstract arc system */}
        <path d="M 90% 65% A 6% 6% 0 0 1 96% 71%" fill="none" stroke="#252525" strokeWidth="0.7" />
        <path d="M 90% 65% A 9% 9% 0 0 1 96% 74%" fill="none" stroke="#1e1e1e" strokeWidth="0.5" />
        <circle cx="90%" cy="65%" r="0.5%" fill="#FFFFFF" fillOpacity="0.3" />

        {/* Diagonal guide */}
        <line x1="0" y1="95%" x2="12%" y2="55%" stroke="#181818" strokeWidth="0.5" />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? '2px' : '1px',
              height: i % 3 === 0 ? '2px' : '1px',
              background: '#FFFFFF',
              left: `${8 + i * 6}%`,
              top: `${12 + (i % 6) * 15}%`,
              opacity: 0.18 + (i % 4) * 0.06,
              animationName: 'particle-float',
              animationDuration: `${3.5 + (i % 4) * 0.8}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: `${i * 0.35}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
