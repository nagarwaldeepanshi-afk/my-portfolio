import { Html } from '@react-three/drei'
import { CHIPS, PCB_X_OFFSET } from './pcbLayout.js'
import { TIMELINE, smoothstep } from './timeline.js'

// Small "silkscreen" style callouts anchored to specific chips on the PCB.
// These are the About section's stats/skills, literally labeled on the board.
const LABELS = [
  { chip: 0, text: '4+ YRS', sub: 'EXPERIENCE', side: 'left' },
  { chip: 1, text: 'REACT / R3F', sub: 'CORE STACK', side: 'bottom' },
  { chip: 2, text: '20+', sub: 'PROJECTS SHIPPED', side: 'right' },
  { chip: 3, text: 'TYPESCRIPT', sub: 'TOOLING', side: 'bottom' },
  { chip: 4, text: 'DESIGN SYS', sub: 'CRAFT', side: 'left' },
]

function offsetFor(chip, side) {
  const pad = 0.55
  switch (side) {
    case 'left':
      return [chip.cx + PCB_X_OFFSET - chip.w / 2 - pad, chip.cy, 0.12]
    case 'right':
      return [chip.cx + PCB_X_OFFSET + chip.w / 2 + pad, chip.cy, 0.12]
    case 'bottom':
      return [chip.cx + PCB_X_OFFSET, chip.cy - chip.h / 2 - pad * 0.7, 0.12]
    default:
      return [chip.cx + PCB_X_OFFSET, chip.cy + chip.h / 2 + pad * 0.7, 0.12]
  }
}

export default function PCBLabels({ progress = 0 }) {
  const reveal = smoothstep(TIMELINE.labelsStart, TIMELINE.labelsEnd, progress)
  if (reveal <= 0.01) return null

  return (
    <>
      {LABELS.map((label, i) => {
        const chip = CHIPS[label.chip]
        const pos = offsetFor(chip, label.side)
        return (
          <Html key={i} position={pos} center distanceFactor={9} occlude={false}>
            <div
              className="pointer-events-none select-none whitespace-nowrap rounded-md border px-2.5 py-1 text-center backdrop-blur-sm"
              style={{
                opacity: reveal,
                transform: `translateY(${(1 - reveal) * 8}px)`,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                borderColor: 'rgba(64,224,208,0.35)',
                background: 'rgba(11,13,20,0.55)',
              }}
            >
              <div className="font-display text-[11px] font-semibold text-white leading-tight">
                {label.text}
              </div>
              <div className="text-[8px] tracking-wider text-accent2/80">{label.sub}</div>
            </div>
          </Html>
        )
      })}
    </>
  )
}
