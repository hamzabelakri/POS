import { cn } from '@/lib/utils'

/** Soft corner glows. Parent needs `bg-banner relative overflow-hidden`. */
export function BannerGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden='true'
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <div className='absolute -end-20 -top-24 size-80 rounded-full bg-teal-400/15 blur-3xl' />
      <div className='absolute -bottom-24 -start-16 size-72 rounded-full bg-amber-400/10 blur-3xl' />
    </div>
  )
}