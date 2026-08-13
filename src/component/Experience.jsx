import { useRef } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import { useCanRender3DExtras } from '../hooks/useCanRender3DExtras.js'
import CodeUniverse from '../three/CodeUniverse.jsx'
import Hero from './Hero.jsx'
import About from './About.jsx'
import Projects from './Projects.jsx'
import { PROJECTS_TIMELINE } from '../three/sceneLayout.js'
import { smoothstep } from '../three/timeline.js'

// Wraps Hero + About (+ Projects, on capable devices) in scroll-progress
// containers so the single background 3D canvas — ascii field -> PCB ->
// USB cable -> powered display — stays perfectly in sync with the content
// as the user scrolls through all three.
export default function Experience() {
  const canRender3DExtras = useCanRender3DExtras()

  const outerRef = useRef(null)
  const heroAboutRef = useRef(null)
  const projectsRef = useRef(null)

  const outer = useScrollProgress(outerRef)
  const heroAbout = useScrollProgress(heroAboutRef)
  const projects3D = useScrollProgress(projectsRef)

  return (
    <>
      <div ref={outerRef} className="relative">
        <CodeUniverse
          heroAboutProgress={heroAbout.value}
          projectsProgress={canRender3DExtras ? projects3D.value : 0}
          showProjectsScene={canRender3DExtras}
          active={outer.active}
        />

        <div ref={heroAboutRef}>
          <Hero progress={heroAbout.value} />
          <About progress={heroAbout.value} />
        </div>

        {canRender3DExtras && (
          <div ref={projectsRef} id="projects" className="relative z-10 min-h-[220vh]">
            <ProjectsSceneHint progress={projects3D.value} />
          </div>
        )}
      </div>

      {!canRender3DExtras && <Projects />}
    </>
  )
}

function ProjectsSceneHint({ progress }) {
  const introOpacity = 1 - smoothstep(0, PROJECTS_TIMELINE.cableStart + 0.05, progress)
  const introLift = introOpacity * -16

  return (
    <div className="sticky top-0 h-screen flex flex-col items-center justify-center pointer-events-none px-6">
      <div
        style={{ opacity: introOpacity, transform: `translateY(${introLift}px)` }}
        className="text-center max-w-md"
      >
        <span className="text-sm font-medium text-accent2 tracking-wide uppercase">
          Selected work
        </span>
        <p className="mt-3 text-white/50 text-sm">
          Keep scrolling — powering up the display.
        </p>
      </div>
    </div>
  )
}
