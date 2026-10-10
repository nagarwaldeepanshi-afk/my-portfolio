import PaintCanvas from './PaintCanvas';

const links = [
  { label: 'EMAIL', href: 'mailto:deepanshi.nagarwal@gmail.com', value: 'deepanshi.nagarwal@gmail.com' },
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/deepanshi-nagarwal-102645202/', value: '/in/deepanshi-nagarwal' },
  { label: 'BEHANCE', href: 'https://www.behance.net/deepansnagarwa', value: '/deepansnagarwa' },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden"
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
    >
      {/* Paint canvas layer */}
      <div className="absolute inset-0 z-10">
        <PaintCanvas opacity={0.9} />
      </div>

      {/* Black paint shape behind text */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '70%',
          background: '#050505',
          borderRadius: '48% 52% 60% 40% / 40% 50% 50% 60%',
          opacity: 0.06,
          zIndex: 5,
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-between min-h-screen px-8 md:px-16 py-24 pointer-events-none">
        {/* Top annotation */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-px" style={{ background: '#050505', opacity: 0.4 }} />
          <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'rgba(5,5,5,0.5)' }}>
            CONTACT / LET'S BUILD
          </span>
        </div>

        {/* Main CTA */}
        <div className="my-auto py-16">
          <h2
            className="font-black tracking-tighter leading-[0.85] uppercase"
            style={{
              fontSize: 'clamp(52px, 9vw, 150px)',
              color: '#050505',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            LET'S<br />
            MAKE<br />
            SOMETHING<br />
            WORTH<br />
            <span
              style={{
                WebkitTextStroke: '2px #050505',
                color: 'transparent',
                opacity: 0.4,
              }}
            >
              INTERACTING
            </span><br />
            WITH.
          </h2>
        </div>

        {/* Links row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="flex flex-col gap-3">
            {links.map(link => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener"
                className="group flex items-center gap-4 pointer-events-auto"
                style={{ textDecorationLine: 'none' }}
              >
                <span
                  className="font-mono text-[9px] tracking-[0.2em] w-20 flex-shrink-0"
                  style={{ color: 'rgba(5,5,5,0.5)' }}
                >
                  {link.label}
                </span>
                <span
                  className="font-mono text-xs transition-all duration-200 group-hover:underline"
                  style={{
                    color: '#050505',
                    textUnderlineOffset: '4px',
                    textDecorationColor: 'rgba(5,5,5,0.4)',
                  }}
                >
                  {link.value}
                </span>
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: '#050505', fontSize: '12px' }}
                >
                  ↗
                </span>
              </a>
            ))}
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#050505', opacity: 0.6 }} />
              <span className="font-mono text-[9px] tracking-wider" style={{ color: 'rgba(5,5,5,0.5)' }}>
                AVAILABLE FOR PROJECTS
              </span>
            </div>
            <span className="font-mono text-[9px] tracking-wider" style={{ color: 'rgba(5,5,5,0.35)' }}>
              GANDHINAGAR, INDIA
            </span>
          </div>
        </div>
      </div>

      {/* Decorative drip shapes */}
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: `${20 + i * 28}%`,
            width: '3px',
            background: '#050505',
            opacity: 0.08,
            height: `${40 + i * 15}px`,
            borderRadius: '0 0 2px 2px',
            zIndex: 5,
          }}
        />
      ))}
    </section>
  );
}
