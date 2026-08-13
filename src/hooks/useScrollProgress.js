import { useEffect, useRef, useState } from 'react'

// Tracks scroll progress (0 -> 1) of a wrapper element as it moves through
// the viewport: 0 when its top hits the top of the screen, 1 when its
// bottom reaches the top of the screen. Also reports whether the wrapper
// is anywhere near the viewport, so callers can hide/pause when far away.
export function useScrollProgress(ref) {
  const [state, setState] = useState({ value: 0, active: true })
  const frame = useRef(null)

  useEffect(() => {
    const tick = () => {
      const el = ref.current
      if (el) {
        const rect = el.getBoundingClientRect()
        const vh = window.innerHeight || 1
        const total = rect.height - vh
        const scrolled = -rect.top
        const value = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0
        const active = rect.bottom > -vh * 0.25 && rect.top < vh * 1.25
        setState((prev) =>
          prev.value === value && prev.active === active ? prev : { value, active }
        )
      }
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [ref])

  return state
}
