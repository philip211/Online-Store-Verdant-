import type { SVGProps } from 'react'

/** Brand hemp leaf mark, 7-lobed leaf drawn as a single path. */
export function HempLeaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden {...props}>
      <path d="M32 6c3.2 8.4 4.4 16.9 2.4 25.4 6-6.4 12.6-9.6 21-9.9-5.6 6.6-10.6 10.8-18.8 13 8.4-.2 14.8 2.7 21.2 8.2-8.4 1.4-15-.2-21.4-3.7 5.5 5.2 8.6 10.7 9.8 18.3-6.4-3-10.8-7.3-13.8-13.6l.2 12.3h-2.4l.2-12.3c-3 6.3-7.4 10.6-13.8 13.6 1.2-7.6 4.3-13.1 9.8-18.3-6.4 3.5-13 5.1-21.4 3.7 6.4-5.5 12.8-8.4 21.2-8.2C18.2 32.3 13.2 28.1 7.6 21.5c8.4.3 15 3.5 21 9.9C26.6 22.9 27.8 14.4 32 6z" />
    </svg>
  )
}

/** Small sprig icon used as a list bullet (mirrors the reference sheet). */
export function Sprig(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden {...props}>
      <path d="M12 21V6" />
      <path d="M12 9c-2.5 0-4.5-1.5-5-4 2.5 0 4.5 1.5 5 4z" />
      <path d="M12 9c2.5 0 4.5-1.5 5-4-2.5 0-4.5 1.5-5 4z" />
      <path d="M12 14c-2.5 0-4.5-1.5-5-4 2.5 0 4.5 1.5 5 4z" />
      <path d="M12 14c2.5 0 4.5-1.5 5-4-2.5 0-4.5 1.5-5 4z" />
      <path d="M12 6c-1-1-1-3 0-4 1 1 1 3 0 4z" />
    </svg>
  )
}
