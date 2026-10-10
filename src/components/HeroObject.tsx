export default function HeroObject() {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        right: 'clamp(40px, 8vw, 120px)',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 'clamp(160px, 22vw, 320px)',
        height: 'clamp(160px, 22vw, 320px)',
        zIndex: 5,
        opacity: 0.55,
      }}
    >
      <svg
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer technical ring */}
        <circle cx="160" cy="160" r="150" stroke="#1e1e1e" strokeWidth="0.8" />
        <circle cx="160" cy="160" r="148" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="8 22" />

        {/* Major ring */}
        <circle cx="160" cy="160" r="120" stroke="#2a2a2a" strokeWidth="1.2" />

        {/* Rotated ellipses — depth illusion */}
        <ellipse cx="160" cy="160" rx="120" ry="38" stroke="#242424" strokeWidth="0.8" transform="rotate(-15 160 160)" />
        <ellipse cx="160" cy="160" rx="120" ry="28" stroke="#1e1e1e" strokeWidth="0.5" transform="rotate(25 160 160)" />

        {/* Inner core ring */}
        <circle cx="160" cy="160" r="72" stroke="#333" strokeWidth="1" />
        <circle cx="160" cy="160" r="70" stroke="#FFFFFF" strokeWidth="0.4" strokeOpacity="0.3" strokeDasharray="4 12" />

        {/* Center hex */}
        <polygon
          points="160,122 192,141 192,179 160,198 128,179 128,141"
          stroke="#2d2d2d"
          strokeWidth="1"
          fill="#0d0d0d"
        />
        <polygon
          points="160,134 180,145 180,167 160,178 140,167 140,145"
          stroke="#FFFFFF"
          strokeWidth="0.5"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* Center dot */}
        <circle cx="160" cy="160" r="6" fill="#FFFFFF" fillOpacity="0.5" />
        <circle cx="160" cy="160" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />

        {/* Cardinal tick marks on outer ring */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const long = deg % 90 === 0;
          const r1 = long ? 136 : 143;
          const r2 = 150;
          return (
            <line
              key={deg}
              x1={160 + r1 * Math.cos(rad)}
              y1={160 + r1 * Math.sin(rad)}
              x2={160 + r2 * Math.cos(rad)}
              y2={160 + r2 * Math.sin(rad)}
              stroke={long ? '#FFFFFF' : '#2a2a2a'}
              strokeWidth={long ? '1.2' : '0.6'}
              strokeOpacity={long ? 0.6 : 0.8}
            />
          );
        })}

        {/* Arm / bracket structures */}
        <line x1="160" y1="10" x2="160" y2="88" stroke="#1e1e1e" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="160" y1="232" x2="160" y2="310" stroke="#1e1e1e" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="10" y1="160" x2="88" y2="160" stroke="#1e1e1e" strokeWidth="0.6" strokeDasharray="3 6" />
        <line x1="232" y1="160" x2="310" y2="160" stroke="#1e1e1e" strokeWidth="0.6" strokeDasharray="3 6" />

        {/* Tab modules at cardinal points */}
        <rect x="140" y="4" width="40" height="22" rx="2" fill="#111" stroke="#2a2a2a" strokeWidth="0.8" />
        <text x="160" y="18.5" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontFamily="'Space Grotesk', sans-serif" fillOpacity="0.6">SYS</text>

        <rect x="140" y="294" width="40" height="22" rx="2" fill="#111" stroke="#2a2a2a" strokeWidth="0.8" />
        <text x="160" y="308.5" textAnchor="middle" fill="#555" fontSize="7" fontFamily="'Space Grotesk', sans-serif">I/O</text>

        <rect x="4" y="149" width="28" height="22" rx="2" fill="#111" stroke="#2a2a2a" strokeWidth="0.8" />
        <circle cx="18" cy="160" r="3" fill="#FFFFFF" fillOpacity="0.4" />

        <rect x="288" y="149" width="28" height="22" rx="2" fill="#111" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="302" y="163.5" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontFamily="'Space Grotesk', sans-serif" fillOpacity="0.5">RX</text>

        {/* Diagonal structural lines */}
        <line x1="75" y1="75" x2="105" y2="105" stroke="#1a1a1a" strokeWidth="0.6" />
        <line x1="245" y1="75" x2="215" y2="105" stroke="#1a1a1a" strokeWidth="0.6" />
        <line x1="75" y1="245" x2="105" y2="215" stroke="#1a1a1a" strokeWidth="0.6" />
        <line x1="245" y1="245" x2="215" y2="215" stroke="#1a1a1a" strokeWidth="0.6" />

        {/* Small corner dot sensors */}
        {[[75, 75], [245, 75], [75, 245], [245, 245]].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="5" fill="#111" stroke="#2a2a2a" strokeWidth="0.7" />
            <circle cx={cx} cy={cy} r="1.5" fill="#FFFFFF" fillOpacity={i === 0 ? 0.8 : 0.2} />
          </g>
        ))}

        {/* Small arc segments on inner ring */}
        {[30, 150, 210, 330].map((deg) => {
          const r = (deg * Math.PI) / 180;
          const r2 = ((deg + 18) * Math.PI) / 180;
          return (
            <path
              key={deg}
              d={`M${160 + 72 * Math.cos(r)},${160 + 72 * Math.sin(r)} A72,72 0 0,1 ${160 + 72 * Math.cos(r2)},${160 + 72 * Math.sin(r2)}`}
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
          );
        })}

        {/* Label annotations */}
        <text x="172" y="134" fill="#444" fontSize="6" fontFamily="'Space Grotesk', sans-serif">Ø 240mm</text>
        <text x="66" y="100" fill="#333" fontSize="6" fontFamily="'Space Grotesk', sans-serif" transform="rotate(-45 80 96)">REV.04</text>
      </svg>
    </div>
  );
}
