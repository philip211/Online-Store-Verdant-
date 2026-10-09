import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib'

type Variant = 'primary' | 'gold' | 'outline' | 'ghost' | 'dark' | 'soft'
type Size = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  /** @deprecated kept for call-site compatibility; the sweep effect was removed for a calmer UI. */
  shine?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-forest-300 text-forest-950 hover:bg-forest-200 active:bg-forest-400 shadow-[0_10px_30px_-10px_rgba(161,194,159,0.6)] focus-visible:ring-forest-300',
  gold: 'bg-gold-500 text-forest-950 hover:bg-gold-400 active:bg-gold-600 shadow-soft focus-visible:ring-gold-400',
  outline:
    'border border-white/20 bg-white/[0.06] text-forest-50 hover:border-forest-300/70 hover:bg-white/10 focus-visible:ring-forest-300',
  ghost: 'text-forest-100 hover:bg-white/10 focus-visible:ring-forest-300',
  dark: 'bg-forest-950/90 text-forest-100 ring-1 ring-white/15 hover:bg-forest-900 focus-visible:ring-gold-400',
  soft: 'bg-white/10 text-forest-50 hover:bg-white/15 focus-visible:ring-forest-300',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-13 px-8 text-[15px] gap-2.5',
  icon: 'h-11 w-11 p-0',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, shine: _shine, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-950',
        'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  ),
)
Button.displayName = 'Button'
