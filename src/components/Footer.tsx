import BackToTop from './BackToTop';

export default function Footer() {
  return (
    <footer
      className="px-8 md:px-16 pt-10"
      style={{ background: '#050505', borderTop: '1px solid #0f0f0f' }}
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        {/* Left — name + disciplines */}
        <div>
          <div
            className="font-black tracking-tight uppercase leading-none mb-3"
            style={{ fontSize: 'clamp(18px, 2.5vw, 30px)', color: '#F5F5F0', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            DEEPANSHI NAGARWAL
          </div>
          <div className="flex flex-col gap-0.5">
            {['UI/UX DESIGNER', 'PRODUCT DESIGNER', 'INTERACTION DESIGNER'].map(t => (
              <span key={t} className="font-mono" style={{ fontSize: '8px', color: '#333', letterSpacing: '0.2em' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Right — socials + year */}
        <div className="flex items-end gap-8">
          <div className="flex items-center gap-5">
            {[
              ['EMAIL', 'mailto:deepanshi.nagarwal@gmail.com'],
              ['LINKEDIN', 'https://www.linkedin.com/in/deepanshi-nagarwal-102645202/'],
              ['BEHANCE', 'https://www.behance.net/deepansnagarwa'],
            ].map(([s, href]) => (
              <a
                key={s}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noopener"
                className="font-mono group"
                style={{ fontSize: '8px', color: '#666', letterSpacing: '0.18em' }}
              >
                <span className="group-hover:text-[#FFFFFF] transition-colors duration-200">{s}</span>
              </a>
            ))}
          </div>
          <span className="font-mono" style={{ fontSize: '8px', color: '#2a2a2a', letterSpacing: '0.15em' }}>© 2026</span>
        </div>
      </div>

      {/* Bottom micro line */}
      <div
        className="mt-8 flex items-center justify-between"
        style={{ borderTop: '1px solid #0d0d0d', paddingTop: '16px' }}
      >
        <span className="font-mono" style={{ fontSize: '7px', color: '#1e1e1e', letterSpacing: '0.2em' }}>
          DESIGNED IN GANDHINAGAR · BUILT WITH INTERACTION
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#FFFFFF', opacity: 0.6, animationName: 'blink-dot', animationDuration: '2s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}
          />
          <span className="font-mono" style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>AVAILABLE</span>
        </div>
      </div>

      {/* elastic back-to-top bulge at the very bottom */}
      <BackToTop />
    </footer>
  );
}
