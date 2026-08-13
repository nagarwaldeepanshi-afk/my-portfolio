import { useEffect, useState } from 'react'

// Gates the heavier USB-cable + 3D-display scene to devices that can
// comfortably handle it: wide viewport, precise pointer (mouse/trackpad),
// and no reduced-motion preference. Everyone else gets the plain project
// grid — same content, no extra WebGL cost, fully accessible.
export function useCanRender3DExtras() {
  const [can, setCan] = useState(false)

  useEffect(() => {
    const evaluate = () => {
      const wideEnough = window.innerWidth >= 1024
      const finePointer = window.matchMedia('(pointer: fine)').matches
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setCan(wideEnough && finePointer && !reducedMotion)
    }
    evaluate()
    window.addEventListener('resize', evaluate)
    return () => window.removeEventListener('resize', evaluate)
  }, [])

  return can
}
