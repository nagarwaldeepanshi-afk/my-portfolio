import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { TIMELINE } from '../three/timeline.js'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

export default function Hero({ progress = 0 }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Fade the hero copy out as the ascii field starts accumulating, so the
  // forming PCB reads clearly rather than fighting with the headline.
  const fade = Math.max(0, 1 - progress / TIMELINE.heroFadeEnd)
  const lift = (1 - fade) * -40

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden z-10">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{ opacity: fade, transform: `translateY(${lift}px)`, pointerEvents: fade < 0.15 ? 'none' : 'auto' }}
        className="relative z-10 max-w-4xl mx-auto px-6 pt-28 sm:pt-24 text-center"
      >
        <motion.span
          variants={item}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-white/70 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent2 animate-pulse" />
          Available for new projects
        </motion.span>

        <motion.h1
          variants={item}
          className="font-display font-semibold text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-white"
        >
          {/* Grid: two text columns flanking a wide image column that
              spans both rows — the image cuts vertically through the
              middle of the two-line title. gridTemplateColumns gives
              the image column a large, explicit share of the width
              (up to 55vw) instead of shrinking to the image's own size. */}
          <div
            className="grid items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2 w-full"
            style={{
              gridTemplateAreas: `"lineA img lineB" "lineC img lineD"`,
              // Equal 1fr side columns keep the image at true center,
              // regardless of "Building" vs "interfaces" text-width
              // differences — previously "auto" let the wider word
              // push the image off-center.
              gridTemplateColumns: 'minmax(140px, 1fr) minmax(300px, 72vw) minmax(140px, 1fr)',
            }}
          >
            <span style={{ gridArea: 'lineA' }} className="text-right">Building</span>
            <span style={{ gridArea: 'lineB' }} className="text-left">interfaces</span>
            <span style={{ gridArea: 'lineC' }} className="text-right">that feel</span>
            <span style={{ gridArea: 'lineD' }} className="text-left">
              <span className="text-gradient">alive.</span>
            </span>

            <div
              style={{ gridArea: 'img' }}
              className="w-full h-64 sm:h-80 md:h-[28rem] overflow-hidden justify-self-center relative"
            >
              <img
                src="Untitled design (52).png"
                alt="Your Name"
                className="absolute inset-0 w-full h-full object-cover object-top scale-[2.6]"
              />
            </div>
          </div>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
        >
          I'm a product engineer crafting fast, immersive web experiences —
          where thoughtful motion and clean code meet.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => scrollTo('projects')}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-ink font-medium text-sm hover:bg-white/90 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            View my work
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="px-6 py-3 rounded-full glass text-white font-medium text-sm hover:bg-white/10 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            Get in touch
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/40 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">Scroll to build the board</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  )
}