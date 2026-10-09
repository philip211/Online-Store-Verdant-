import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue } from 'framer-motion'

export function AnimatedNumber({ value, suffix = '', duration = 1.6 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('ru-RU') + suffix
      },
    })
    return () => controls.stop()
  }, [inView, value, duration, suffix, mv])

  return <span ref={ref}>0{suffix}</span>
}
