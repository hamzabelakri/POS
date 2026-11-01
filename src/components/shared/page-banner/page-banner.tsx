import type {
  ComponentProps,
  ComponentType,
  CSSProperties,
  ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { BannerGrid } from '@/components/ui/banner-grid'

type Tone = 'positive' | 'negative' | 'neutral'

export interface BannerStat {
  label: ReactNode
  value: ReactNode
  /** Color of the value */
  tone?: Tone
  /** Small line under the value, e.g. "+1.8% 24h" or "stable" */
  sub?: ReactNode
  /** Color of the sub line; defaults to muted */
  subTone?: Tone
}

export interface BannerBadge {
  label: ReactNode
  icon?: ComponentType<{ className?: string }>
  /** Renders a pulsing red dot instead of an icon */
  live?: boolean
}

export interface PageBannerProps {
  title: ReactNode
  icon?: ComponentType<{ className?: string }>
  description?: ReactNode
  hint?: ReactNode
  /** Pill badges shown above the title */
  badges?: BannerBadge[]
  action?: ReactNode
  stats?: BannerStat[]
  loading?: boolean
  embedded?: boolean
  className?: string
}

const valueTone: Record<Tone, string> = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-white',
}

const subToneClass: Record<Tone, string> = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-white/50',
}

export function PageBanner({
  title,
  icon: Icon,
  description,
  hint,
  badges,
  action,
  stats,
  loading = false,
  embedded = false,
  className,
}: PageBannerProps) {
  const count = stats?.length ?? 0

  return (
    <div
      className={cn(
        'bg-banner relative overflow-hidden p-5 sm:p-8',
        embedded ? 'rounded-none' : 'rounded-[var(--radius-card-lg)]',
        className
      )}
    >
      <BannerGrid />

      <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
        {/* Left: badges, title, actions */}
        <div className='min-w-0 space-y-4'>
          {badges && badges.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {badges.map((b, i) => (
                <BannerPill key={i} {...b} />
              ))}
            </div>
          )}

          <div className='flex items-center gap-3'>
            {Icon && (
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-900/30'>
                <Icon className='size-5' aria-hidden='true' />
              </div>
            )}
            <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
              {title}
            </h1>
          </div>

          {description && (
            <p className='text-white/70 [&_b]:font-semibold [&_b]:text-white [&_strong]:font-semibold [&_strong]:text-white'>
              {description}
            </p>
          )}
          {hint && <p className='text-sm text-white/50'>{hint}</p>}

          {action && <div className='flex flex-wrap gap-2'>{action}</div>}
        </div>

        {/* Right: stats grid (3 columns, wraps to extra rows) */}
        {count > 0 && (
          <div
            className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[400px] lg:shrink-0'
            style={{ '--cols': Math.min(count, 3) } as CSSProperties}
          >
            {stats!.map((stat, i) => (
              <BannerStatTile key={i} loading={loading} {...stat} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BannerPill({ label, icon: Icon, live }: BannerBadge) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm'>
      {live ? (
        <span className='relative flex size-1.5'>
          <span className='absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75' />
          <span className='relative inline-flex size-1.5 rounded-full bg-rose-500' />
        </span>
      ) : (
        Icon && <Icon className='size-3.5' aria-hidden='true' />
      )}
      {label}
    </span>
  )
}

function BannerStatTile({
  label,
  value,
  tone = 'neutral',
  sub,
  subTone = 'neutral',
  loading,
}: BannerStat & { loading?: boolean }) {
  return (
    <div className='flex min-w-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center backdrop-blur-sm'>
      <span className='w-full truncate text-[10px] font-medium tracking-wider text-white/50 uppercase'>
        {label}
      </span>
      {loading ? (
        <span className='mt-1.5 h-5 w-10 animate-pulse rounded bg-white/20' />
      ) : (
        <>
          <span
            className={cn(
              'mt-1 text-lg leading-tight font-bold tabular-nums',
              valueTone[tone]
            )}
          >
            {value}
          </span>
          {sub && (
            <span className={cn('mt-0.5 text-[11px]', subToneClass[subTone])}>
              {sub}
            </span>
          )}
        </>
      )}
    </div>
  )
}

/** Solid primary or glass button for the banner's action area */
export function PageBannerButton({
  variant = 'glass',
  className,
  children,
  ...props
}: ComponentProps<'button'> & { variant?: 'primary' | 'glass' }) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition',
        variant === 'primary'
          ? 'bg-emerald-500 shadow-md shadow-emerald-900/30 hover:bg-emerald-400'
          : 'border border-white/10 bg-white/10 backdrop-blur-sm hover:bg-white/20',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

/** Glass link, unchanged from the original */
export function PageBannerLink({
  children,
  className,
  ...props
}: ComponentProps<'a'>) {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-2 rounded-[var(--radius-card-sm)] bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/25',
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}