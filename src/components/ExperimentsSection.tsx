import { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

interface Experiment {
  num: string;
  tags: string[];
  title: string;
  sub: string;
  video: string;
  poster: string;
  link?: { href: string; label: string };
}

const experiments: Experiment[] = [
  {
    num: '01',
    tags: ['VR', 'UNITY', 'META QUEST'],
    title: 'VR TRAVEL JOURNAL',
    sub: 'An immersive travel journal for VR. Walk through a portal tunnel onto a stage where an interactive map brings back trips to Mumbai, Goa and Manali, one memory at a time.',
    video: `${BASE}experiments/vr-travel-journal.mp4`,
    poster: `${BASE}experiments/vr-travel-journal.jpg`,
  },
  {
    num: '02',
    tags: ['DATA STORYTELLING', 'FRAMER', 'SCROLL'],
    title: 'EXPLORING THE WILDLIFE OF GUJARAT',
    sub: 'A scroll-based data story built in Framer. Google Trends and conservation data become a forest trail, with the Blackbuck as the hero that carries you from protected areas to IUCN status.',
    video: `${BASE}experiments/wildlife-screen-recording.mp4`,
    poster: `${BASE}experiments/wildlife-screen-recording.jpg`,
    link: { href: 'https://caring-pineapples-097278.framer.app/', label: 'VISIT LIVE SITE ↗' },
  },
];

function ExperimentVideo({ exp }: { exp: Experiment }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  // Only play while on screen (saves battery / bandwidth)
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);

  return (
    <article
      className="flex flex-col"
      style={{ borderTop: '1px solid #141414' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Video */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16 / 9', background: '#0b0b0b', border: `1px solid ${hovered ? 'rgba(255,255,255,0.25)' : '#161616'}`, transition: 'border-color 0.4s ease' }}
      >
        <video
          ref={ref}
          src={exp.video}
          poster={exp.poster}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div
          className="absolute top-3 left-3 font-mono"
          style={{ fontSize: '9px', letterSpacing: '0.25em', color: '#F5F5F0', background: 'rgba(5,5,5,0.6)', padding: '4px 8px', backdropFilter: 'blur(6px)' }}
        >
          EXP.{exp.num}
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col gap-4" style={{ paddingTop: '22px' }}>
        <div className="flex flex-wrap gap-2">
          {exp.tags.map(t => (
            <span
              key={t}
              className="font-mono"
              style={{ fontSize: '9px', letterSpacing: '0.22em', color: '#F5F5F0', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '100px' }}
            >
              {t}
            </span>
          ))}
        </div>
        <h3
          className="font-black uppercase leading-[0.95] tracking-tight"
          style={{ fontSize: 'clamp(24px, 2.6vw, 40px)', color: '#F5F5F0', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {exp.title}
        </h3>
        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(245,245,240,0.55)', maxWidth: '520px' }}>
          {exp.sub}
        </p>
        {exp.link && (
          <a
            href={exp.link.href}
            target="_blank"
            rel="noopener"
            data-cursor="OPEN"
            className="font-mono self-start"
            style={{ fontSize: '10px', letterSpacing: '0.22em', color: '#050505', background: '#F5F5F0', padding: '8px 14px', borderRadius: '100px' }}
          >
            {exp.link.label}
          </a>
        )}
      </div>
    </article>
  );
}

export default function ExperimentsSection() {
  return (
    <section id="experiments" style={{ background: '#050505', borderTop: '1px solid #0d0d0d' }}>
      {/* Header */}
      <div className="px-8 md:px-16 py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-px" style={{ background: '#FFFFFF' }} />
            <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              LAB / EXPERIMENTS
            </span>
          </div>
          <h2
            className="font-black tracking-tighter leading-none uppercase"
            style={{ fontSize: 'clamp(48px, 8vw, 120px)', fontFamily: "'Space Grotesk', sans-serif", color: '#F5F5F0' }}
          >
            EXPERI<br />
            <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.5)', color: 'transparent' }}>MENTS</span>
          </h2>
        </div>
        <p className="md:text-right" style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(245,245,240,0.45)', maxWidth: '320px' }}>
          Side projects where I try new media: virtual reality and scroll-driven data stories.
        </p>
      </div>

      {/* Two video experiments */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 px-8 md:px-16 pb-16"
        style={{ columnGap: 'clamp(24px, 4vw, 64px)', rowGap: '56px' }}
      >
        {experiments.map(exp => (
          <ExperimentVideo key={exp.num} exp={exp} />
        ))}
      </div>

      {/* Footer label */}
      <div className="px-8 md:px-16 py-6 flex items-center justify-between" style={{ borderTop: '1px solid #0d0d0d' }}>
        <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color: '#333' }}>
          DEEPANSHI NAGARWAL · EXPERIMENTAL PRACTICE
        </span>
        <span className="font-mono text-[9px]" style={{ color: '#FFFFFF', opacity: 0.3 }}>
          02 EXPERIMENTS
        </span>
      </div>
    </section>
  );
}
