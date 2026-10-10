import { useEffect, useMemo, useRef, useState } from 'react';
import { buildPCB, TILE_H } from './pcbLayout';
import { cursorStore } from '../../cursorStore';

// idle       — not yet triggered
// bursting   — digits erupt out of the cursor blob's last position and
//              scatter across the whole section (the blob itself fades
//              out at the same time, via cursorStore.burstActive)
// assembling — scattered digits fly together into the PCB outline
// assembled  — final state, labels fade in
type Phase = 'idle' | 'bursting' | 'assembling' | 'assembled';

const BURST_DURATION = 900; // ms, CSS transition length for the burst
const BURST_MAX_DELAY = 380; // ms, max stagger added on top of that
const BURST_HOLD = BURST_DURATION + BURST_MAX_DELAY + 220; // pause before assembling
const ASSEMBLE_DURATION = 1900; // ms, matches the original assembly timing

interface LaidOutPoint {
  originX: number;
  originY: number;
  scatterX: number;
  scatterY: number;
  targetX: number;
  targetY: number;
  char: '0' | '1';
  burstDelay: number;
  assembleDelay: number;
}

interface LaidOutLabel {
  name: string;
  meta: string;
  x: number;
  y: number;
  side: 'left' | 'right';
  delay: number;
  // Backdrop layout extras: chip anchor + where the label text sits
  num: string;
  anchorX: number;
  anchorY: number;
  textX: number;
  textY: number;
}

type LabelMode = 'centroid' | 'column' | 'legend';

interface Props {
  // When true, the component fills its positioned parent (absolute,
  // inset 0) and acts as a backdrop: digits scatter across the whole
  // parent and the board assembles on the right-hand side.
  backdrop?: boolean;
}

export default function PCBReveal({ backdrop = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0, r: 14 });
  const [spreadStarted, setSpreadStarted] = useState(false);
  const hasTriggered = useRef(false);

  const { points, chips, bounds } = useMemo(() => buildPCB(), []);

  // Measure the container so scatter positions and PCB scale both
  // adapt to whatever width this ends up rendered at.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Trigger the sequence once, the first time this block scrolls into
  // view: capture where the mouse-following blob cursor currently sits
  // (relative to this container) so the digits can burst out from
  // that exact spot, then fade the blob itself via cursorStore so it
  // reads as "the blob turned into the digits".
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          const rect = el.getBoundingClientRect();
          const hasRealCursor = cursorStore.x > -100 && cursorStore.y > -100;
          const rawX = hasRealCursor ? cursorStore.x - rect.left : rect.width / 2;
          const rawY = hasRealCursor ? cursorStore.y - rect.top : rect.height / 2;
          setOrigin({
            x: Math.max(0, Math.min(rect.width, rawX)),
            y: Math.max(0, Math.min(rect.height, rawY)),
            r: cursorStore.baseR || 14,
          });

          cursorStore.burstActive = true;
          setPhase('bursting');

          // Mount digits at the origin point first, then flip to their
          // scatter targets one frame later so the transform change is
          // actually transitioned (a burst), not just teleported.
          const raf1 = requestAnimationFrame(() => {
            requestAnimationFrame(() => setSpreadStarted(true));
          });

          const t1 = setTimeout(() => {
            cursorStore.burstActive = false; // let the real cursor reappear
            setPhase('assembling');
          }, BURST_HOLD);
          const t2 = setTimeout(() => setPhase('assembled'), BURST_HOLD + ASSEMBLE_DURATION);

          return () => {
            cancelAnimationFrame(raf1);
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cursorStore.burstActive = false;
    };
  }, []);

  const { laidOutPoints, laidOutLabels, hint, labelMode } = useMemo(() => {
    if (size.width === 0) return { laidOutPoints: [] as LaidOutPoint[], laidOutLabels: [] as LaidOutLabel[], hint: { x: 0, y: 0 }, labelMode: 'centroid' as LabelMode };

    // Fit the PCB into a comfortable box within the measured container,
    // capped so it doesn't get absurdly large on wide screens.
    const narrow = size.width < 768;
    const sidePad = Math.min(80, Math.max(24, size.width * 0.05));
    const LABEL_COL = 180; // width reserved for the label column (desktop backdrop)
    const LABEL_GAP = 44; // space between board edge and label text
    const LEGEND_H = 132; // space reserved under the board for the mobile legend

    // Desktop backdrop: the About grid is [text 1fr | 38%] inside side padding.
    // Fit board + label column inside that right column and centre it there,
    // so it never runs into the About text.
    const colStart = sidePad + (size.width - sidePad * 2) * 0.62;
    const colW = size.width - sidePad - colStart;
    const targetWidth = backdrop
      ? (narrow
          ? Math.min(size.width * 0.78, 420)
          : Math.max(200, Math.min(400, colW - LABEL_GAP - LABEL_COL)))
      : Math.min(size.width * 0.62, 640);
    const scale = targetWidth / bounds.width;
    const targetHeight = bounds.height * scale;

    // Backdrop mode (desktop): board on the right with a clean label
    // column beside it. Narrow screens: board below the text with a
    // numbered legend underneath.
    const groupW = targetWidth + LABEL_GAP + LABEL_COL;
    const offsetX = backdrop && !narrow
      ? Math.max(colStart, colStart + (colW - groupW) / 2)
      : (size.width - targetWidth) / 2;
    const offsetY = backdrop && narrow
      ? size.height - LEGEND_H - targetHeight - 40
      : (size.height - targetHeight) / 2;

    const toScreen = (x: number, y: number) => ({
      x: offsetX + (x - bounds.minX) * scale,
      y: offsetY + (y - bounds.minY) * scale,
    });

    const laidOutPoints: LaidOutPoint[] = points.map((p, i) => {
      const target = toScreen(p.x, p.y);
      // Small jitter around the captured blob position so digits erupt
      // from roughly the blob's footprint, not a single exact pixel.
      const jitterAngle = Math.random() * Math.PI * 2;
      const jitterR = Math.random() * origin.r * 1.4;
      return {
        originX: origin.x + Math.cos(jitterAngle) * jitterR,
        originY: origin.y + Math.sin(jitterAngle) * jitterR,
        scatterX: Math.random() * size.width,
        scatterY: Math.random() * size.height,
        targetX: target.x,
        targetY: target.y,
        char: p.char,
        // Stagger the burst so it reads as an eruption, not a jump-cut.
        burstDelay: (i % 40) * 8 + Math.random() * BURST_MAX_DELAY,
        // Stagger by a hash of index rather than pure random so the
        // wave of assembly still looks intentional, not jittery.
        assembleDelay: (i % 40) * 14 + Math.random() * 120,
      };
    });

    const labelMode: LabelMode = !backdrop ? 'centroid' : narrow ? 'legend' : 'column';

    // Order chips top-to-bottom on screen so leader lines never cross
    // each other and the numbering reads naturally.
    const ordered = chips
      .map(chip => ({ chip, at: toScreen(chip.centroid!.x, chip.centroid!.y) }))
      .sort((a, b) => a.at.y - b.at.y || a.at.x - b.at.x);

    const n = ordered.length;
    const rowGap = Math.max(46, Math.min(64, targetHeight / Math.max(1, n - 1)));
    const colTop = offsetY + targetHeight / 2 - (rowGap * (n - 1)) / 2;
    const colX = offsetX + targetWidth + LABEL_GAP;
    const legendTop = offsetY + targetHeight + 36;
    const legendColW = (size.width - sidePad * 2) / 2;

    const laidOutLabels: LaidOutLabel[] = ordered.map(({ chip, at }, i) => {
      const side: 'left' | 'right' = at.x < size.width / 2 ? 'left' : 'right';
      const anchorY = at.y - TILE_H * scale * 0.5;
      let textX = colX;
      let textY = colTop + i * rowGap;
      if (labelMode === 'legend') {
        textX = sidePad + (i % 2) * legendColW;
        textY = legendTop + Math.floor(i / 2) * 40;
      }
      return {
        name: chip.name,
        meta: chip.meta,
        x: at.x,
        y: at.y - TILE_H, // nudge up slightly above the chip's top face
        side,
        delay: i * 140,
        num: String(i + 1).padStart(2, '0'),
        anchorX: at.x,
        anchorY,
        textX,
        textY,
      };
    });

    const hint = { x: offsetX + targetWidth / 2, y: offsetY + targetHeight / 2 };

    return { laidOutPoints, laidOutLabels, hint, labelMode };
  }, [size, points, chips, bounds, origin, backdrop]);

  return (
    <div
      ref={containerRef}
      className={backdrop ? 'absolute inset-0 pointer-events-none' : 'relative w-full'}
      style={backdrop ? undefined : { height: 'clamp(420px, 52vw, 620px)' }}
    >
      {/* Binary digits:
          idle       — not yet spawned
          bursting   — erupt from the cursor blob's captured position
                       (originX/Y) out to a scatter position across the
                       whole section (scatterX/Y), once spreadStarted
          assembling / assembled — animated to their PCB outline position */}
      {phase !== 'idle' &&
        laidOutPoints.map((p, i) => {
          const atTarget = phase === 'assembling' || phase === 'assembled';
          const atScatter = phase === 'bursting' && spreadStarted;

          let x = p.originX;
          let y = p.originY;
          if (atTarget) {
            x = p.targetX;
            y = p.targetY;
          } else if (atScatter) {
            x = p.scatterX;
            y = p.scatterY;
          }

          const opacity = atTarget ? 0.75 : atScatter ? 0.38 : 0.16;
          const delay = atTarget ? p.assembleDelay : p.burstDelay;

          return (
            <span
              key={i}
              className="absolute font-mono select-none pointer-events-none"
              style={{
                left: 0,
                top: 0,
                fontSize: '9px',
                lineHeight: 1,
                color: `rgba(255,255,255, ${opacity})`,
                transform: `translate3d(${x}px, ${y}px, 0)`,
                transition: `transform ${atTarget ? '1.1s' : '0.9s'} cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, color 0.6s ease ${delay}ms`,
                willChange: 'transform',
              }}
            >
              {p.char}
            </span>
          );
        })}

      {/* Skill labels, fading in once the board has assembled. Each is
          a small leader line + name + meta, anchored to its chip's
          centroid and pushed further left/right depending on which
          half of the board it sits on, so text doesn't overlap the
          PCB itself. */}
      {/* Backdrop layouts: leader lines + label column (desktop) or
          numbered chips + legend (mobile). Nothing overlaps the board. */}
      {phase === 'assembled' && labelMode !== 'centroid' && (
        <>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {laidOutLabels.map((l) => {
              const bendX = l.textX - 18;
              return (
                <g
                  key={l.name}
                  style={{ opacity: 0, animationName: 'pcb-fade-in', animationDuration: '0.6s', animationTimingFunction: 'ease', animationDelay: `${l.delay}ms`, animationFillMode: 'forwards' }}
                >
                  <circle cx={l.anchorX} cy={l.anchorY} r={2.5} fill="#F5F5F0" />
                  {labelMode === 'column' && (
                    <polyline
                      points={`${l.anchorX},${l.anchorY} ${bendX - 14},${l.anchorY} ${bendX},${l.textY} ${l.textX - 6},${l.textY}`}
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth={0.75}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {laidOutLabels.map((l) => (
            <div key={`t-${l.name}`}>
              {labelMode === 'legend' && (
                <span
                  className="absolute font-mono pointer-events-none"
                  style={{ left: l.anchorX + 6, top: l.anchorY - 14, fontSize: '9px', color: '#F5F5F0', opacity: 0, animationName: 'pcb-fade-in', animationDuration: '0.6s', animationDelay: `${l.delay}ms`, animationFillMode: 'forwards' }}
                >
                  {l.num}
                </span>
              )}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: l.textX,
                  top: l.textY,
                  transform: labelMode === 'column' ? 'translateY(-50%)' : undefined,
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  animationName: labelMode === 'column' ? 'pcb-label-in' : 'pcb-fade-in',
                  animationDuration: '0.6s',
                  animationTimingFunction: 'ease',
                  animationDelay: `${l.delay}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="font-mono uppercase tracking-[0.15em]" style={{ fontSize: '11px', color: '#F5F5F0' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>{l.num}</span>
                  {l.name}
                </div>
                <div className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', marginTop: 3 }}>
                  {l.meta}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {phase === 'assembled' && labelMode === 'centroid' &&
        laidOutLabels.map((label) => (
          <div
            key={label.name}
            className="absolute flex items-center gap-2 pointer-events-none"
            style={{
              top: label.y,
              left: label.side === 'left' ? undefined : label.x + 26,
              right: label.side === 'left' ? size.width - label.x + 26 : undefined,
              transform: 'translateY(-50%)',
              flexDirection: label.side === 'left' ? 'row-reverse' : 'row',
              opacity: 0,
              animationName: 'pcb-label-in',
              animationDuration: '0.6s',
              animationTimingFunction: 'ease',
              animationDelay: `${label.delay}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <span className="h-px" style={{ width: 22, background: 'rgba(255,255,255,0.4)' }} />
            <div className={label.side === 'left' ? 'text-right' : 'text-left'}>
              <div className="font-mono uppercase tracking-[0.15em]" style={{ fontSize: '11px', color: '#F5F5F0' }}>
                {label.name}
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
                {label.meta}
              </div>
            </div>
          </div>
        ))}

      {/* Empty-state hint before the section has ever been triggered,
          so the block doesn't look broken pre-scroll. */}
      {phase === 'idle' && (
        <div
          className={backdrop ? 'absolute' : 'absolute inset-0 flex items-center justify-center'}
          style={backdrop ? { left: hint.x, top: hint.y, transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap' } : undefined}
        >
          <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.25em' }}>
            SCROLL TO ASSEMBLE →
          </span>
        </div>
      )}
    </div>
  );
}
