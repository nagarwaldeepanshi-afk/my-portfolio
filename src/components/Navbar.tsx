import { useState, useRef } from 'react';
import MenuButton from './MenuButton';
import { createPortal } from 'react-dom';
import MenuOverlay from './MenuOverlay';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const menuBtn = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    const r = menuBtn.current?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setMenuOpen(true);
  };

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-[100] flex items-center justify-between"
      style={{
        height: '52px',
        padding: '0 clamp(16px, 4vw, 56px)',
        background: 'transparent',
      }}
    >
      {/* Left — logo + name */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-3"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="flex-shrink-0">
          <circle cx="11" cy="11" r="9.5" stroke="#050505" strokeWidth="0.8" />
          <circle cx="11" cy="11" r="5" stroke="#050505" strokeWidth="0.6" />
          <circle cx="11" cy="11" r="1.8" fill="#050505" />
          <line x1="11" y1="1" x2="11" y2="5.5" stroke="#050505" strokeWidth="0.7" />
          <line x1="11" y1="16.5" x2="11" y2="21" stroke="#050505" strokeWidth="0.7" />
          <line x1="1" y1="11" x2="5.5" y2="11" stroke="#050505" strokeWidth="0.7" />
          <line x1="16.5" y1="11" x2="21" y2="11" stroke="#050505" strokeWidth="0.7" />
        </svg>
        <span className="font-mono hidden sm:block font-semibold" style={{ fontSize: '12px', color: '#050505', letterSpacing: '0.14em' }}>
          DEEPANSHI NAGARWAL
        </span>
      </button>

      {createPortal(
        <>
          <MenuButton btnRef={menuBtn} onOpen={openMenu} />
          <MenuOverlay open={menuOpen} origin={origin} onClose={() => setMenuOpen(false)} />
        </>,
        document.body,
      )}
    </nav>
  );
}
