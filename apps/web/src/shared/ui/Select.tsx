import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib'

export interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  options: SelectOption<T>[]
  onChange: (value: T) => void
  /** Accessible name for the trigger button (use `label` for a visible caption instead) */
  ariaLabel?: string
  /** Visible caption above the field, styled like Input's label */
  label?: string
  error?: string
  hint?: string
  /** Decorative element rendered before the current label (e.g. an icon) */
  icon?: ReactNode
  className?: string
  /** `pill` — compact rounded control (toolbars); `field` — full-width form field matching Input */
  variant?: 'pill' | 'field'
  /** Horizontal alignment of the popover relative to the trigger */
  align?: 'start' | 'end'
  /** Form field name, exposed on the trigger for autofill/analytics and as the id base */
  name?: string
}

/**
 * Themed replacement for a native <select>: the popover is rendered by us,
 * so it matches the glass theme instead of the browser's default list.
 * Keyboard: ArrowUp/Down, Home/End, PageUp/PageDown, type-ahead by letters,
 * Enter/Space to pick, Escape to close. Long lists scroll inside the popover.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  label,
  error,
  hint,
  icon,
  className,
  variant = 'pill',
  align = 'start',
  name,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  // Optimistic copy of `value`: the trigger label flips the moment an option is
  // picked, even if the parent's state (URL, data) takes a while to catch up.
  const [shown, setShown] = useState(value)
  useEffect(() => setShown(value), [value])
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)))
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const typeahead = useRef({ text: '', at: 0 })
  const listId = useId()
  const isField = variant === 'field'

  const selected = options.find((o) => o.value === shown) ?? options[0]

  // close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // when opening, highlight the current value and move focus into the list
  useEffect(() => {
    if (!open) return
    setActive(Math.max(0, options.findIndex((o) => o.value === shown)))
    const id = requestAnimationFrame(() => listRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [open, options, shown])

  // keep the highlighted option visible inside a scrolling list
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${listId}-${active}`)}`)?.scrollIntoView({ block: 'nearest' })
  }, [open, active, listId])

  const focusTrigger = () => rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus()

  const pick = (v: T) => {
    setShown(v)
    onChange(v)
    setOpen(false)
    focusTrigger()
  }

  const jumpTo = (i: number) => setActive(Math.min(options.length - 1, Math.max(0, i)))

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        jumpTo(active + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        jumpTo(active - 1)
        break
      case 'PageDown':
        e.preventDefault()
        jumpTo(active + 8)
        break
      case 'PageUp':
        e.preventDefault()
        jumpTo(active - 8)
        break
      case 'Home':
        e.preventDefault()
        jumpTo(0)
        break
      case 'End':
        e.preventDefault()
        jumpTo(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        pick(options[active].value)
        break
      case 'Escape':
        setOpen(false)
        focusTrigger()
        break
      case 'Tab':
        setOpen(false)
        break
      default: {
        // type-ahead: letters typed within a second accumulate into a prefix
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return
        const now = Date.now()
        const prev = now - typeahead.current.at < 1000 ? typeahead.current.text : ''
        const text = (prev + e.key).toLowerCase()
        typeahead.current = { text, at: now }
        // a repeated single letter cycles through matches starting with it
        const cycling = text.length > 1 && text.split('').every((c) => c === text[0])
        const needle = cycling ? text[0] : text
        const start = cycling ? active + 1 : 0
        const idx = [...options.keys()].map((i) => (start + i) % options.length).find((i) => options[i].label.toLowerCase().startsWith(needle))
        if (idx != null) setActive(idx)
      }
    }
  }

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  const ring = 'focus-visible:shadow-[0_0_0_4px_rgb(161_194_159/0.12),0_8px_30px_-12px_rgb(161_194_159/0.45)]'
  const openRing = 'border-forest-300/60 shadow-[0_0_0_4px_rgb(161_194_159/0.12),0_8px_30px_-12px_rgb(161_194_159/0.45)]'

  return (
    <div ref={rootRef} className={cn(isField ? 'block space-y-1.5' : 'relative inline-block text-sm', className)}>
      {label && <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-forest-300">{label}</span>}
      <div className={cn(isField && 'relative')}>
        <button
          type="button"
          name={name}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={onTriggerKey}
          className={cn(
            'group inline-flex items-center gap-2 border glass-card text-forest-100 transition-[border-color,box-shadow] duration-300 focus:outline-none',
            isField ? 'h-12 w-full rounded-2xl px-4 text-sm' : 'rounded-full py-2 pl-4 pr-3',
            error ? 'border-rose-500 hover:border-rose-400 focus-visible:border-rose-400' : 'border-white/15 hover:border-white/25 focus-visible:border-forest-300',
            ring,
            open && !error && openRing,
          )}
        >
          {icon}
          <span className={cn('truncate font-medium text-forest-50', isField && 'flex-1 text-left')}>{selected?.label}</span>
          <ChevronDown
            className={cn('size-4 shrink-0 text-forest-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]', open && 'rotate-180 text-forest-200')}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={`${listId}-${active}`}
              onKeyDown={onListKey}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.6 }}
              style={{ transformOrigin: align === 'end' ? 'top right' : 'top left' }}
              className={cn(
                'no-scrollbar absolute top-[calc(100%+8px)] z-40 max-h-72 origin-top overflow-y-auto overscroll-contain rounded-2xl p-1.5 focus:outline-none',
                isField ? 'w-full' : 'min-w-full w-max',
                // opaque on purpose: a translucent popover over glass cards (backdrop-filter)
                // lets their content bleed through in Chrome, and no blur is cheaper anyway
                'border border-white/12 bg-[linear-gradient(180deg,#14301f_0%,#0d1f16_100%)]',
                'shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_24px_60px_-24px_rgb(0_0_0/0.8)]',
                align === 'end' ? 'right-0' : 'left-0',
              )}
            >
              {options.map((o, i) => {
                const isSelected = o.value === shown
                const isActive = i === active
                return (
                  <li
                    key={o.value}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => setActive(i)}
                    onClick={() => pick(o.value)}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center justify-between gap-6 rounded-xl px-3 py-2 pr-2.5 text-forest-200 transition-colors duration-150',
                      isActive && 'bg-white/[0.08] text-forest-50',
                      isSelected && 'text-forest-50',
                    )}
                  >
                    <span className={cn('whitespace-nowrap', isSelected && 'font-medium')}>{o.label}</span>
                    <Check
                      className={cn('size-4 shrink-0 text-gold-400 transition-opacity duration-150', isSelected ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                  </li>
                )
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error ? <span className="block text-xs text-rose-600">{error}</span> : hint ? <span className="block text-xs text-forest-300">{hint}</span> : null}
    </div>
  )
}
