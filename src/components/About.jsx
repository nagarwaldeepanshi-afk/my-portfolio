import { Code2, Palette, Rocket } from 'lucide-react'
import { TIMELINE, smoothstep } from '../three/timeline.js'

const highlights = [
  {
    icon: Code2,
    title: 'Engineering',
    text: 'React, TypeScript, and Three.js — performant front-ends that hold up at scale.',
  },
  {
    icon: Palette,
    title: 'Design systems',
    text: 'Component libraries and motion languages that keep products feeling coherent.',
  },
  {
    icon: Rocket,
    title: 'Shipping',
    text: 'From prototype to production — I care as much about launch as I do about polish.',
  },
]

export default function About({ progress = 0 }) {
  // Content reveals only once the ascii field has mostly finished forming
  // the PCB, so the assembly animation reads clearly before text competes
  // for attention.
  const reveal = smoothstep(TIMELINE.aboutRevealStart, TIMELINE.aboutRevealEnd, progress)
  const lift = (1 - reveal) * 24

  return (
    <section
      id="about"
      className="relative z-10 min-h-screen flex items-center py-32 px-6"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div
            style={{
              opacity: reveal,
              transform: `translateY(${lift}px)`,
              transition: 'opacity 0.2s linear',
            }}
            className="glass rounded-3xl p-8 sm:p-10"
          >
            <span className="text-sm font-medium text-accent2 tracking-wide uppercase">
              About
            </span>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-4 text-white leading-tight">
              Four years turning ideas into circuits of interface.
            </h2>

            <p className="text-white/60 text-base leading-relaxed mt-6">
              I'm Alex, a product engineer based in San Francisco. I partner with founders
              and design teams to build web products that feel effortless — blending
              clean engineering with subtle, purposeful motion.
            </p>
            <p className="text-white/60 text-base leading-relaxed mt-4">
              My work spans dashboards, storefronts, and creative tools, with a focus on
              performance budgets that don't sacrifice visual ambition. The board forming
              beside this panel isn't just decoration — every trace is data, same as the
              stats labeled across it.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 pt-8">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 hover:bg-white/[0.07] transition-colors"
                >
                  <Icon size={18} className="text-accent2 mb-2.5" />
                  <h3 className="font-medium text-white text-sm mb-1">{title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column intentionally left clear — the 3D PCB assembles
              here, with its stat/skill callouts rendered in 3D via
              PCBLabels so they sit directly on the board. */}
          <div className="hidden lg:block h-[480px]" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
