import { cn } from '@/lib/utils'

/**
 * Decorative dotted grid that fades out toward the edges.
 * Parent needs `relative overflow-hidden`, and its content
 * needs `relative` (or `relative z-10`) so it sits above the dots.
 */
export function PanelDots({ className }: { className?: string }) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 opacity-[0.14]',
        '[background-image:radial-gradient(white_1px,transparent_1px)]',
        '[background-size:22px_22px]',
        '[mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]',
        className
      )}
    />
  )
}