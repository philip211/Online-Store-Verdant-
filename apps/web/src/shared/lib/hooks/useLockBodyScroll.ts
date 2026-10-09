import { useLayoutEffect } from 'react'

export function useLockBodyScroll(locked: boolean) {
  useLayoutEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = original
      document.body.style.paddingRight = ''
    }
  }, [locked])
}
