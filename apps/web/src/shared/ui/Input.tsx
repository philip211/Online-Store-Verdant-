import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib'

interface FieldProps {
  label?: string
  error?: string
  hint?: string
}

const base =
  'w-full rounded-2xl border glass-card px-4 text-sm text-forest-50 placeholder:text-forest-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-forest-300/30 focus:border-forest-300'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ className, label, error, hint, id, ...rest }, ref) => {
    const inputId = id ?? rest.name
    return (
      <label className="block space-y-1.5" htmlFor={inputId}>
        {label && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-300">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(base, 'h-12', error ? 'border-rose-500 focus:ring-rose-300' : 'border-white/15', className)}
          {...rest}
        />
        {error ? (
          <span className="block text-xs text-rose-600">{error}</span>
        ) : hint ? (
          <span className="block text-xs text-forest-300">{hint}</span>
        ) : null}
      </label>
    )
  },
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ className, label, error, id, ...rest }, ref) => {
    const inputId = id ?? rest.name
    return (
      <label className="block space-y-1.5" htmlFor={inputId}>
        {label && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-300">{label}</span>}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(base, 'min-h-28 py-3', error ? 'border-rose-500' : 'border-white/15', className)}
          {...rest}
        />
        {error && <span className="block text-xs text-rose-600">{error}</span>}
      </label>
    )
  },
)
Textarea.displayName = 'Textarea'
