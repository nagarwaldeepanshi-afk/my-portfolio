import { ArrowUpRight } from 'lucide-react'
import { projects } from '../data/projects.js'

// Compact card grid rendered *inside* the 3D display (via drei's Html
// transform) — sized in real pixels, then scaled down to world units by
// the parent group in Display.jsx so it maps precisely onto the screen mesh.
export default function ProjectsScreenContent() {
  return (
    <div
      style={{
        width: 900,
        height: 536,
        padding: 28,
        boxSizing: 'border-box',
        background: 'linear-gradient(160deg, #0b0d14 0%, #05060a 100%)',
        fontFamily: '"Inter", system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: '#40e0d0', fontWeight: 600 }}>
            SELECTED WORK
          </div>
          <div style={{ fontSize: 22, color: '#ffffff', fontWeight: 700, fontFamily: '"Space Grotesk", sans-serif' }}>
            Projects shipped recently
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>alex.dev / projects</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, flex: 1 }}>
        {projects.map((project) => (
          <a
            key={project.id}
            href={project.link}
            style={{
              position: 'relative',
              borderRadius: 16,
              padding: 18,
              background: 'rgba(255,255,255,0.045)',
              border: '1px solid rgba(255,255,255,0.09)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: project.color,
                opacity: 0.18,
                filter: 'blur(2px)',
              }}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#fff',
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${project.color}30`,
                    border: `1px solid ${project.color}55`,
                  }}
                >
                  {String(project.id).padStart(2, '0')}
                </span>
                <ArrowUpRight size={15} color="rgba(255,255,255,0.35)" />
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 10 }}>
                {project.title}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 4,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </div>
            </div>
            <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 9.5,
                    padding: '3px 7px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
