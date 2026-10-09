import type { ReactNode } from 'react'

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-forest-950 px-2.5 py-1.5 text-xs font-medium text-forest-100 opacity-0 shadow-lg transition-all duration-200 group-hover/tip:-translate-y-[calc(100%+4px)] group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  )
}
