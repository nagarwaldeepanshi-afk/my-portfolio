import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    let val = 0;
    const interval = setInterval(() => {
      // Ease in: slow start, fast middle, slow finish
      const increment = val < 30 ? 0.6 : val < 70 ? 1.8 : val < 90 ? 1.1 : 0.4;
      val = Math.min(100, val + increment);
      setProgress(Math.floor(val));
      if (val >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setWiping(true);
          setTimeout(onComplete, 700);
        }, 300);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center"
      style={{
        background: '#FFFFFF',
        transform: wiping ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.7s cubic-bezier(0.77,0,0.175,1)',
      }}
    >
      {/* Abstract symbol */}
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="mb-8">
        <circle cx="18" cy="18" r="16" stroke="#050505" strokeWidth="1" />
        <circle cx="18" cy="18" r="10" stroke="#050505" strokeWidth="0.7" />
        <circle cx="18" cy="18" r="3" fill="#050505" />
        <line x1="18" y1="2" x2="18" y2="8" stroke="#050505" strokeWidth="1" />
        <line x1="18" y1="28" x2="18" y2="34" stroke="#050505" strokeWidth="1" />
        <line x1="2" y1="18" x2="8" y2="18" stroke="#050505" strokeWidth="1" />
        <line x1="28" y1="18" x2="34" y2="18" stroke="#050505" strokeWidth="1" />
        <line x1="7" y1="7" x2="11" y2="11" stroke="#050505" strokeWidth="0.6" />
        <line x1="25" y1="25" x2="29" y2="29" stroke="#050505" strokeWidth="0.6" />
      </svg>

      {/* Counter */}
      <div className="font-mono text-sm tracking-[0.35em] mb-4" style={{ color: '#050505' }}>
        LOADING {String(progress).padStart(2, '0')}%
      </div>

      {/* Progress bar track */}
      <div className="relative" style={{ width: '160px', height: '1px', background: 'rgba(5,5,5,0.2)' }}>
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${progress}%`,
            background: '#050505',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
}
