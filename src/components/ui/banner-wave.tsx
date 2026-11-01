import { cn } from '@/lib/utils'

/**
 * Decorative wave for banner surfaces.
 * Parent needs `bg-banner relative overflow-hidden`, and its content
 * needs `relative z-10` so it sits above the wave.
 */
export function BannerWave({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full opacity-10 rtl:-scale-x-100',
        className
      )}
      preserveAspectRatio='none'
      viewBox='0 0 1200 200'
    >
      <path
        d='M0,80 C300,150 600,20 900,100 C1050,140 1150,60 1200,80 L1200,200 L0,200 Z'
        fill='white'
      />
      <path
        d='M0,120 C200,60 500,160 800,90 C1000,50 1100,120 1200,100 L1200,200 L0,200 Z'
        fill='white'
        opacity='0.5'
      />
    </svg>
  )
}