import { cn } from '@/lib/utils'

/** Faint grid texture + soft glow blobs. Parent needs `bg-banner relative overflow-hidden`. */
export function BannerGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden='true'
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <div
        className='absolute inset-0'
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className='absolute -bottom-24 -left-16 size-72 rounded-full bg-emerald-400/10 blur-3xl' />
      <div className='absolute -top-24 -right-16 size-72 rounded-full bg-teal-300/10 blur-3xl' />
    </div>
  )
}