import { cn } from '@/shared/lib'
import { HempLeaf } from '@/shared/ui'
import { getProductPhoto } from '../model/photos'
import type { Product } from '../model/types'

interface Props {
  product: Product
  className?: string
  variant?: 'card' | 'hero' | 'thumb'
  angle?: number
}

/**
 * Procedural product artwork: a branded gradient plate with a category-specific illustration.
 * Uses product.hue to tint the accent so every SKU feels distinct while staying on-palette.
 */
/** With a photo, gallery "angles" become detail crops instead of rotations. */
const PHOTO_CROPS: Record<number, string> = {
  [-8]: 'scale-[1.45] origin-[30%_35%]',
  8: 'scale-[1.7] origin-[70%_60%]',
  180: 'scale-[1.3] origin-[50%_85%]',
}

export function ProductVisual({ product, className, variant = 'card', angle = 0 }: Props) {
  const photo = getProductPhoto(product.id)
  if (photo) {
    return (
      <div className={cn('relative h-full w-full overflow-hidden bg-forest-900', className)}>
        <img
          src={photo}
          alt={variant === 'hero' ? product.name : ''}
          loading={variant === 'hero' ? 'eager' : 'lazy'}
          fetchPriority={variant === 'hero' && angle === 0 ? 'high' : undefined}
          decoding="async"
          draggable={false}
          className={cn('size-full object-cover', PHOTO_CROPS[angle])}
        />
      </div>
    )
  }

  const h = product.hue
  const accent = `hsl(${h} 45% 62%)`
  const accentDeep = `hsl(${h} 50% 32%)`
  const id = `${product.id}-${variant}-${angle}`

  return (
    <div
      className={cn(
        'relative isolate flex h-full w-full items-center justify-center overflow-hidden',
        'bg-[radial-gradient(120%_100%_at_30%_20%,#2e6b3f_0%,#14381f_55%,#0d1f16_100%)]',
        className,
      )}
    >
      {/* soft colored light */}
      <div
        className="pointer-events-none absolute -right-1/4 -top-1/4 size-[80%] rounded-full opacity-60 blur-3xl"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 65%)` }}
      />
      <div className="pointer-events-none absolute -bottom-1/3 -left-1/4 size-[70%] rounded-full bg-gold-500/20 blur-3xl" />
      {/* watermark leaf */}
      <HempLeaf className="pointer-events-none absolute -bottom-6 -right-6 size-[62%] text-forest-100/[0.05]" />

      <svg viewBox="0 0 200 240" className="relative z-10 h-[78%] w-auto drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]" style={{ transform: `rotate(${angle}deg)` }}>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6f2e1" />
            <stop offset="100%" stopColor="#a1c29f" />
          </linearGradient>
          <linearGradient id={`glass-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id={`liquid-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={accentDeep} />
          </linearGradient>
          <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a9884d" />
            <stop offset="50%" stopColor="#e3cfa3" />
            <stop offset="100%" stopColor="#a9884d" />
          </linearGradient>
        </defs>
        {product.category === 'flowers' && <FlowerJar id={id} accent={accent} />}
        {product.category === 'oils' && <DropperBottle id={id} />}
        {product.category === 'edibles' && <GummyJar id={id} accent={accent} />}
        {product.category === 'cosmetics' && <CreamJar id={id} />}
        {product.category === 'prerolls' && <PrerollTin id={id} accent={accent} />}
        {product.category === 'tea' && <TeaBox id={id} accent={accent} />}
      </svg>
    </div>
  )
}

const Label = ({ y = 150, id }: { y?: number; id: string }) => (
  <g>
    <rect x="52" y={y} width="96" height="42" rx="6" fill="#0d1f16" />
    <rect x="52" y={y} width="96" height="42" rx="6" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.2" />
    <path
      d="M100 155c1.2 3 1.6 6 .9 9 2.2-2.3 4.6-3.5 7.6-3.6-2 2.4-3.8 3.9-6.8 4.7 3 0 5.4 1 7.7 3-3 .5-5.4 0-7.8-1.3 2 1.9 3.1 3.9 3.6 6.6-2.3-1.1-3.9-2.6-5-4.9v4.4h-.9v-4.4c-1.1 2.3-2.7 3.8-5 4.9.5-2.7 1.6-4.7 3.6-6.6-2.4 1.3-4.8 1.8-7.8 1.3 2.3-2 4.7-3 7.7-3-3-.8-4.8-2.3-6.8-4.7 3 .1 5.4 1.3 7.6 3.6-.7-3-.3-6 .9-9z"
      fill="#c9a96e"
    />
    <text x="100" y="185" textAnchor="middle" fontFamily="Manrope, sans-serif" fontSize="7" fontWeight="700" letterSpacing="2" fill="#e6f2e1">
      VERDANT
    </text>
  </g>
)

function FlowerJar({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      {/* lid */}
      <rect x="48" y="28" width="104" height="22" rx="8" fill="#0d1f16" />
      <rect x="48" y="28" width="104" height="22" rx="8" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      {/* jar body */}
      <rect x="40" y="48" width="120" height="176" rx="20" fill={`url(#g-${id})`} opacity="0.95" />
      {/* buds */}
      {[
        [70, 90, 22],
        [104, 80, 26],
        [130, 104, 20],
        [78, 124, 24],
        [118, 130, 18],
        [98, 108, 16],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={accent} />
          <circle cx={x} cy={y} r={r} fill="url(#buds)" />
          {Array.from({ length: 6 }).map((_, k) => {
            const a = (k / 6) * Math.PI * 2
            return (
              <circle key={k} cx={x + Math.cos(a) * r * 0.55} cy={y + Math.sin(a) * r * 0.55} r={r * 0.32} fill="#2e6b3f" opacity="0.7" />
            )
          })}
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#e6f2e1" opacity="0.55" />
        </g>
      ))}
      {/* glass reflection */}
      <rect x="40" y="48" width="120" height="176" rx="20" fill={`url(#glass-${id})`} />
      <Label id={id} />
    </g>
  )
}

function DropperBottle({ id }: { id: string }) {
  return (
    <g>
      {/* pipette bulb */}
      <rect x="84" y="10" width="32" height="26" rx="10" fill="#0d1f16" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      <rect x="80" y="34" width="40" height="18" rx="4" fill="#14381f" />
      {/* neck */}
      <rect x="86" y="50" width="28" height="18" fill="#1c4d2e" />
      {/* bottle */}
      <path d="M62 78c0-8 8-12 18-12h40c10 0 18 4 18 12v130c0 8-8 14-18 14H80c-10 0-18-6-18-14z" fill="#14381f" />
      <path d="M62 78c0-8 8-12 18-12h40c10 0 18 4 18 12v130c0 8-8 14-18 14H80c-10 0-18-6-18-14z" fill={`url(#liquid-${id})`} opacity="0.85" />
      <path d="M62 78c0-8 8-12 18-12h40c10 0 18 4 18 12v130c0 8-8 14-18 14H80c-10 0-18-6-18-14z" fill={`url(#glass-${id})`} />
      {/* inner pipette */}
      <rect x="97" y="52" width="6" height="150" rx="3" fill="#e6f2e1" opacity="0.45" />
      <Label id={id} y={130} />
      <ellipse cx="100" cy="226" rx="30" ry="4" fill="#000" opacity="0.25" />
    </g>
  )
}

function GummyJar({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <rect x="44" y="24" width="112" height="20" rx="6" fill="#0d1f16" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      <rect x="36" y="44" width="128" height="180" rx="26" fill={`url(#g-${id})`} />
      {[
        [66, 80],
        [100, 72],
        [134, 84],
        [72, 118],
        [108, 108],
        [136, 124],
        [60, 150],
        [96, 142],
        [128, 160],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 37) % 360})`}>
          <path d="M-12 -4c0-7 6-10 12-10s12 3 12 10v10c0 7-6 10-12 10s-12-3-12-10z" fill={i % 3 === 0 ? '#c9a96e' : accent} opacity="0.92" />
          <path d="M-8 -6c2-3 6-4 10-3" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" fill="none" />
        </g>
      ))}
      <rect x="36" y="44" width="128" height="180" rx="26" fill={`url(#glass-${id})`} />
      <Label id={id} y={176} />
    </g>
  )
}

function CreamJar({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx="100" cy="222" rx="60" ry="6" fill="#000" opacity="0.25" />
      {/* lid */}
      <rect x="36" y="60" width="128" height="40" rx="14" fill="#0d1f16" />
      <rect x="36" y="60" width="128" height="40" rx="14" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      <ellipse cx="100" cy="62" rx="64" ry="10" fill="#14381f" />
      <ellipse cx="100" cy="62" rx="64" ry="10" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.2" />
      {/* jar body */}
      <path d="M40 100h120v96c0 14-10 22-24 22H64c-14 0-24-8-24-22z" fill={`url(#g-${id})`} />
      <path d="M40 100h120v96c0 14-10 22-24 22H64c-14 0-24-8-24-22z" fill={`url(#glass-${id})`} />
      <Label id={id} y={140} />
    </g>
  )
}

function PrerollTin({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <rect x="30" y="50" width="140" height="150" rx="14" fill="#0d1f16" />
      <rect x="30" y="50" width="140" height="150" rx="14" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      <rect x="40" y="60" width="120" height="130" rx="10" fill="#14381f" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${52 + i * 22} 70)`}>
          <rect x="0" y="0" width="14" height="112" rx="7" fill="#f3f8f0" />
          <rect x="0" y="86" width="14" height="26" rx="7" fill="#c9a96e" />
          <rect x="2" y="0" width="10" height="14" rx="5" fill={accent} />
        </g>
      ))}
      <rect x="30" y="50" width="140" height="150" rx="14" fill={`url(#glass-${id})`} opacity="0.5" />
      <Label id={id} y={204} />
    </g>
  )
}

function TeaBox({ id, accent }: { id: string; accent: string }) {
  return (
    <g>
      <rect x="40" y="40" width="120" height="176" rx="12" fill="#14381f" />
      <rect x="40" y="40" width="120" height="176" rx="12" fill="none" stroke={`url(#gold-${id})`} strokeWidth="1.5" />
      <rect x="48" y="48" width="104" height="90" rx="8" fill={`url(#g-${id})`} />
      {/* steam cup */}
      <path d="M74 110h44v10c0 10-8 16-22 16s-22-6-22-16z" fill={accent} />
      <path d="M118 114h8c6 0 8 8 2 12l-10 2" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      <path d="M86 92c-4 6 4 8 0 14M96 88c-4 6 4 8 0 14M106 92c-4 6 4 8 0 14" fill="none" stroke="#2e6b3f" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <Label id={id} y={156} />
    </g>
  )
}
