import { useMemo } from 'react';

const CHARS = ['<', '>', '/', '\\', '|', '{', '}', '[', ']', '#', '@', '&', '*', '%', '0', '1', '_', '-', '=', '+', '~', ';', ':', '!', '?'];

interface Particle {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function AsciiBackground() {
  const particles = useMemo<Particle[]>(() => {
    const seed = (n: number) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      char: CHARS[Math.floor(seed(i * 3) * CHARS.length)],
      x: seed(i * 7) * 100,
      y: seed(i * 13) * 100,
      size: 10 + seed(i * 17) * 14,
      opacity: 0.06 + seed(i * 23) * 0.12,
      duration: 6 + seed(i * 31) * 12,
      delay: -(seed(i * 41) * 15),
      drift: (seed(i * 53) - 0.5) * 40,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute font-mono select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            color: '#050505',
            animationName: 'ascii-float',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            '--drift': `${p.drift}px`,
          } as React.CSSProperties}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}
