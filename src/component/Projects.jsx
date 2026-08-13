import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects.js'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function ProjectCard({ project }) {
  return (
    <motion.a
      href={project.link}
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative rounded-3xl p-8 glass overflow-hidden block"
    >
      <div
        className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity duration-500"
        style={{ background: project.color }}
      />

      <div className="relative flex items-start justify-between mb-8">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold text-white"
          style={{ background: `${project.color}25`, border: `1px solid ${project.color}40` }}
        >
          {String(project.id).padStart(2, '0')}
        </div>
        <ArrowUpRight
          size={20}
          className="text-white/30 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300"
        />
      </div>

      <h3 className="relative font-display font-semibold text-xl text-white mb-3">
        {project.title}
      </h3>
      <p className="relative text-white/55 text-sm leading-relaxed mb-6">
        {project.description}
      </p>

      <div className="relative flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50 border border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.a>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-16 max-w-xl">
            <span className="text-sm font-medium text-accent2 tracking-wide uppercase">Selected work</span>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl mt-4 text-white leading-tight">
              Projects I've shipped recently.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
